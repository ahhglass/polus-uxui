<script lang="ts">
	import { type Snippet, onMount } from 'svelte';
	import { motionValue, animate } from 'motion';
	import SoundOff from '$lib/icons/SoundOff.svelte';
	import SoundHigh from '$lib/icons/SoundHigh.svelte';

	type Props = {
		value?: number;
		startingValue?: number;
		maxValue?: number;
		class?: string;
		isStepped?: boolean;
		stepSize?: number;
		disabled?: boolean;
		showValue?: boolean;
		variant?: 'default' | 'inline';
		/** CSS-ширина контейнера: `180`, `'180px'`, `'12rem'` */
		width?: string | number;
		onRelease?: () => void;
		onChange?: (value: number) => void;
		leftIcon?: Snippet;
		rightIcon?: Snippet;
	};

	let {
		value = $bindable(50),
		startingValue = 0,
		maxValue = 100,
		class: className = '',
		isStepped = false,
		stepSize = 1,
		disabled = false,
		showValue = true,
		variant = 'default',
		width,
		onRelease,
		onChange,
		leftIcon,
		rightIcon
	}: Props = $props();

	const MAX_OVERFLOW = 50;

	let region: 'left' | 'middle' | 'right' = 'middle';
	let sliderRef: HTMLDivElement;
	let trackWrapperEl: HTMLDivElement;
	let leftIconEl: HTMLDivElement;
	let rightIconEl: HTMLDivElement;
	let leftIconInner: HTMLDivElement;
	let rightIconInner: HTMLDivElement;
	let outerEl: HTMLDivElement;

	const clientX = motionValue(0);
	const overflow = motionValue(0);
	const scale = motionValue(1);

	function decay(v: number, max: number): number {
		if (max === 0) return 0;
		const entry = v / max;
		const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
		return sigmoid * max;
	}

	function applyTransforms() {
		if (!sliderRef || !trackWrapperEl || !outerEl) return;
		const o = overflow.get();
		const s = scale.get();
		const cx = clientX.get();
		const { left, width } = sliderRef.getBoundingClientRect();

		const opacity = 0.7 + ((s - 1) / 0.2) * 0.3;
		outerEl.style.transform = `scale(${s})`;
		outerEl.style.opacity = String(opacity);

		const sx = 1 + o / Math.max(width, 1);
		const sy = 1 + (Math.min(o, MAX_OVERFLOW) / MAX_OVERFLOW) * (0.8 - 1);
		const origin = cx < left + width / 2 ? 'right' : 'left';
		const height = 6 + ((s - 1) / 0.2) * 6;
		const margin = ((s - 1) / 0.2) * -3;
		trackWrapperEl.style.transform = `scaleX(${sx}) scaleY(${sy})`;
		trackWrapperEl.style.transformOrigin = origin;
		trackWrapperEl.style.height = `${height}px`;
		trackWrapperEl.style.marginTop = `${margin}px`;
		trackWrapperEl.style.marginBottom = `${margin}px`;

		const leftX = region === 'left' ? -o / Math.max(s, 0.0001) : 0;
		const rightX = region === 'right' ? o / Math.max(s, 0.0001) : 0;
		if (leftIconEl) leftIconEl.style.transform = `translateX(${leftX}px)`;
		if (rightIconEl) rightIconEl.style.transform = `translateX(${rightX}px)`;
	}

	function pulseIcon(el: HTMLElement) {
		el.animate(
			[{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }, { transform: 'scale(1)' }],
			{ duration: 250, easing: 'ease-out' }
		);
	}

	onMount(() => {
		const unsubs = [
			overflow.on('change', applyTransforms),
			scale.on('change', applyTransforms),
			clientX.on('change', (latest: number) => {
				if (!sliderRef) return;
				const { left, right } = sliderRef.getBoundingClientRect();
				let newOverflow: number;
				if (latest < left) {
					if (region !== 'left' && leftIconInner) pulseIcon(leftIconInner);
					region = 'left';
					newOverflow = left - latest;
				} else if (latest > right) {
					if (region !== 'right' && rightIconInner) pulseIcon(rightIconInner);
					region = 'right';
					newOverflow = latest - right;
				} else {
					region = 'middle';
					newOverflow = 0;
				}
				overflow.jump(decay(newOverflow, MAX_OVERFLOW));
				applyTransforms();
			})
		];
		applyTransforms();
		return () => unsubs.forEach((u) => u());
	});

	function onPointerMove(e: PointerEvent) {
		if (disabled) return;
		if (e.buttons > 0 && sliderRef) {
			const { left, width } = sliderRef.getBoundingClientRect();
			let newValue = startingValue + ((e.clientX - left) / width) * (maxValue - startingValue);
			if (isStepped) newValue = Math.round(newValue / stepSize) * stepSize;
			newValue = Math.min(Math.max(newValue, startingValue), maxValue);
			if (newValue !== value) {
				value = newValue;
				onChange?.(newValue);
			}
			clientX.jump(e.clientX);
		}
	}
	function onPointerDown(e: PointerEvent) {
		if (disabled) return;
		onPointerMove(e);
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onPointerUp() {
		animate(overflow, 0, { type: 'spring', bounce: 0.5 });
		onRelease?.();
	}
	function onEnter() {
		if (disabled) return;
		animate(scale, 1.2);
	}
	function onLeave() {
		if (disabled) return;
		animate(scale, 1);
	}

	const rangePercentage = $derived(
		((value - startingValue) / Math.max(1e-6, maxValue - startingValue)) * 100
	);

	const containerWidth = $derived(
		width == null ? undefined : typeof width === 'number' ? `${width}px` : width
	);
</script>

<div
	class="slider-container {className}"
	class:slider-container--disabled={disabled}
	class:slider-container--inline={variant === 'inline'}
	class:slider-container--fixed={width != null}
	style:width={containerWidth}
>
	<div
		bind:this={outerEl}
		class="slider-wrapper"
		onmouseenter={onEnter}
		onmouseleave={onLeave}
		ontouchstart={onEnter}
		ontouchend={onLeave}
		role="presentation"
	>
		<div bind:this={leftIconEl} class="slider-icon">
			<div bind:this={leftIconInner} class="slider-icon-inner">
				{#if leftIcon}{@render leftIcon()}{:else}<SoundOff size={24} />{/if}
			</div>
		</div>
		<div
			bind:this={sliderRef}
			class="slider-root"
			onpointermove={onPointerMove}
			onpointerdown={onPointerDown}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			onlostpointercapture={onPointerUp}
			role="slider"
			aria-valuemin={startingValue}
			aria-valuemax={maxValue}
			aria-valuenow={value}
			aria-disabled={disabled}
			tabindex={disabled ? -1 : 0}
		>
			<div bind:this={trackWrapperEl} class="slider-track-wrapper">
				<div class="slider-track">
					<div class="slider-range" style="width:{rangePercentage}%;"></div>
				</div>
			</div>
		</div>
		<div bind:this={rightIconEl} class="slider-icon">
			<div bind:this={rightIconInner} class="slider-icon-inner">
				{#if rightIcon}{@render rightIcon()}{:else}<SoundHigh size={24} />{/if}
			</div>
		</div>
	</div>
	{#if showValue}
		<p class="value-indicator">{Math.round(value)}</p>
	{/if}
</div>

<style>
	.slider-container {
		--slider-icon-color: #888;
		--slider-track-color: rgba(128, 128, 128, 0.4);
		--slider-fill-color: #888;
		--slider-value-color: #808080;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		width: 12rem;
	}

	.slider-container--disabled {
		opacity: 0.45;
		pointer-events: none;
	}

	.slider-container--inline {
		flex: 1;
		flex-direction: row;
		align-items: center;
		min-width: 0;
		width: auto;
		gap: 0.5rem;
	}

	.slider-container--inline.slider-container--fixed {
		flex: 0 0 auto;
		min-width: unset;
	}

	.slider-container--inline .slider-wrapper {
		flex: 1;
		min-width: 0;
		gap: 0.5rem;
		opacity: 1;
	}

	.slider-container--inline .slider-root {
		max-width: none;
		padding: 0.625rem 0;
	}

	.slider-container--inline .slider-icon :global(svg) {
		width: 18px;
		height: 18px;
	}
	.slider-wrapper {
		display: flex;
		width: 100%;
		touch-action: none;
		user-select: none;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		opacity: 0.7;
	}
	.slider-icon {
		color: var(--slider-icon-color);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.slider-icon-inner {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.slider-root {
		position: relative;
		display: flex;
		width: 100%;
		max-width: 200px;
		flex-grow: 1;
		cursor: grab;
		touch-action: none;
		user-select: none;
		align-items: center;
		padding: 1rem 0;
	}
	.slider-root:active {
		cursor: grabbing;
	}
	.slider-track-wrapper {
		display: flex;
		flex-grow: 1;
		height: 6px;
	}
	.slider-track {
		position: relative;
		height: 100%;
		flex-grow: 1;
		overflow: hidden;
		border-radius: 9999px;
		background-color: var(--slider-track-color);
	}
	.slider-range {
		position: absolute;
		height: 100%;
		background-color: var(--slider-fill-color);
		border-radius: 9999px;
	}
	.value-indicator {
		color: var(--slider-value-color);
		position: absolute;
		transform: translateY(-1rem);
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.05em;
	}
</style>

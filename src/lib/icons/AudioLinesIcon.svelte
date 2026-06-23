<script lang="ts">
	type Props = {
		isPlaying?: boolean;
		class?: string;
	};

	const BARS = [
		{ d: 'M6 6v11', origin: '6px 12px', duration: 1500, min: 0.5, max: 1.5 },
		{ d: 'M10 3v18', origin: '10px 12px', duration: 1000, min: 0.2, max: 1.3 },
		{ d: 'M14 8v7', origin: '14px 12px', duration: 800, min: 0.1, max: 1.2 },
		{ d: 'M18 5v13', origin: '18px 12px', duration: 1500, min: 0.1, max: 1.2 }
	] as const;

	let { isPlaying = false, class: className = '' }: Props = $props();

	let hovering = $state(false);
	const animated = $derived(isPlaying || hovering);
</script>

<div
	class="audio-lines {className}"
	class:audio-lines--active={animated}
	role="img"
	aria-label={isPlaying ? 'Музыка играет' : 'Музыкальный индикатор'}
	onmouseenter={() => (hovering = true)}
	onmouseleave={() => (hovering = false)}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		shape-rendering="geometricPrecision"
		aria-hidden="true"
	>
		<path d="M2 10v3" />
		{#each BARS as bar (bar.d)}
			<path
				class="audio-lines__bar"
				class:audio-lines__bar--active={animated}
				d={bar.d}
				style:transform-origin={bar.origin}
				style:--bar-min={bar.min}
				style:--bar-max={bar.max}
				style:--bar-dur="{bar.duration}ms"
			/>
		{/each}
		<path d="M22 10v3" />
	</svg>
</div>

<style>
	.audio-lines {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 0.375rem;
		color: inherit;
		cursor: pointer;
		user-select: none;
		transition:
			background-color 200ms ease,
			color 200ms ease;
	}

	.audio-lines:hover {
		background: color-mix(in srgb, var(--color-canvas) 20%, transparent);
	}

	.audio-lines__bar {
		transform: scaleY(1);
	}

	.audio-lines__bar--active {
		animation: audio-bar-pulse var(--bar-dur, 1s) linear infinite alternate;
	}

	@keyframes audio-bar-pulse {
		from {
			transform: scaleY(1);
		}
		to {
			transform: scaleY(var(--bar-min, 0.2));
		}
	}

	.audio-lines--active .audio-lines__bar:nth-child(3) {
		animation-delay: 0.05s;
	}

	.audio-lines--active .audio-lines__bar:nth-child(4) {
		animation-delay: 0.1s;
	}

	.audio-lines--active .audio-lines__bar:nth-child(5) {
		animation-delay: 0.15s;
	}

	.audio-lines--active .audio-lines__bar:nth-child(6) {
		animation-delay: 0.08s;
	}
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';

	const nextFilterId = (() => {
		let n = 0;
		return () => `glass-lens-${++n}`;
	})();

	type Props = {
		children: Snippet;
		class?: string;
		contentClass?: string;
		/** Полупрозрачный фон стекла */
		overlay?: string;
		/** Блик на кромке */
		highlight?: string;
		/** Сила backdrop-blur слоя filter */
		blur?: string;
		/** SVG lens-искажение (liquid glass) */
		lens?: boolean;
	};

	let {
		children,
		class: className = '',
		contentClass = '',
		overlay = 'rgba(255, 255, 255, 0.08)',
		highlight = 'rgba(255, 255, 255, 0.15)',
		blur = '2px',
		lens = true
	}: Props = $props();

	const filterId = nextFilterId();
</script>

<div
	class="glass-panel {className}"
	style:--glass-overlay={overlay}
	style:--glass-highlight={highlight}
	style:--glass-blur={blur}
>
	{#if lens}
		<svg class="glass-panel__defs" aria-hidden="true" focusable="false">
			<defs>
				<filter
					id={filterId}
					x="0%"
					y="0%"
					width="100%"
					height="100%"
					filterUnits="objectBoundingBox"
				>
					<feComponentTransfer in="SourceAlpha" result="alpha">
						<feFuncA type="identity" />
					</feComponentTransfer>
					<feGaussianBlur in="alpha" stdDeviation="50" result="blur" />
					<feDisplacementMap
						in="SourceGraphic"
						in2="blur"
						scale="50"
						xChannelSelector="A"
						yChannelSelector="A"
					/>
				</filter>
			</defs>
		</svg>
	{/if}

	<div
		class="glass-panel__filter"
		style:filter={lens ? `url(#${filterId}) saturate(120%) brightness(1.12)` : undefined}
	></div>
	<div class="glass-panel__overlay"></div>
	<div class="glass-panel__specular"></div>
	<div class="glass-panel__content {contentClass}">
		{@render children()}
	</div>
</div>

<style>
	.glass-panel {
		position: relative;
		display: flex;
		overflow: hidden;
		border-radius: 2rem;
		background: transparent;
		box-shadow:
			0 6px 6px rgba(7, 13, 13, 0.02),
			0 0 24px rgba(7, 13, 13, 0.08);
		transition: box-shadow var(--duration-normal) var(--ease-smooth);
	}

	.glass-panel__defs {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
	}

	.glass-panel__filter,
	.glass-panel__overlay,
	.glass-panel__specular {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
	}

	.glass-panel__filter {
		z-index: 0;
		backdrop-filter: blur(var(--glass-blur, 4px));
		-webkit-backdrop-filter: blur(var(--glass-blur, 4px));
	}

	.glass-panel__overlay {
		z-index: 1;
		background: var(--glass-overlay, rgba(255, 255, 255, 0.12));
	}

	.glass-panel__specular {
		z-index: 2;
		box-shadow:
			inset 1px 1px 0 var(--glass-highlight, rgba(255, 255, 255, 0.55)),
			inset 0 0 5px var(--glass-highlight, rgba(255, 255, 255, 0.55));
	}

	.glass-panel__content {
		position: relative;
		z-index: 3;
		width: 100%;
	}
</style>

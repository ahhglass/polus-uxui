<script lang="ts">
	interface Props {
		color: string;
		size: number;
		style: { top: string; left: string };
	}

	let { color, size, style }: Props = $props();
</script>

<div class="sparkle" style="top: {style.top}; left: {style.left};">
	<svg
		width={size}
		height={size}
		viewBox="0 0 160 160"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
			fill={color}
		/>
	</svg>
</div>

<style>
	.sparkle {
		position: absolute;
		pointer-events: none;
		display: flex;
		z-index: 2;
		animation: sparkle-grow 900ms ease-in-out forwards;
	}

	.sparkle svg {
		animation: sparkle-spin 900ms linear forwards;
	}

	@media (prefers-reduced-motion: reduce) {
		.sparkle {
			animation: none;
			transform: scale(1);
			opacity: 1;
		}

		.sparkle svg {
			animation: none;
			transform: rotate(180deg);
		}
	}

	@keyframes sparkle-grow {
		0% {
			transform: scale(0);
		}
		50% {
			transform: scale(1);
		}
		100% {
			transform: scale(0);
		}
	}

	@keyframes sparkle-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(180deg);
		}
	}
</style>

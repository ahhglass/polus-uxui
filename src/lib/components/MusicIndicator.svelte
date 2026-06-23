<script lang="ts">
	import { fly } from 'svelte/transition';
	import AudioLinesIcon from '$lib/icons/AudioLinesIcon.svelte';
	import { ambient, musicPrefs } from '$lib';

	const trackName = $derived(ambient.currentTrackName());
	const visible = $derived(musicPrefs.enabled && ambient.currentTrackId !== null);
</script>

{#if visible}
	<div class="music-indicator" in:fly={{ y: 16, duration: 320 }} out:fly={{ y: 16, duration: 240 }}>
		<div class="music-indicator__container">
			<div class="music-indicator__icon">
				<AudioLinesIcon isPlaying={ambient.isPlaying} />
			</div>
			{#if trackName}
				<div class="music-indicator__tooltip">
					<span class="music-indicator__track">{trackName}</span>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.music-indicator {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 100;
	}

	.music-indicator__container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.music-indicator__icon {
		color: color-mix(in srgb, var(--color-canvas) 55%, transparent);
		transition: color 0.3s ease;
		mix-blend-mode: difference;
	}

	.music-indicator__container:hover .music-indicator__icon {
		color: var(--color-canvas);
	}

	.music-indicator__tooltip {
		position: absolute;
		right: calc(100% + 0.75rem);
		white-space: nowrap;
		padding: 0.5rem 0.75rem;
		border: 1px solid color-mix(in srgb, var(--color-text) 12%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--color-canvas) 92%, transparent);
		backdrop-filter: blur(8px);
		font-size: 0.75rem;
		color: color-mix(in srgb, var(--color-text) 70%, transparent);
		box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
		pointer-events: none;
		opacity: 0;
		transform: translateX(10px);
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;
	}

	.music-indicator__container:hover .music-indicator__tooltip {
		opacity: 1;
		transform: translateX(0);
	}

	.music-indicator__tooltip::after {
		content: '';
		position: absolute;
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		border: 6px solid transparent;
		border-left-color: color-mix(in srgb, var(--color-canvas) 92%, transparent);
	}

	.music-indicator__tooltip::before {
		content: '';
		position: absolute;
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		border: 7px solid transparent;
		border-left-color: color-mix(in srgb, var(--color-text) 12%, transparent);
		z-index: -1;
	}

	.music-indicator__track {
		display: block;
	}

	@media (max-width: 768px) {
		.music-indicator {
			right: 1.25rem;
			bottom: 1.25rem;
		}
	}
</style>

<script lang="ts">
	import { Icon, pageTitle } from '$lib';

	import {
		ElasticSlider,
		sfx,
		soundPrefs,
		musicPrefs,
		ambient,
		AMBIENT_TRACKS,
		type AmbientTrackId
	} from '$lib';

	// loadPrefs() уже отработал при импорте sound.svelte.ts
	let uiVolumePct = $state(Math.round(soundPrefs.volume * 100));
	let musicVolumePct = $state(Math.round(musicPrefs.volume * 100));

	const sliderTheme =
		'[--slider-icon-color:var(--color-text)] [--slider-track-color:color-mix(in_srgb,var(--color-text)_12%,transparent)] [--slider-fill-color:var(--color-text)] [--slider-value-color:var(--color-text)]';

	const handleUiVolumeChange = (pct: number) => {
		sfx.setVolume(pct / 100);
	};

	const handleMusicVolumeChange = (pct: number) => {
		ambient.setVolume(pct / 100);
	};

	const handleUiToggle = () => {
		sfx.unlock();
		sfx.setEnabled(!soundPrefs.enabled);
		if (soundPrefs.enabled) sfx.play('click');
	};

	const handleMusicToggle = () => {
		sfx.unlock();
		ambient.unlock();
		ambient.setEnabled(!musicPrefs.enabled);
		if (musicPrefs.enabled) sfx.play('click');
	};

	const handleTrackSelect = (trackId: AmbientTrackId) => {
		sfx.unlock();
		ambient.unlock();
		ambient.toggleTrack(trackId);
		if (musicPrefs.enabled) sfx.play('click');
	};

	const handleUiVolumeEnd = () => {
		if (soundPrefs.enabled) sfx.play('click');
	};

	const handleMusicVolumeEnd = () => {
		if (musicPrefs.enabled) sfx.play('click');
	};
</script>

<svelte:head>
	<title>{pageTitle('Настройки')}</title>
	<meta name="description" content="Настройки звука и интерфейса сайта." />
</svelte:head>

<div class="min-h-dvh px-4 pb-16 pt-24 md:px-6 md:pt-28">
	<header class="mx-auto max-w-3xl text-center">
		<h1 class="text-6xl font-bold tracking-tight text-white mix-blend-difference md:text-8xl">
			Настройки
		</h1>
		<p class="mx-auto mt-5 max-w-xl text-lg text-white mix-blend-difference md:text-xl">
			Звук, громкость и параметры интерфейса — всё в одном месте.
		</p>
	</header>

	<article
		class="mx-auto mt-12 max-w-4xl rounded-2xl border border-white/25 bg-[var(--color-canvas)]/92 p-6 backdrop-blur-md md:p-10"
	>
		<section aria-labelledby="audio-heading">
			<div class="flex items-baseline justify-between gap-4">
				<h2
					id="audio-heading"
					class="text-2xl font-semibold tracking-tight text-[var(--color-text)]"
				>
					Звук и аудио
				</h2>
				<span class="text-xs font-medium uppercase tracking-widest text-[var(--color-text)]/45">
					Аудио
				</span>
			</div>

			<div class="mt-8 space-y-8">
				<!-- UI sounds -->
				<div class="setting-block">
					<div class="setting-block__head">
						<div>
							<h3 class="setting-block__title">UI звуки</h3>
							<p class="setting-block__desc">Клики, hover, меню, слайдеры</p>
						</div>
						<button
							type="button"
							class="setting-toggle"
							role="switch"
							aria-checked={soundPrefs.enabled}
							aria-label="Включить или выключить UI звуки"
							onclick={handleUiToggle}
						>
							<span
								class="setting-toggle__track"
								class:setting-toggle__track--on={soundPrefs.enabled}
							>
								<span class="setting-toggle__thumb"></span>
							</span>
							<span class="setting-toggle__label">{soundPrefs.enabled ? 'Вкл' : 'Выкл'}</span>
						</button>
					</div>

					<div class="setting-block__slider">
						<span class="setting-block__volume-label">Громкость UI</span>
						<ElasticSlider
							class={sliderTheme}
							variant="inline"
							width={450}
							bind:value={uiVolumePct}
							startingValue={0}
							maxValue={100}
							isStepped={true}
							stepSize={1}
							showValue={false}
							disabled={!soundPrefs.enabled}
							onChange={handleUiVolumeChange}
							onRelease={handleUiVolumeEnd}
						/>
						<span class="setting-block__volume-value">{uiVolumePct}%</span>
					</div>
				</div>

				<hr class="border-[var(--color-text)]/10" />

				<!-- Background music -->
				<div class="setting-block">
					<div class="setting-block__head">
						<div>
							<h3 class="setting-block__title">Фоновая музыка</h3>
							<p class="setting-block__desc">Ambient-трек на фоне сайта</p>
						</div>
						<button
							type="button"
							class="setting-toggle"
							role="switch"
							aria-checked={musicPrefs.enabled}
							aria-label="Включить или выключить фоновую музыку"
							onclick={handleMusicToggle}
						>
							<span
								class="setting-toggle__track"
								class:setting-toggle__track--on={musicPrefs.enabled}
							>
								<span class="setting-toggle__thumb"></span>
							</span>
							<span class="setting-toggle__label">{musicPrefs.enabled ? 'Вкл' : 'Выкл'}</span>
						</button>
					</div>

					<div class="setting-block__slider">
						<span class="setting-block__volume-label">Громкость</span>
						<ElasticSlider
							class={sliderTheme}
							variant="inline"
							width={450}
							bind:value={musicVolumePct}
							startingValue={0}
							maxValue={100}
							isStepped={true}
							stepSize={1}
							showValue={false}
							disabled={!musicPrefs.enabled}
							onChange={handleMusicVolumeChange}
							onRelease={handleMusicVolumeEnd}
						/>
						<span class="setting-block__volume-value">{musicVolumePct}%</span>
					</div>

					{#if musicPrefs.enabled}
						<div class="setting-tracks">
							<span class="setting-tracks__label">Трек</span>
							<div class="setting-tracks__list">
								{#each AMBIENT_TRACKS as track (track.id)}
									<button
										type="button"
										class="setting-track"
										class:setting-track--active={ambient.currentTrackId === track.id}
										onclick={() => handleTrackSelect(track.id)}
									>
										<span class="setting-track__name">{track.name}</span>
										{#if ambient.currentTrackId === track.id}
											<span class="setting-track__status" aria-hidden="true">
												{#if ambient.isPlaying}
													<Icon name="playerPlay" size={16} />
												{:else}
													<Icon name="playerStop" size={16} />
												{/if}
											</span>
										{/if}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<hr class="my-10 border-[var(--color-text)]/10" />
	</article>
</div>

<style>
	.setting-block__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.setting-block__title {
		font-size: 1.0625rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.setting-block__desc {
		margin-top: 0.25rem;
		font-size: 0.875rem;
		color: color-mix(in srgb, var(--color-text) 55%, transparent);
	}

	.setting-block__slider {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		column-gap: 0.75rem;
		margin-top: 1.25rem;
		width: 100%;
	}

	.setting-block__volume-label {
		justify-self: start;
		font-size: 0.875rem;
		white-space: nowrap;
		color: color-mix(in srgb, var(--color-text) 70%, transparent);
	}

	.setting-block__slider :global(.slider-container) {
		justify-self: center;
		grid-column: 2;
	}

	.setting-block__volume-value {
		justify-self: end;
		grid-column: 3;
		min-width: 2.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		text-align: right;
		color: var(--color-text);
	}

	@media (max-width: 480px) {
		.setting-block__slider {
			grid-template-columns: 1fr auto;
			row-gap: 0.625rem;
		}

		.setting-block__volume-label {
			grid-column: 1;
			grid-row: 1;
		}

		.setting-block__slider :global(.slider-container) {
			grid-column: 1 / -1;
			grid-row: 2;
			justify-self: stretch;
			width: 100% !important;
		}

		.setting-block__volume-value {
			grid-column: 2;
			grid-row: 1;
		}
	}

	.setting-toggle {
		display: flex;
		flex-shrink: 0;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		cursor: pointer;
		border: none;
		background: none;
		padding: 0;
	}

	.setting-toggle__track {
		position: relative;
		width: 2.75rem;
		height: 1.5rem;
		border-radius: 9999px;
		background: color-mix(in srgb, var(--color-text) 14%, transparent);
		transition: background-color var(--duration-normal) var(--ease-smooth);
	}

	.setting-toggle__track--on {
		background: var(--color-text);
	}

	.setting-toggle__thumb {
		position: absolute;
		top: 0.1875rem;
		left: 0.1875rem;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 9999px;
		background: var(--color-canvas);
		box-shadow: 0 1px 3px rgb(0 0 0 / 18%);
		transition: transform var(--duration-normal) var(--ease-smooth);
	}

	.setting-toggle__track--on .setting-toggle__thumb {
		transform: translateX(1.25rem);
	}

	.setting-toggle__label {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--color-text) 50%, transparent);
	}

	.setting-toggle:focus-visible .setting-toggle__track {
		outline: 2px solid color-mix(in srgb, var(--color-text) 40%, transparent);
		outline-offset: 3px;
	}

	.setting-tracks {
		margin-top: 1.25rem;
	}

	.setting-tracks__label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		color: color-mix(in srgb, var(--color-text) 70%, transparent);
	}

	.setting-tracks__list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.setting-track {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid color-mix(in srgb, var(--color-text) 12%, transparent);
		border-radius: 0.55rem;
		background: color-mix(in srgb, var(--color-canvas) 60%, white);
		font-size: 0.875rem;
		color: color-mix(in srgb, var(--color-text) 65%, transparent);
		text-align: left;
		cursor: pointer;
		transition:
			border-color var(--duration-normal) var(--ease-smooth),
			color var(--duration-normal) var(--ease-smooth),
			background-color var(--duration-normal) var(--ease-smooth);
	}

	.setting-track:hover {
		border-color: color-mix(in srgb, var(--color-text) 28%, transparent);
		color: var(--color-text);
	}

	.setting-track--active {
		border-color: color-mix(in srgb, var(--color-text) 35%, transparent);
		background: color-mix(in srgb, var(--color-canvas) 85%, white);
		color: var(--color-text);
	}

	.setting-track__name {
		flex: 1;
		min-width: 0;
	}

	.setting-track__status {
		flex-shrink: 0;
		font-size: 0.75rem;
		opacity: 0.55;
	}
</style>

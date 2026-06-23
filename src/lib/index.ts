// Здесь мы экспортируем все компоненты, которые будут использоваться в проекте
// Это позволяет нам использовать их в других файлах проекта, например, в компонентах, страницах, шаблонах и т.д.

export { site, pageTitle, type SiteConfig } from './site';
export { default as Icon, type IconName } from './components/Icon.svelte';
export { default as Grainient } from './components/Grainient.svelte';
export {
	default as CardNav,
	type CardNavItem,
	type CardNavLink
} from './components/CardNav.svelte';
export { default as Navbar, type NavbarItem, type NavbarLink } from './components/Navbar.svelte';
export { default as Button } from './components/Button.svelte';
export {
	SOUND_CATALOG,
	sfx,
	sound,
	initSound,
	toggleSound,
	soundPrefs,
	musicPrefs,
	setMusicEnabled,
	setMusicVolume,
	type SoundName,
	type SoundActionOptions
} from './sound.svelte';
export { ambient, AMBIENT_TRACKS, initAmbient, type AmbientTrackId } from './ambient.svelte';
export { default as MusicIndicator } from './components/MusicIndicator.svelte';
export { default as AudioLinesIcon } from './icons/AudioLinesIcon.svelte';
export { default as DomeGallery } from './components/DomeGallery.svelte';
export {
	default as DistortionSlider,
	type DistortionSlide,
	type DistortionSliderConfig,
	type DistortionSliderOrientation,
	DEFAULT_DISTORTION_SLIDES,
	DEFAULT_DISTORTION_CONFIG
} from './components/DistortionSlider.svelte';
export { default as ElasticSlider } from './components/ElasticSlider.svelte';
export { default as MagicBento } from './components/MagicBento.svelte';
export { default as ColorCard } from './components/ColorCard.svelte';

<script lang="ts" module>
	export type IconName =
		| 'sun'
		| 'cloud'
		| 'sparkle'
		| 'cursorClick'
		| 'pin'
		| 'playerPlay'
		| 'playerStop'
		| 'soundHigh'
		| 'soundOff';
</script>

<script lang="ts">
	import Sun from '$lib/icons/Sun.svelte';
	import Cloud from '$lib/icons/Cloud.svelte';
	import Sparkle from '$lib/icons/Sparkle.svelte';
	import CursorClick from '$lib/icons/CursorClick.svelte';
	import Pin from '$lib/icons/Pin.svelte';
	import PlayerPlay from '$lib/icons/PlayerPlay.svelte';
	import PlayerStop from '$lib/icons/PlayerStop.svelte';
	import SoundHigh from '$lib/icons/SoundHigh.svelte';
	import SoundOff from '$lib/icons/SoundOff.svelte';

	const icons = {
		sun: Sun,
		cloud: Cloud,
		sparkle: Sparkle,
		cursorClick: CursorClick,
		pin: Pin,
		playerPlay: PlayerPlay,
		playerStop: PlayerStop,
		soundHigh: SoundHigh,
		soundOff: SoundOff
	} satisfies Record<IconName, typeof Components>;

	interface Props {
		name: IconName;
		size?: number;
		class?: string;
	}

	let { name, size = 20, class: className = '' }: Props = $props();

	const Component = $derived(icons[name]);
</script>

{#if Component}
	<Component {size} class={className} />
{/if}

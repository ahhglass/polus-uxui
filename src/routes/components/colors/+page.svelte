<script lang="ts">
	import { ColorCard, GlassPanel, pageTitle } from '$lib';

	const colors = [
		{ name: 'Black', value: '#000000' },
		{ name: 'Mist', value: '#DBE3E9' },
		{ name: 'Pear', value: '#E1E5AC' },
		{ name: 'Teal', value: '#344C4B' },
		{ name: 'Coral', value: '#F95C4B' },
		{ name: 'Stone', value: '#E4DED2' },
		{ name: 'Berry', value: '#D5A0A8' },
		{ name: 'Canvas', value: '#FBFBF8' },
		{ name: 'Viridian', value: '#344945' },
		{ name: 'Turquoise', value: '#8CBEBF' },
		{ name: 'Watermelon', value: '#E37E7F' },
		{ name: 'Cornflower', value: '#6AA6DA' },
		{ name: 'Linen', value: '#E8DED1' },
		{ name: 'Latte', value: '#BE9E82' },
		{ name: 'Cherry Foam', value: '#F89CAB' },
		{ name: 'Sky Cream', value: '#E9F7FF' },
		{ name: 'Cool Blue', value: '#D7EFFF' },
		{ name: 'Warm Caramel', value: '#E7993F' },
		{ name: 'Deep Blueberry', value: '#2D3E56' },
		{ name: 'Wasabi', value: '#E9F056' },
		{ name: 'Banana Cream', value: '#EEDCA7' },
		{ name: 'Brume', value: '#C2F2E4' },
		{ name: 'Menthe', value: '#35C8B4' },
		{ name: 'Verveine', value: '#A4CF4A' },
		{ name: 'Charcoal', value: '#2A2529' },
		{ name: 'Pale Ivory', value: '#F3F0E7' },
		{ name: 'Pale Ash', value: '#E5E5E5' },
		{ name: 'Black Ink', value: '#1C1C1C' },
		{ name: 'Asphalt', value: '#302F2C' },
		{ name: 'Paper', value: '#EFEDE3' },
		{ name: 'Cloud', value: '#F4F4F4' },
		{ name: 'Smog', value: '#5C636D' }
	];
</script>

<svelte:head>
	<title>{pageTitle('Цвета')}</title>
</svelte:head>

<div class="page-shell justify-start pt-28 pb-16">
	<h1 class="text-5xl font-bold mix-blend-luminosity text-[var(--color-canvas)] md:text-9xl">
		Цвета
	</h1>
	<p class="max-w-xl text-lg mix-blend-luminosity text-[var(--color-canvas)] md:text-2xl">
		Страница компонентов цветов? Ну и ну.
	</p>

	<GlassPanel
		class="mx-auto mt-8 w-full max-w-[68rem] rounded-4xl"
		contentClass="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
		overlay="rgba(255, 255, 255, 0.1)"
		highlight="rgba(255, 255, 255, 0.45)"
		blur="6px"
	>
		{#each colors as color (color.name)}
			<ColorCard name={color.name} value={color.value} />
		{/each}
	</GlassPanel>
</div>

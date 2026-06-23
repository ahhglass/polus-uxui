<script lang="ts">
	import { DomeGallery, pageTitle } from '$lib';
</script>

<svelte:head>
	<title>{pageTitle('Галерея')}</title>
</svelte:head>

<div class="flex flex-col items-center justify-center h-dvh">
	<DomeGallery
		fit={0.5}
		dragDampening={2}
		minRadius={900}
		segments={32}
		grayscale={false}
		imageBorderRadius="16px"
		openModalView={true}
	/>
</div>

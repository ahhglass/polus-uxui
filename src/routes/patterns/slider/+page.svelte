<script lang="ts">
	import { DistortionSlider, pageTitle } from '$lib';
</script>

<svelte:head>
	<title>{pageTitle('3D Слайдер')}</title>
</svelte:head>

<DistortionSlider
	config={{
		minHeight: 1.15,
		maxHeight: 1.75,
		gap: 0.03
	}}
/>

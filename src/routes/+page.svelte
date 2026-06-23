<script lang="ts">
	import { pageTitle } from '$lib';
</script>

<svelte:head>
	<title>{pageTitle()}</title>
</svelte:head>

<div class="page-shell">
	<h1 class="text-6xl font-bold mix-blend-luminosity text-[var(--color-canvas)] md:text-9xl">
		Привет?
	</h1>
	<p class="max-w-xl text-lg mix-blend-luminosity text-[var(--color-canvas)] md:text-2xl">
		Это то вроде как главная страница, и я ничего лучшего пока не придумал
	</p>

	<p
		class="absolute bottom-10 max-w-md text-sm mix-blend-luminosity text-[var(--color-canvas)] md:text-base mx-4"
	>
		Так-то мы студия дизайна, но пока ничего не сделали
	</p>
</div>

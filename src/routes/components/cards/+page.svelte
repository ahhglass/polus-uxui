<script lang="ts">
	import { MagicBento, pageTitle } from '$lib';
</script>

<svelte:head>
	<title>{pageTitle('Карточки')}</title>
</svelte:head>

<div class="page-shell">
	<h1 class="text-5xl font-bold mix-blend-difference text-[var(--color-canvas)] md:text-9xl">
		Карточки
	</h1>
	<p class="max-w-xl text-lg mix-blend-difference text-[var(--color-canvas)] md:text-2xl">
		Страница компонентов карточек.
	</p>

	<div class="mt-8 w-full max-w-[68em] px-3">
		<MagicBento />
	</div>
</div>

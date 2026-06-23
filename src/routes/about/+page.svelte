<script lang="ts">
	import { pageTitle, site } from '$lib';
</script>

<svelte:head>
	<title>{pageTitle('О проекте')}</title>
	<meta name="description" content={site.description} />
</svelte:head>

<div class="page-shell">
	<h1
		class="text-6xl font-extrabold tracking-wide text-[var(--color-canvas)] uppercase mix-blend-luminosity md:text-9xl"
	>
		{site.name}
	</h1>
	<article class="mx-auto w-full max-w-5xl">
		<p
			class=" text-base leading-relaxed text-[var(--color-canvas)] md:text-2xl mix-blend-luminosity"
		>
			{site.description}. Здесь собираем UI-компоненты, паттерны и визуальные эксперименты —
			открываешь страницу, смотришь, как элемент ведёт себя в контексте, сравниваешь с другими
			решениями.
		</p>

		<p
			class="mt-4 text-base leading-relaxed text-[var(--color-canvas)] md:text-2xl mix-blend-luminosity"
		>
			Проект в активной разработке: новые секции появляются по мере экспериментов с вёрсткой,
			анимацией и типографикой. Это референс и песочница одновременно.
		</p>

		<p
			class="mt-4 text-sm leading-relaxed text-[var(--color-canvas)] md:text-lg mix-blend-luminosity"
		>
			Это фан-сайт, не имеет отношения к реальной компании.
		</p>
	</article>
</div>

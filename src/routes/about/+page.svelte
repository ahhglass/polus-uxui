<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button, pageTitle, site } from '$lib';

	const stack = ['SvelteKit', 'Svelte 5', 'TypeScript', 'Tailwind CSS', 'GSAP', 'OGL'];

	const sections = [
		{
			title: 'Зачем это нужно',
			body: 'Дизайнерская вешалка — площадка, где можно быстро собирать, смотреть и тестировать UI-компоненты и паттерны. Без лишней обвязки: открыл страницу, увидел компонент в контексте, сравнил с другими решениями.'
		},
		{
			title: 'Что внутри',
			body: 'Навигация с CardNav, живой фон Grainient на WebGL, набор иконок и кнопок. Разделы «Компоненты» и «Паттерны» — заготовки под каталог. Каждая страница — отдельная сцена для экспериментов с вёрсткой и анимацией.'
		},
		{
			title: 'Как пользоваться',
			body: 'Выбери раздел в меню сверху, переходи между страницами и смотри, как элементы ведут себя на одном фоне и в одной типографике. Это референс и песочница одновременно — удобно перед тем, как тащить компонент в рабочий проект.'
		}
	];

	function goHome() {
		goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>{pageTitle('О проекте')}</title>
	<meta name="description" content={site.description} />
</svelte:head>

<div class="min-h-dvh px-4 pb-16 pt-24 md:px-6 md:pt-28">
	<header class="mx-auto max-w-3xl text-center">
		<h1 class="text-6xl font-bold tracking-tight mix-blend-difference text-white md:text-8xl">
			О проекте
		</h1>
		<p class="mx-auto mt-5 max-w-xl text-lg mix-blend-difference text-white md:text-xl">
			Песочница для компонентов, паттернов и визуальных экспериментов на SvelteKit.
		</p>
	</header>

	<article
		class="mx-auto mt-12 max-w-4xl rounded-2xl border border-white/25 bg-[var(--color-canvas)]/92 p-8 backdrop-blur-md md:p-10"
	>
		<div class="flex flex-wrap gap-2">
			{#each stack as item (item)}
				<span
					class="rounded-full border border-[var(--color-text)]/10 bg-white/60 px-3 py-1 text-sm font-medium text-[var(--color-text)]"
				>
					{item}
				</span>
			{/each}
		</div>

		<div class="mt-10 space-y-10">
			{#each sections as section (section.title)}
				<section>
					<h2 class="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
						{section.title}
					</h2>
					<p class="mt-3 text-base leading-relaxed text-[var(--color-text)]/80">
						{section.body}
					</p>
				</section>
			{/each}
		</div>

		<hr class="my-10 border-[var(--color-text)]/10" />

		<p class="text-sm leading-relaxed text-[var(--color-text)]/60">
			Проект в активной разработке: новые компоненты и страницы добавляются по мере экспериментов.
			Если идея для секции есть — можно оформить её отдельным маршрутом в
			<code class="rounded bg-[var(--color-text)]/5 px-1.5 py-0.5 font-mono text-sm"
				>/components</code
			>
			или
			<code class="rounded bg-[var(--color-text)]/5 px-1.5 py-0.5 font-mono text-sm">/patterns</code
			>.
		</p>

		<div class="mt-8 flex flex-wrap gap-3">
			<Button radius="lg" size="lg" onclick={goHome}>На главную</Button>
			<Button
				radius="lg"
				size="lg"
				variant="outline"
				color="var(--color-text)"
				textColor="var(--color-canvas)"
				onclick={() => goto(resolve('/components/buttons'))}
			>
				Смотреть компоненты
			</Button>
		</div>
	</article>
</div>

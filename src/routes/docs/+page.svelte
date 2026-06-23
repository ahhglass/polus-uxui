<script lang="ts">
	import { pageTitle, site } from '$lib';

	const sections = [
		{
			title: 'Навигация',
			body: `${site.name} — каталог UI-компонентов и паттернов. Меню в шапке делится на три блока: «Компоненты» (цвета, кнопки, карточки, формы), «Паттерны» (галерея, 3D-слайдер, модалки, анимации) и «Ресурсы» (эта страница, GitHub, о проекте, настройки).`
		},
		{
			title: 'Дизайн-система',
			body: 'Палитра — на странице цветов, значения продублированы в CSS-переменных (--color-canvas, --color-text и др.). Шрифт — Open Sans. Анимации используют --ease-smooth и --duration-normal. Живой фон Grainient (WebGL) общий для всех страниц.'
		},
		{
			title: 'Звук и настройки',
			body: 'На сайте есть звуки интерфейса и фоновая музыка. Громкость, включение и выбор трека — в разделе настроек. Параметры сохраняются в браузере.'
		}
	];
</script>

<svelte:head>
	<title>{pageTitle('Документация')}</title>
	<meta
		name="description"
		content="Как устроен сайт {site.name}: разделы, дизайн-система и настройки."
	/>
</svelte:head>

<div class="page-shell px-4">
	<h1
		class="text-4xl font-bold tracking-tight text-[var(--color-canvas)] mix-blend-luminosity md:text-9xl"
	>
		Документация
	</h1>

	<article class="mx-auto w-full max-w-5xl text-center">
		{#each sections as section (section.title)}
			<section class="mt-6">
				<h2
					class="text-lg font-semibold tracking-tight text-[var(--color-canvas)] mix-blend-luminosity md:text-xl"
				>
					{section.title}
				</h2>
				<p
					class="mt-2 text-base leading-relaxed text-[var(--color-canvas)] mix-blend-luminosity md:text-2xl"
				>
					{section.body}
				</p>
			</section>
		{/each}
	</article>
</div>

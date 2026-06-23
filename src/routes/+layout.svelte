<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import {
		Grainient,
		initSound,
		initAmbient,
		Navbar,
		MusicIndicator,
		site,
		type NavbarItem
	} from '$lib';

	let { children } = $props();

	onMount(() => {
		const cleanupSound = initSound();
		const cleanupAmbient = initAmbient();
		return () => {
			cleanupSound?.();
			cleanupAmbient?.();
		};
	});

	const navItems: NavbarItem[] = [
		{
			label: 'Компоненты',
			bgColor: '#1a1a1a',
			textColor: '#fff',
			links: [
				{ label: 'Цвета', href: '/components/colors', ariaLabel: 'Перейти к цветам' },
				{ label: 'Кнопки', href: '/components/buttons', ariaLabel: 'Перейти к кнопкам' },
				{ label: 'Карточки', href: '/components/cards', ariaLabel: 'Перейти к карточкам' },
				{ label: 'Формы', href: '/components/forms', ariaLabel: 'Перейти к формам' }
			]
		},
		{
			label: 'Паттерны',
			bgColor: '#2d4a52',
			textColor: '#fff',
			links: [
				{ label: 'Галерея', href: '/patterns/gallery', ariaLabel: 'Галерея' },
				{ label: '3D Слайдер', href: '/patterns/slider', ariaLabel: '3D слайдер с деформацией' },
				{ label: 'Модалки', href: '/patterns/modals', ariaLabel: 'Паттерны модальных окон' },
				{ label: 'Анимации', href: '/patterns/animations', ariaLabel: 'Паттерны анимаций' }
			]
		},
		{
			label: 'Ресурсы',
			bgColor: '#4D6569',
			textColor: '#fff',
			links: [
				{ label: 'Документация', href: '/docs', ariaLabel: 'Открыть документацию' },
				{ label: 'GitHub', href: 'https://github.com', ariaLabel: 'Открыть GitHub' },
				{ label: 'О проекте', href: '/about', ariaLabel: 'О проекте' },
				{ label: 'Настройки', href: '/settings', ariaLabel: 'Настройки сайта' }
			]
		}
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content={site.description} />
</svelte:head>

<div class="relative isolate min-h-dvh">
	<Navbar
		logo="/img/logo.svg"
		logoAlt="Svelte"
		items={navItems}
		menuColor="var(--color-text)"
		menuAriaLabel="Открыть меню"
		closeMenuAriaLabel="Закрыть меню"
		shellColor="color-mix(in srgb,var(--color-canvas) 85%,transparent)"
		buttonTextColor="var(--color-canvas)"
		buttonBgColor="var(--color-text)"
		ctaHref="/components/buttons"
		widthDefault="64rem"
		widthCompact="28rem"
		widthExpanded="min(68rem, calc(100vw - 2.5rem))"
	/>
	<Grainient
		class="pointer-events-none fixed inset-0"
		color1="#C4D0CE"
		color2="#4D6569"
		color3="#070D0D"
		warpStrength={1}
		warpSpeed={2}
		contrast={1.5}
		zoom={0.9}
		timeSpeed={0.25}
		warpFrequency={5}
		grainAmount={0.03}
		saturation={1}
		grainAnimated={false}
	/>
	{@render children()}
	<MusicIndicator />
</div>

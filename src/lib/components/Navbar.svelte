<script module lang="ts">
	export type NavbarLink = { label: string; href: string; ariaLabel: string; badge?: string };
	export type NavbarItem = {
		label: string;
		bgColor: string;
		textColor: string;
		links: NavbarLink[];
	};
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button, sfx } from '$lib';

	type Props = {
		logo?: string;
		logoAlt?: string;
		logoHref?: string;
		items: NavbarItem[];
		class?: string;
		menuColor?: string;
		menuAriaLabel?: string;
		closeMenuAriaLabel?: string;
		ctaLabel?: string;
		ctaHref?: string;
		shellColor?: string;
		buttonBgColor?: string;
		buttonTextColor?: string;
		widthCompact?: string;
		widthDefault?: string;
		widthExpanded?: string;
		duration?: string;
		ease?: string;
		scrollThreshold?: number;
		maxItems?: number;
		topHeight?: string;
		logoSnippet?: Snippet;
		actions?: Snippet;
	};

	let {
		logo,
		logoAlt = 'Logo',
		logoHref = '/',
		items,
		class: className = '',
		menuColor,
		menuAriaLabel = 'Open menu',
		closeMenuAriaLabel = 'Close menu',
		ctaLabel = 'Начать',
		ctaHref = '/',
		shellColor,
		buttonBgColor = 'var(--color-text)',
		buttonTextColor = 'var(--color-canvas)',
		widthCompact = '28rem',
		widthDefault = '56rem',
		widthExpanded = 'min(80rem, calc(100vw - 2.5rem))',
		duration = '0.45s',
		ease = 'cubic-bezier(0.65, 0.05, 0, 1)',
		scrollThreshold = 48,
		maxItems = 3,
		topHeight = '60px',
		logoSnippet,
		actions
	}: Props = $props();

	const isExternalHref = (href: string) => /^[a-z][a-z0-9+.-]*:/i.test(href);

	let menuOpen = $state(false);
	let scrolled = $state(false);
	let scrollSynced = $state(false);
	let menuButton = $state<HTMLDivElement | null>(null);

	const visibleItems = $derived((items ?? []).slice(0, maxItems));
	const menuAria = $derived(menuOpen ? closeMenuAriaLabel : menuAriaLabel);
	const motionEnabled = $derived(!prefersReducedMotion.current);

	async function closeMenu() {
		if (!menuOpen) return;

		const active = document.activeElement;
		if (active instanceof HTMLElement && active.closest('#site-nav-panel')) {
			menuButton?.focus();
			await tick();
		}

		menuOpen = false;
		sfx.unlock();
		sfx.play('closeMenu');
	}

	function toggleMenu() {
		if (menuOpen) {
			closeMenu();
			return;
		}
		menuOpen = true;
		sfx.unlock();
		sfx.play('openMenu');
	}

	function handleCtaClick() {
		closeMenu();
		if (isExternalHref(ctaHref)) {
			window.open(ctaHref, '_blank', 'noopener,noreferrer');
			return;
		}
		goto(resolve(ctaHref as '/'));
	}

	function handleLinkClick() {
		void closeMenu();
	}

	function syncScroll() {
		scrolled = window.scrollY > scrollThreshold;
	}

	onMount(() => {
		syncScroll();
		scrollSynced = true;
		window.addEventListener('scroll', syncScroll, { passive: true });
		window.addEventListener('pageshow', syncScroll);

		return () => {
			window.removeEventListener('scroll', syncScroll);
			window.removeEventListener('pageshow', syncScroll);
			document.body.classList.remove('nav-open');
		};
	});

	$effect(() => {
		document.body.classList.toggle('nav-open', menuOpen);
	});
</script>

{#snippet linkIcon()}
	<svg
		class="site-nav__link-icon shrink-0"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
	>
		<line x1="7" y1="17" x2="17" y2="7" />
		<polyline points="7 7 17 7 17 17" />
	</svg>
{/snippet}

{#snippet navLink(lnk: NavbarLink)}
	{#if isExternalHref(lnk.href)}
		<a
			class="site-nav__link"
			href={lnk.href}
			rel="external"
			aria-label={lnk.ariaLabel}
			onclick={handleLinkClick}
		>
			{@render linkIcon()}
			<span class="site-nav__link-text">
				<span class="site-nav__link-label">{lnk.label}</span>
				{#if lnk.badge}
					<span class="site-nav__link-badge">{lnk.badge}</span>
				{/if}
			</span>
		</a>
	{:else}
		<a
			class="site-nav__link"
			href={resolve(lnk.href as '/')}
			aria-label={lnk.ariaLabel}
			onclick={handleLinkClick}
		>
			{@render linkIcon()}
			<span class="site-nav__link-text">
				<span class="site-nav__link-label">{lnk.label}</span>
				{#if lnk.badge}
					<span class="site-nav__link-badge">{lnk.badge}</span>
				{/if}
			</span>
		</a>
	{/if}
{/snippet}

{#snippet defaultLogo()}
	<img src={logo} alt={logoAlt} class="h-7 w-auto" />
{/snippet}

<svelte:window onkeydown={(e) => e.key === 'Escape' && closeMenu()} />

<nav
	class="site-nav pointer-events-none fixed inset-x-5 top-5 z-[99] flex justify-center max-md:inset-x-3 max-md:top-3 {className}"
	data-open={menuOpen ? 'true' : 'false'}
	data-scrolled={scrolled ? 'true' : 'false'}
	data-scroll-synced={scrollSynced ? 'true' : 'false'}
	data-motion={motionEnabled ? 'true' : 'false'}
	aria-label="Главная навигация"
	style:--nav-duration={duration}
	style:--nav-ease={ease}
	style:--nav-width-compact={widthCompact}
	style:--nav-width-default={widthDefault}
	style:--nav-width-expanded={widthExpanded}
	style:--nav-top-height={topHeight}
>
	<div class="site-nav__backdrop fixed inset-0 z-[-1]" aria-hidden="true" onclick={closeMenu}></div>

	<div class="site-nav__brand pointer-events-auto">
		{#if logoHref}
			<a
				href={resolve(logoHref as '/')}
				class="inline-flex items-center justify-center"
				aria-label={logoAlt}
				onclick={closeMenu}
			>
				{#if logoSnippet}
					{@render logoSnippet()}
				{:else if logo}
					{@render defaultLogo()}
				{/if}
			</a>
		{:else}
			<div class="inline-flex items-center justify-center">
				{#if logoSnippet}
					{@render logoSnippet()}
				{:else if logo}
					{@render defaultLogo()}
				{/if}
			</div>
		{/if}
	</div>

	<div class="pointer-events-auto w-full">
		<div class="site-nav__width mx-auto w-full">
			<div
				class="site-nav__shell relative overflow-hidden rounded-xl"
				style:background-color={shellColor}
			>
				<div class="site-nav__top relative z-[2] px-4">
					<div class="site-nav__top-bar">
						<div
							bind:this={menuButton}
							class="site-nav__menu group flex min-h-12 min-w-12 shrink-0 cursor-pointer flex-col items-center justify-center gap-[6px] rounded-lg"
							role="button"
							aria-label={menuAria}
							aria-expanded={menuOpen}
							aria-controls="site-nav-panel"
							tabindex="0"
							onclick={toggleMenu}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									toggleMenu();
								}
							}}
							style:color={menuColor ?? 'var(--color-text)'}
						>
							<div
								class="h-[2px] w-[30px] rounded-sm bg-current transition-[transform,opacity] ui-ease-transition origin-center {menuOpen
									? 'translate-y-[4px] rotate-45'
									: ''} group-hover:opacity-75"
							></div>
							<div
								class="h-[2px] w-[30px] rounded-sm bg-current transition-[transform,opacity] ui-ease-transition origin-center {menuOpen
									? '-translate-y-[4px] -rotate-45'
									: ''} group-hover:opacity-75"
							></div>
						</div>

						<div class="site-nav__actions flex items-center justify-end">
							{#if actions}
								{@render actions()}
							{:else}
								<div class="hidden md:block">
									<Button
										size="md"
										radius="lg"
										ring="sm"
										color={buttonBgColor}
										textColor={buttonTextColor}
										onclick={handleCtaClick}
									>
										{ctaLabel}
									</Button>
								</div>
								<div class="w-12 shrink-0 md:hidden" aria-hidden="true"></div>
							{/if}
						</div>
					</div>
				</div>

				<div class="site-nav__panel-clip" id="site-nav-panel">
					<div class="site-nav__panel">
						<div
							class="site-nav__panel-inner flex flex-col gap-2 p-2 md:flex-row md:items-stretch md:gap-3 md:p-3"
							inert={!menuOpen}
						>
							{#each visibleItems as item (item.label)}
								<div
									class="site-nav__card flex min-h-[60px] min-w-0 flex-1 flex-col gap-8 rounded-[0.55rem] p-3 md:min-h-[140px] md:p-4"
									style="background-color:{item.bgColor}; color:{item.textColor};"
								>
									<div class="text-lg font-normal tracking-[-0.5px] md:text-xl">{item.label}</div>
									<div class="mt-auto flex flex-col gap-0.5">
										{#each item.links ?? [] as lnk (lnk.href + lnk.label)}
											{@render navLink(lnk)}
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</nav>

<style>
	.site-nav {
		--nav-offset-y: 1.35rem;
		--nav-logo-top: calc(var(--nav-offset-y) + var(--nav-top-height) / 2);
	}

	/* Viewport-fixed: полностью вне контейнера с анимацией max-width */
	.site-nav__brand {
		position: fixed;
		left: 50%;
		top: var(--nav-logo-top);
		z-index: 100;
		transform: translate3d(-50%, -50%, 0);
		backface-visibility: hidden;
	}

	.site-nav__shell {
		background: color-mix(in srgb, var(--color-canvas) 85%, transparent);
		backdrop-filter: blur(8px);
	}

	.site-nav__top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--nav-top-height);
	}

	.site-nav__actions {
		min-width: 3rem;
	}

	.site-nav__menu {
		margin-left: -0.625rem;
	}

	.site-nav__width {
		max-width: var(--nav-width-default);
		transition: max-width var(--nav-duration) var(--nav-ease);
	}

	.site-nav[data-open='true'] .site-nav__width {
		max-width: var(--nav-width-expanded);
	}

	.site-nav[data-scrolled='true'][data-open='false'] .site-nav__width {
		max-width: var(--nav-width-compact);
	}

	.site-nav:not([data-scroll-synced='true']) .site-nav__width {
		transition: none;
	}

	.site-nav__backdrop {
		background-color: color-mix(in srgb, var(--color-text) 24%, transparent);
		backdrop-filter: blur(2px);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--nav-duration) var(--nav-ease);
	}

	.site-nav[data-open='true'] .site-nav__backdrop {
		opacity: 1;
		pointer-events: auto;
	}

	/* Автовысота панели без фиксированного max-height */
	.site-nav__panel-clip {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--nav-duration) var(--nav-ease);
	}

	.site-nav[data-open='true'] .site-nav__panel-clip {
		grid-template-rows: 1fr;
	}

	.site-nav__panel {
		overflow: hidden;
		min-height: 0;
		opacity: 0;
		transition: opacity var(--nav-duration) var(--nav-ease);
	}

	.site-nav[data-open='true'] .site-nav__panel {
		opacity: 1;
	}

	.site-nav__card {
		opacity: 0;
		transform: translateY(8px);
		transition:
			opacity var(--nav-duration) var(--nav-ease),
			transform var(--nav-duration) var(--nav-ease);
	}

	.site-nav[data-open='true'] .site-nav__card {
		opacity: 1;
		transform: translateY(0);
	}

	.site-nav[data-open='true'] .site-nav__card:nth-child(2) {
		transition-delay: 0.05s;
	}

	.site-nav[data-open='true'] .site-nav__card:nth-child(3) {
		transition-delay: 0.1s;
	}

	.site-nav__link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding-block: 0.125rem;
		font-size: 0.9375rem;
		line-height: 1.35;
		text-decoration: none;
		color: color-mix(in srgb, currentColor 82%, transparent);
		transition:
			color var(--duration-normal) var(--ease-smooth),
			gap var(--duration-normal) var(--ease-smooth),
			transform var(--duration-normal) var(--ease-smooth);
	}

	@media (min-width: 768px) {
		.site-nav__link {
			font-size: 1rem;
		}
	}

	.site-nav__link:hover,
	.site-nav__link:focus-visible {
		color: currentColor;
		gap: 0.5rem;
	}

	.site-nav__link-icon {
		transform-origin: center;
		transition: transform var(--duration-normal) var(--ease-smooth);
	}

	.site-nav__link:hover .site-nav__link-icon,
	.site-nav__link:focus-visible .site-nav__link-icon {
		transform: rotate(45deg) translateX(1px);
	}

	.site-nav__link-label {
		transition: transform var(--duration-normal) var(--ease-smooth);
	}

	.site-nav__link-text {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.site-nav__link-badge {
		flex-shrink: 0;
		border-radius: 0.25rem;
		background: color-mix(in srgb, currentColor 20%, transparent);
		padding: 0.18rem;
		font-size: 0.6rem;
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: 0.08em;
		color: currentColor;
	}

	:global(body.nav-open) {
		overflow: hidden;
	}

	@media (prefers-reduced-motion: reduce) {
		.site-nav__width,
		.site-nav__panel-clip,
		.site-nav__panel,
		.site-nav__card,
		.site-nav__backdrop,
		.site-nav__link,
		.site-nav__link-icon,
		.site-nav__link-label {
			transition: none;
		}

		.site-nav[data-open='true'] .site-nav__card {
			transform: none;
		}

		.site-nav__link:hover .site-nav__link-icon,
		.site-nav__link:focus-visible .site-nav__link-icon,
		.site-nav__link:hover .site-nav__link-label,
		.site-nav__link:focus-visible .site-nav__link-label {
			transform: none;
		}
	}

	@media (max-width: 768px) {
		.site-nav {
			--nav-offset-y: 0.75rem;
		}

		.site-nav__brand {
			left: auto;
			right: calc(0.75rem + 1rem);
			transform: translate3d(0, -50%, 0);
		}

		.site-nav__width,
		.site-nav[data-open='true'] .site-nav__width,
		.site-nav[data-scrolled='true'][data-open='false'] .site-nav__width {
			max-width: 100%;
			transition: none;
		}
	}
</style>

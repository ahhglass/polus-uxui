<script module lang="ts">
	export type CardNavLink = { label: string; href: string; ariaLabel: string };
	export type CardNavItem = {
		label: string;
		bgColor: string;
		textColor: string;
		links: CardNavLink[];
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { gsap } from 'gsap';
	import { Button } from '$lib';
	const isExternalHref = (href: string) => /^[a-z][a-z0-9+.-]*:/i.test(href);

	type Props = {
		logo: string;
		logoAlt?: string;
		items: CardNavItem[];
		class?: string;
		ease?: string;
		baseColor?: string;
		menuColor?: string;
		buttonBgColor?: string;
		buttonTextColor?: string;
		maxWidth?: string;
	};

	let {
		logo,
		logoAlt = 'Logo',
		items,
		class: className = '',
		ease = 'power3.out',
		baseColor = '#fff',
		menuColor,
		buttonBgColor,
		buttonTextColor,
		maxWidth = '900px'
	}: Props = $props();

	let isHamburgerOpen = $state(false);
	let isExpanded = $state(false);
	let navRef = $state<HTMLElement | null>(null);
	const cardRefs: (HTMLDivElement | undefined)[] = [];
	let tl: gsap.core.Timeline | null = null;

	function bindCardRef(node: HTMLDivElement, index: number) {
		cardRefs[index] = node;
		return {
			destroy() {
				cardRefs[index] = undefined;
			}
		};
	}

	function getCardElements(): HTMLDivElement[] {
		return cardRefs.filter((el): el is HTMLDivElement => el != null);
	}

	function calculateHeight(): number {
		if (!navRef) return 260;
		const isMobile = window.matchMedia('(max-width: 768px)').matches;
		if (isMobile) {
			const contentEl = navRef.querySelector('.card-nav-content') as HTMLElement | null;
			if (contentEl) {
				const wasVis = contentEl.style.visibility;
				const wasPe = contentEl.style.pointerEvents;
				const wasPos = contentEl.style.position;
				const wasH = contentEl.style.height;
				contentEl.style.visibility = 'visible';
				contentEl.style.pointerEvents = 'auto';
				contentEl.style.position = 'static';
				contentEl.style.height = 'auto';
				void contentEl.offsetHeight;
				const topBar = 60;
				const padding = 16;
				const ch = contentEl.scrollHeight;
				contentEl.style.visibility = wasVis;
				contentEl.style.pointerEvents = wasPe;
				contentEl.style.position = wasPos;
				contentEl.style.height = wasH;
				return topBar + ch + padding;
			}
		}
		return 260;
	}

	function createTimeline() {
		if (!navRef) return null;
		const cards = getCardElements();
		gsap.set(navRef, { height: 60, overflow: 'hidden' });
		gsap.set(cards, { y: 50, opacity: 0 });
		const _tl = gsap.timeline({ paused: true });
		_tl.to(navRef, { height: calculateHeight, duration: 0.4, ease });
		_tl.to(cards, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');
		return _tl;
	}

	onMount(() => {
		tl = createTimeline();
		const handleResize = () => {
			if (!tl) return;
			if (isExpanded) {
				gsap.set(navRef, { height: calculateHeight() });
				tl.kill();
				const next = createTimeline();
				if (next) {
					next.progress(1);
					tl = next;
				}
			} else {
				tl.kill();
				const next = createTimeline();
				if (next) tl = next;
			}
		};
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			tl?.kill();
			tl = null;
		};
	});

	function toggleMenu() {
		if (!tl) return;
		if (!isExpanded) {
			isHamburgerOpen = true;
			isExpanded = true;
			tl.play(0);
		} else {
			closeMenu();
		}
	}

	function closeMenu() {
		if (!tl || !isExpanded) return;
		isHamburgerOpen = false;
		tl.eventCallback('onReverseComplete', () => (isExpanded = false));
		tl.reverse();
	}

	function handleBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			closeMenu();
		}
	}

	function handleDocumentKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isExpanded) closeMenu();
	}
</script>

<svelte:window onkeydown={handleDocumentKeydown} />

{#if isExpanded}
	<button
		type="button"
		class="fixed inset-0 z-[98] cursor-default border-0 bg-transparent p-0"
		aria-label="Закрыть меню"
		onclick={closeMenu}
		onkeydown={handleBackdropKeydown}
	></button>
{/if}

<div
	class="card-nav-container absolute left-1/2 top-[1.2em] z-[99] w-[90%] -translate-x-1/2 md:top-[2em] {className}"
	style:max-width={maxWidth}
>
	<nav
		bind:this={navRef}
		class="card-nav {isExpanded
			? 'open'
			: ''} block h-[60px] p-0 rounded-xl shadow-md relative overflow-hidden will-change-[height]"
		style="background-color:{baseColor};"
	>
		<div class="card-nav-top relative z-[2] h-[60px] px-4">
			<div class="grid h-full grid-cols-[3rem_1fr_3rem] items-center md:flex md:justify-between">
				<div class="flex items-center justify-start">
					<div
						class="hamburger-menu {isHamburgerOpen
							? 'open'
							: ''} group -ml-2 flex min-h-12 min-w-12 shrink-0 flex-col items-center justify-center cursor-pointer gap-[6px] rounded-lg"
						role="button"
						aria-label={isExpanded ? 'Close menu' : 'Open menu'}
						tabindex="0"
						onclick={toggleMenu}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								toggleMenu();
							}
						}}
						style="color:{menuColor || '#000'};"
					>
						<div
							class="hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] ui-ease-transition [transform-origin:50%_50%] {isHamburgerOpen
								? 'translate-y-[4px] rotate-45'
								: ''} group-hover:opacity-75"
						></div>
						<div
							class="hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] ui-ease-transition [transform-origin:50%_50%] {isHamburgerOpen
								? '-translate-y-[4px] -rotate-45'
								: ''} group-hover:opacity-75"
						></div>
					</div>
				</div>

				<div
					class="logo-container flex items-center justify-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
				>
					<img src={logo} alt={logoAlt} class="logo h-[28px]" />
				</div>

				<div class="hidden items-center justify-end md:flex">
					<Button radius="lg" size="md" ring="sm" color={buttonBgColor} textColor={buttonTextColor}>
						Начать
					</Button>
				</div>
			</div>
		</div>
		<div
			class="card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 justify-start z-[1] {isExpanded
				? 'visible pointer-events-auto'
				: 'invisible pointer-events-none'} md:flex-row md:items-end md:gap-[12px]"
			aria-hidden={!isExpanded}
		>
			{#each (items || []).slice(0, 3) as item, idx (idx)}
				<div
					class="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-[calc(0.75rem-0.2rem)] min-w-0 flex-[1_1_auto] h-auto min-h-[60px] md:h-full md:min-h-0 md:flex-[1_1_0%]"
					use:bindCardRef={idx}
					style="background-color:{item.bgColor}; color:{item.textColor};"
				>
					<div class="nav-card-label font-normal tracking-[-0.5px] text-[18px] md:text-[22px]">
						{item.label}
					</div>
					<div class="nav-card-links mt-auto flex flex-col gap-[2px]">
						{#each item.links ?? [] as lnk, i (i)}
							{#if isExternalHref(lnk.href)}
								<a
									class="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity ui-ease-transition hover:opacity-75 text-[15px] md:text-[16px]"
									href={lnk.href}
									rel="external"
									aria-label={lnk.ariaLabel}
								>
									<svg
										class="nav-card-link-icon shrink-0"
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
									{lnk.label}
								</a>
							{:else}
								<a
									class="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity ui-ease-transition hover:opacity-75 text-[15px] md:text-[16px]"
									href={resolve(lnk.href as '/')}
									aria-label={lnk.ariaLabel}
								>
									<svg
										class="nav-card-link-icon shrink-0"
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
									{lnk.label}
								</a>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</nav>
</div>

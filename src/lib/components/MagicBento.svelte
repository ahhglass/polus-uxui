<script module lang="ts">
	import type { IconName } from '$lib/components/Icon.svelte';

	export interface BentoCardProps {
		color?: string;
		textColor?: string;
		icon?: IconName;
		title?: string;
		description?: string;
		label?: string;
		href: string;
		colSpan?: 1 | 2;
		featured?: boolean;
	}
	export interface MagicBentoProps {
		textAutoHide?: boolean;
		enableStars?: boolean;
		enableSpotlight?: boolean;
		enableBorderGlow?: boolean;
		disableAnimations?: boolean;
		spotlightRadius?: number;
		particleCount?: number;
		enableTilt?: boolean;
		clickEffect?: boolean;
		enableMagnetism?: boolean;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { resolve } from '$app/paths';

	import Icon from '$lib/components/Icon.svelte';

	const DEFAULT_PARTICLE_COUNT = 12;
	const DEFAULT_SPOTLIGHT_RADIUS = 300;

	const cardData: BentoCardProps[] = [
		{
			title: 'Кнопки',
			description: 'Варианты, размеры, скругления и sparkle-эффекты',
			label: 'Buttons',
			href: '/components/buttons',
			color: 'var(--color-graphite)',
			textColor: 'var(--color-white)'
		},
		{
			title: 'Формы',
			description: 'Поля ввода, метки, подсказки и состояния',
			label: 'Forms',
			href: '/components/forms',
			color: 'var(--color-aspidin)',
			textColor: 'var(--color-white)'
		},
		{
			title: 'Карточки',
			description: 'Bento-сетка с hover, glow и анимациями',
			label: 'Cards',
			href: '/components/cards',
			color: 'var(--color-marengo)',
			textColor: 'var(--color-white)',
			featured: true
		},
		{
			title: 'Галерея',
			description: '3D-купол с изображениями и полноэкранным просмотром',
			label: 'Gallery',
			href: '/patterns/gallery',
			color: 'var(--color-graphite)',
			textColor: 'var(--color-white)',
			colSpan: 2
		},
		{
			title: '3D Слайдер',
			description: 'Слайдер с деформацией и WebGL-эффектами',
			label: 'Slider',
			href: '/patterns/slider',
			color: 'var(--color-marengo)',
			textColor: 'var(--color-white)'
		},
		{
			title: 'Модалки',
			description: 'Паттерны модальных окон и оверлеев',
			label: 'Modals',
			href: '/patterns/modals',
			color: 'var(--color-aspidin)',
			textColor: 'var(--color-white)'
		},
		{
			title: 'Анимации',
			description: 'Паттерны motion и micro-interactions',
			label: 'Motion',
			href: '/patterns/animations',
			color: 'var(--color-graphite)',
			textColor: 'var(--color-white)',
			colSpan: 2
		},
		{
			title: 'Настройки',
			description: 'Звук, ambient-музыка и параметры интерфейса',
			label: 'Settings',
			href: '/settings',
			color: 'var(--color-graphite)',
			textColor: 'var(--color-white)'
		}
	];

	const MOBILE_BREAKPOINT = 768;

	let {
		textAutoHide = true,
		enableStars = true,
		enableSpotlight = true,
		enableBorderGlow = true,
		disableAnimations = false,
		spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
		particleCount = DEFAULT_PARTICLE_COUNT,
		enableTilt = false,
		clickEffect = true,
		enableMagnetism = true
	}: MagicBentoProps = $props();

	let gridRef: HTMLDivElement;
	let isMobile = $state(false);
	const shouldDisableAnimations = $derived(disableAnimations || isMobile);

	function createParticleEl(x: number, y: number, glowColor: string) {
		const el = document.createElement('div');
		el.className = 'particle';
		el.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;background:${glowColor};box-shadow:0 0 6px color-mix(in srgb, ${glowColor} 60%, transparent);pointer-events:none;z-index:100;left:${x}px;top:${y}px;`;
		return el;
	}

	function getCardGlow(el: HTMLElement) {
		return getComputedStyle(el).getPropertyValue('--card-glow').trim();
	}

	function buildSpotlightGradient(glowColor: string) {
		return `radial-gradient(circle, color-mix(in srgb, ${glowColor} 15%, transparent) 0%, color-mix(in srgb, ${glowColor} 8%, transparent) 15%, color-mix(in srgb, ${glowColor} 4%, transparent) 25%, color-mix(in srgb, ${glowColor} 2%, transparent) 40%, color-mix(in srgb, ${glowColor} 1%, transparent) 65%, transparent 70%)`;
	}

	function buildRippleGradient(glowColor: string) {
		return `radial-gradient(circle, color-mix(in srgb, ${glowColor} 40%, transparent) 0%, color-mix(in srgb, ${glowColor} 20%, transparent) 30%, transparent 70%)`;
	}

	function updateCardGlow(card: HTMLElement, mx: number, my: number, glow: number, radius: number) {
		const rect = card.getBoundingClientRect();
		card.style.setProperty('--glow-x', `${((mx - rect.left) / rect.width) * 100}%`);
		card.style.setProperty('--glow-y', `${((my - rect.top) / rect.height) * 100}%`);
		card.style.setProperty('--glow-intensity', glow.toString());
		card.style.setProperty('--glow-radius', `${radius}px`);
	}

	function attachCard(el: HTMLElement) {
		// Per-card behaviour: particles (if enableStars), tilt, magnetism, click ripple
		let isHovered = false;
		const timeouts: ReturnType<typeof setTimeout>[] = [];
		const liveParticles: HTMLDivElement[] = [];
		let memoParticles: HTMLDivElement[] = [];
		let particlesInit = false;
		let magnetTween: gsap.core.Tween | null = null;

		const initParticles = () => {
			if (particlesInit || !el) return;
			const { width, height } = el.getBoundingClientRect();
			const cardGlow = getCardGlow(el);
			memoParticles = Array.from({ length: particleCount }, () =>
				createParticleEl(Math.random() * width, Math.random() * height, cardGlow)
			);
			particlesInit = true;
		};
		const clearParticles = () => {
			timeouts.forEach(clearTimeout);
			timeouts.length = 0;
			magnetTween?.kill();
			liveParticles.forEach((p) => {
				gsap.to(p, {
					scale: 0,
					opacity: 0,
					duration: 0.3,
					ease: 'back.in(1.7)',
					onComplete: () => p.parentNode?.removeChild(p)
				});
			});
			liveParticles.length = 0;
		};
		const animateParticles = () => {
			if (!isHovered) return;
			if (!particlesInit) initParticles();
			memoParticles.forEach((p, i) => {
				const t = setTimeout(() => {
					if (!isHovered) return;
					const clone = p.cloneNode(true) as HTMLDivElement;
					el.appendChild(clone);
					liveParticles.push(clone);
					gsap.fromTo(
						clone,
						{ scale: 0, opacity: 0 },
						{ scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
					);
					gsap.to(clone, {
						x: (Math.random() - 0.5) * 100,
						y: (Math.random() - 0.5) * 100,
						rotation: Math.random() * 360,
						duration: 2 + Math.random() * 2,
						ease: 'none',
						repeat: -1,
						yoyo: true
					});
					gsap.to(clone, {
						opacity: 0.3,
						duration: 1.5,
						ease: 'power2.inOut',
						repeat: -1,
						yoyo: true
					});
				}, i * 100);
				timeouts.push(t);
			});
		};

		const onEnter = () => {
			if (shouldDisableAnimations) return;
			isHovered = true;
			if (enableStars) animateParticles();
			if (enableTilt)
				gsap.to(el, {
					rotateX: 5,
					rotateY: 5,
					duration: 0.3,
					ease: 'power2.out',
					transformPerspective: 1000
				});
		};
		const onLeave = () => {
			if (shouldDisableAnimations) return;
			isHovered = false;
			if (enableStars) clearParticles();
			if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
			if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
		};
		const onMove = (e: MouseEvent) => {
			if (shouldDisableAnimations) return;
			if (!enableTilt && !enableMagnetism) return;
			const rect = el.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const cx = rect.width / 2,
				cy = rect.height / 2;
			if (enableTilt) {
				gsap.to(el, {
					rotateX: ((y - cy) / cy) * -10,
					rotateY: ((x - cx) / cx) * 10,
					duration: 0.1,
					ease: 'power2.out',
					transformPerspective: 1000
				});
			}
			if (enableMagnetism) {
				magnetTween = gsap.to(el, {
					x: (x - cx) * 0.05,
					y: (y - cy) * 0.05,
					duration: 0.3,
					ease: 'power2.out'
				});
			}
		};
		const onClick = (e: MouseEvent) => {
			if (!clickEffect || shouldDisableAnimations) return;
			const rect = el.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const maxD = Math.max(
				Math.hypot(x, y),
				Math.hypot(x - rect.width, y),
				Math.hypot(x, y - rect.height),
				Math.hypot(x - rect.width, y - rect.height)
			);
			const ripple = document.createElement('div');
			const cardGlow = getCardGlow(el);
			ripple.style.cssText = `position:absolute;width:${maxD * 2}px;height:${maxD * 2}px;border-radius:50%;background:${buildRippleGradient(cardGlow)};left:${x - maxD}px;top:${y - maxD}px;pointer-events:none;z-index:1000;`;
			el.appendChild(ripple);
			gsap.fromTo(
				ripple,
				{ scale: 0, opacity: 1 },
				{
					scale: 1,
					opacity: 0,
					duration: 0.8,
					ease: 'power2.out',
					onComplete: () => ripple.remove()
				}
			);
		};

		el.addEventListener('mouseenter', onEnter);
		el.addEventListener('mouseleave', onLeave);
		el.addEventListener('mousemove', onMove);
		el.addEventListener('click', onClick);

		return () => {
			isHovered = false;
			el.removeEventListener('mouseenter', onEnter);
			el.removeEventListener('mouseleave', onLeave);
			el.removeEventListener('mousemove', onMove);
			el.removeEventListener('click', onClick);
			clearParticles();
		};
	}

	function cardAction(node: HTMLElement) {
		const detach = attachCard(node);
		return { destroy: detach };
	}

	onMount(() => {
		const checkMobile = () => (isMobile = window.innerWidth <= MOBILE_BREAKPOINT);
		checkMobile();
		window.addEventListener('resize', checkMobile);

		// Global spotlight
		let spotlight: HTMLDivElement | null = null;
		let onDocMove: ((e: MouseEvent) => void) | null = null;
		let onDocLeave: (() => void) | null = null;

		if (enableSpotlight && !shouldDisableAnimations) {
			const fallbackGlow = `color-mix(in srgb, var(--color-coral) 82%, white)`;

			spotlight = document.createElement('div');
			spotlight.className = 'global-spotlight';
			spotlight.style.cssText = `position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;background:${buildSpotlightGradient(fallbackGlow)};z-index:200;opacity:0;transform:translate(-50%, -50%);mix-blend-mode:screen;`;
			document.body.appendChild(spotlight);

			const proximity = spotlightRadius * 0.5;
			const fadeDistance = spotlightRadius * 0.75;

			onDocMove = (e: MouseEvent) => {
				if (!spotlight || !gridRef) return;
				const section = gridRef.closest('.bento-section') as HTMLElement | null;
				const rect = section?.getBoundingClientRect();
				const inside =
					!!rect &&
					e.clientX >= rect.left &&
					e.clientX <= rect.right &&
					e.clientY >= rect.top &&
					e.clientY <= rect.bottom;
				const cards = gridRef.querySelectorAll<HTMLElement>('.magic-bento-card');
				if (!inside) {
					gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
					cards.forEach((c) => c.style.setProperty('--glow-intensity', '0'));
					return;
				}
				let minDistance = Infinity;
				let activeGlow = fallbackGlow;
				let strongestGlow = 0;

				cards.forEach((card) => {
					const cr = card.getBoundingClientRect();
					const cx = cr.left + cr.width / 2;
					const cy = cr.top + cr.height / 2;
					const distance =
						Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2;
					const eff = Math.max(0, distance);
					minDistance = Math.min(minDistance, eff);
					let glow = 0;
					if (eff <= proximity) glow = 1;
					else if (eff <= fadeDistance) glow = (fadeDistance - eff) / (fadeDistance - proximity);
					updateCardGlow(card, e.clientX, e.clientY, glow, spotlightRadius);

					if (glow > strongestGlow) {
						strongestGlow = glow;
						activeGlow = getCardGlow(card) || activeGlow;
					}
				});

				spotlight.style.background = buildSpotlightGradient(activeGlow);
				gsap.to(spotlight, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });
				const targetOpacity =
					minDistance <= proximity
						? 0.8
						: minDistance <= fadeDistance
							? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
							: 0;
				gsap.to(spotlight, {
					opacity: targetOpacity,
					duration: targetOpacity > 0 ? 0.2 : 0.5,
					ease: 'power2.out'
				});
			};
			onDocLeave = () => {
				gridRef
					?.querySelectorAll<HTMLElement>('.magic-bento-card')
					.forEach((c) => c.style.setProperty('--glow-intensity', '0'));
				if (spotlight) gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
			};
			document.addEventListener('mousemove', onDocMove);
			document.addEventListener('mouseleave', onDocLeave);
		}

		return () => {
			window.removeEventListener('resize', checkMobile);
			if (onDocMove) document.removeEventListener('mousemove', onDocMove);
			if (onDocLeave) document.removeEventListener('mouseleave', onDocLeave);
			spotlight?.parentNode?.removeChild(spotlight);
		};
	});

	const baseCardClass = $derived(
		`magic-bento-card ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''} ${enableStars ? 'particle-container' : ''} ${textAutoHide ? 'magic-bento-card--text-autohide' : ''}`
	);

	const cardClass = (card: BentoCardProps) =>
		[
			baseCardClass,
			card.colSpan === 2 ? 'magic-bento-card--wide' : '',
			card.featured ? 'magic-bento-card--featured' : ''
		]
			.filter(Boolean)
			.join(' ');

	const cardStyle = (card: BentoCardProps) => {
		const accent = card.color ?? 'var(--color-viridian)';

		return `
			background-color:${accent};
			color:${card.textColor ?? 'var(--color-white)'};
			--card-accent:${accent};
			--card-glow:color-mix(in srgb, ${accent} 15%, white);
			--card-glow-soft:color-mix(in srgb, ${accent} 40%, transparent);
			--card-glow-strong:color-mix(in srgb, ${accent} 60%, white);
		`;
	};
</script>

<div bind:this={gridRef} class="bento-section">
	<div class="card-grid">
		{#each cardData as card (card.href)}
			<a
				href={resolve(card.href as '/')}
				class={cardClass(card)}
				style={cardStyle(card)}
				use:cardAction
			>
				<div class="magic-bento-card__header">
					<span class="magic-bento-card__label">{card.label}</span>
				</div>
				<div class="magic-bento-card__content">
					<h3 class="magic-bento-card__title">
						{#if card.icon}
							<Icon name={card.icon} size={22} class="magic-bento-card__icon shrink-0" />
						{/if}
						<span class="magic-bento-card__title-text">{card.title}</span>
					</h3>
					<p class="magic-bento-card__description">{card.description}</p>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.bento-section {
		position: relative;
		user-select: none;
		font-family: 'Open Sans', sans-serif;
	}
	:global(.bento-section .card-grid) {
		display: grid;
		gap: 0.5em;
		padding: 0.75em;
		max-width: 54em;
		font-size: clamp(1rem, 0.9rem + 0.5vw, 1.5rem);
		grid-auto-flow: dense;
	}
	:global(.bento-section .magic-bento-card) {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: stretch;
		position: relative;
		aspect-ratio: 4/3;
		min-height: 200px;
		width: 100%;
		max-width: 100%;
		padding: 1.25em;
		border-radius: 20px;
		border: 1px solid var(--bento-border);
		font-weight: 400;
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		text-align: left;
		transition: all 0.3s var(--ease-smooth);
		--glow-x: 50%;
		--glow-y: 50%;
		--glow-intensity: 0;
		--glow-radius: 200px;
	}
	:global(.bento-section .magic-bento-card:hover) {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px color-mix(in srgb, var(--color-black) 10%, transparent);
	}
	:global(.bento-section .magic-bento-card__header),
	:global(.bento-section .magic-bento-card__content) {
		display: flex;
		position: relative;
		color: inherit;
	}
	:global(.bento-section .magic-bento-card__header) {
		gap: 0.75em;
		justify-content: space-between;
	}
	:global(.bento-section .magic-bento-card__content) {
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
	}
	:global(.bento-section .magic-bento-card__label) {
		font-family: 'Rubik', sans-serif;
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		opacity: 0.85;
	}
	:global(.bento-section .magic-bento-card__title),
	:global(.bento-section .magic-bento-card__description) {
		--clamp-title: 1;
		--clamp-desc: 2;
	}
	:global(.bento-section .magic-bento-card__title) {
		display: flex;
		align-items: center;
		gap: 0.5em;
		font-family: 'Google Sans', 'Open Sans', sans-serif;
		font-weight: 600;
		font-size: 1.125rem;
		letter-spacing: -0.02em;
		margin: 0 0 0.25em;
	}
	:global(.bento-section .magic-bento-card__icon) {
		opacity: 0.92;
	}
	:global(.bento-section .magic-bento-card__title-text) {
		min-width: 0;
	}
	:global(.bento-section .magic-bento-card__description) {
		font-family: 'Open Sans', sans-serif;
		font-size: 0.8125rem;
		font-weight: 400;
		line-height: 1.4;
		opacity: 0.88;
		margin: 0;
		width: 100%;
		text-align: left;
	}
	:global(.bento-section .magic-bento-card--text-autohide .magic-bento-card__title-text),
	:global(.bento-section .magic-bento-card--text-autohide .magic-bento-card__description) {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	:global(.bento-section .magic-bento-card--text-autohide .magic-bento-card__title-text) {
		-webkit-line-clamp: var(--clamp-title);
		line-clamp: var(--clamp-title);
	}
	:global(.bento-section .magic-bento-card--text-autohide .magic-bento-card__description) {
		-webkit-line-clamp: var(--clamp-desc);
		line-clamp: var(--clamp-desc);
	}

	@media (max-width: 599px) {
		:global(.bento-section .card-grid) {
			grid-template-columns: 1fr;
			width: 90%;
			margin: 0 auto;
			padding: 0.5em;
		}
		:global(.bento-section .magic-bento-card) {
			width: 100%;
			min-height: 180px;
		}
	}
	@media (min-width: 600px) {
		:global(.bento-section .card-grid) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		:global(.bento-section .magic-bento-card--wide:not(.magic-bento-card--featured)) {
			grid-column: span 2;
			width: 100%;
			min-width: 0;
			justify-self: stretch;
			aspect-ratio: 8 / 3;
			min-height: 200px;
			align-self: start;
		}

		:global(.bento-section .magic-bento-card--featured) {
			grid-column: span 2;
			grid-row: span 2;
			width: 100%;
			min-width: 0;
			aspect-ratio: auto;
			min-height: 220px;
		}
	}
	@media (min-width: 1024px) {
		:global(.bento-section .card-grid) {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		:global(.bento-section .magic-bento-card--wide:not(.magic-bento-card--featured)) {
			grid-column: span 2;
			width: 100%;
			min-width: 0;
			justify-self: stretch;
			aspect-ratio: 8 / 3;
			min-height: 200px;
			align-self: start;
		}

		:global(.bento-section .magic-bento-card--featured) {
			grid-column: span 2;
			grid-row: span 2;
			width: 100%;
			min-width: 0;
			aspect-ratio: auto;
			min-height: 200px;
		}
	}

	:global(.bento-section .magic-bento-card--border-glow::after) {
		content: '';
		position: absolute;
		inset: 0;
		padding: 6px;
		background: radial-gradient(
			var(--glow-radius) circle at var(--glow-x) var(--glow-y),
			color-mix(in srgb, var(--card-glow) calc(var(--glow-intensity) * 80%), transparent) 0%,
			color-mix(in srgb, var(--card-glow) calc(var(--glow-intensity) * 40%), transparent) 30%,
			transparent 60%
		);
		border-radius: inherit;
		-webkit-mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		mask-composite: exclude;
		pointer-events: none;
		opacity: 1;
		transition: opacity 0.3s ease;
		z-index: 1;
	}
	:global(.bento-section .magic-bento-card--border-glow:hover) {
		box-shadow:
			0 4px 20px color-mix(in srgb, var(--color-black) 12%, transparent),
			0 0 30px var(--card-glow-soft);
	}
	:global(.particle-container) {
		position: relative;
		overflow: hidden;
	}
	:global(.particle::before) {
		content: '';
		position: absolute;
		top: -2px;
		left: -2px;
		right: -2px;
		bottom: -2px;
		background: var(--card-glow-soft);
		border-radius: 50%;
		z-index: -1;
	}
	:global(.bento-section .particle-container:hover) {
		box-shadow:
			0 4px 20px color-mix(in srgb, var(--color-black) 8%, transparent),
			0 0 30px var(--card-glow-soft);
	}
	:global(.global-spotlight) {
		mix-blend-mode: screen;
		will-change: transform, opacity;
		z-index: 200 !important;
		pointer-events: none;
	}
</style>

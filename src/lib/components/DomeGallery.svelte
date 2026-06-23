<script module lang="ts">
	export type DomeGalleryImage = string | { src: string; alt?: string };
	type ItemDef = { src: string; alt: string; x: number; y: number; sizeX: number; sizeY: number };

	const DEFAULT_IMAGES: DomeGalleryImage[] = [
		{ src: '../img/img1.jpg', alt: 'Bleach Cat' },
		{ src: '../img/img2.jpg', alt: 'Lake at Sunset' },
		{ src: '../img/img3.jpg', alt: 'White Blossoms' },
		{ src: '../img/img4.jpg', alt: 'Golden Meadow' },
		{ src: '../img/img5.jpg', alt: 'Ceramic Vases' },
		{ src: '../img/img6.jpg', alt: 'Butterflies on Pine' },
		{ src: '../img/img7.jpg', alt: 'Raindrops on Hosta' },
		{ src: '../img/img8.jpg', alt: 'Red Poppies' },
		{ src: '../img/img9.jpg', alt: 'Tent in the Mist' },
		{ src: '../img/img10.jpg', alt: 'Fallow Deer' },
		{ src: '../img/img11.jpg', alt: 'Glowing Mushroom' },
		{ src: '../img/img12.jpg', alt: 'Red Fox' },
		{ src: '../img/img13.jpg', alt: 'Foggy Log Cabin' },
		{ src: '../img/img14.jpg', alt: 'Mount Rundle' },
		{ src: '../img/img15.jpg', alt: 'Rainy Manhattan' },
		{ src: '../img/img16.jpg', alt: 'Deer by the Lake' },
		{ src: '../img/img17.jpg', alt: 'White Tiger' },
		{ src: '../img/img18.jpg', alt: 'Cats grin' },
		{ src: '../img/img19.jpg', alt: 'Waifu' },
		{ src: '../img/img20.jpg', alt: 'Skull' },
		{ src: '../img/img21.jpg', alt: 'Soft Cat' },
		{ src: '../img/img22.jpg', alt: 'Soft Cat' },
		{ src: '../img/img23.jpg', alt: 'Soft Fox' },
		{ src: '../img/img24.jpg', alt: 'Mini Robot' },
		{ src: '../img/img25.jpg', alt: 'Knight in the Sky' },
		{ src: '../img/img26.jpg', alt: 'Guy looks sky' }
	];

	const clamp = (v: number, mn: number, mx: number) => Math.min(Math.max(v, mn), mx);
	const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
	const wrapSigned = (d: number) => {
		const a = (((d + 180) % 360) + 360) % 360;
		return a - 180;
	};

	function buildItems(pool: DomeGalleryImage[], seg: number): ItemDef[] {
		const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
		const evenY = [-4, -2, 0, 2, 4];
		const oddY = [-3, -1, 1, 3, 5];
		const coords = xCols.flatMap((x, c) =>
			(c % 2 === 0 ? evenY : oddY).map((y) => ({ x, y, sizeX: 2, sizeY: 2 }))
		);
		if (pool.length === 0) return coords.map((c) => ({ ...c, src: '', alt: '' }));
		const norm = pool.map((im) =>
			typeof im === 'string' ? { src: im, alt: '' } : { src: im.src || '', alt: im.alt || '' }
		);
		const used = Array.from({ length: coords.length }, (_, i) => norm[i % norm.length]);
		for (let i = 1; i < used.length; i++) {
			if (used[i].src === used[i - 1].src) {
				for (let j = i + 1; j < used.length; j++) {
					if (used[j].src !== used[i].src) {
						const tmp = used[i];
						used[i] = used[j];
						used[j] = tmp;
						break;
					}
				}
			}
		}
		return coords.map((c, i) => ({ ...c, src: used[i].src, alt: used[i].alt }));
	}

	function computeBaseRot(ox: number, oy: number, sx: number, sy: number, seg: number) {
		const unit = 360 / seg / 2;
		return { rotateY: unit * (ox + (sx - 1) / 2), rotateX: unit * (oy - (sy - 1) / 2) };
	}

	function getDataNumber(el: HTMLElement, name: string, fallback: number) {
		const v = el.dataset[name];
		const n = v == null ? NaN : parseFloat(v);
		return Number.isFinite(n) ? n : fallback;
	}

	export { DEFAULT_IMAGES };
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		images?: DomeGalleryImage[];
		fit?: number;
		fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
		minRadius?: number;
		maxRadius?: number;
		padFactor?: number;
		maxVerticalRotationDeg?: number;
		dragSensitivity?: number;
		enlargeTransitionMs?: number;
		segments?: number;
		dragDampening?: number;
		openedImageWidth?: string;
		openedImageHeight?: string;
		imageBorderRadius?: string;
		openedImageBorderRadius?: string;
		grayscale?: boolean;
		/** Полноэкранный просмотр по клику вместо анимации увеличения в галерее */
		openModalView?: boolean;
	};

	type CursorMode = 'default' | 'grab' | 'grabbing' | 'pointer';
	type TileImage = { src: string; alt: string };
	type Rect = { left: number; top: number; width: number; height: number };

	const TILE_SELECTOR = '.item__image';
	const DRAG_THRESHOLD_SQ = 100;
	const TILE_HOVER_LEAVE_MS = 80;
	const MIN_INERTIA_VELOCITY = 0.005;
	const OPEN_GUARD_MS = 250;

	let {
		images = DEFAULT_IMAGES,
		fit = 0.5,
		fitBasis = 'auto',
		minRadius = 600,
		maxRadius = Infinity,
		padFactor = 0.25,
		maxVerticalRotationDeg = 5,
		dragSensitivity = 20,
		enlargeTransitionMs = 300,
		segments = 35,
		dragDampening = 2,
		openedImageWidth = '400px',
		openedImageHeight = '400px',
		imageBorderRadius = '30px',
		openedImageBorderRadius = '30px',
		grayscale = true,
		openModalView = false
	}: Props = $props();

	let rootRef: HTMLDivElement;
	let mainRef: HTMLDivElement;
	let sphereRef: HTMLDivElement;
	let frameRef: HTMLDivElement;
	let viewerRef: HTMLDivElement;
	let scrimRef: HTMLDivElement;

	const items = $derived(buildItems(images, segments));
	const imageFilter = $derived(grayscale ? 'grayscale(1)' : 'none');

	let rotation = { x: 0, y: 0 };
	let startRot = { x: 0, y: 0 };
	let startPos: { x: number; y: number } | null = null;
	let lastPos = { x: 0, y: 0, t: 0 };
	let velocity = { x: 0, y: 0 };
	let dragging = $state(false);
	let dragIntent = $state(false);
	let pendingTile: HTMLElement | null = null;
	let pointerType: 'mouse' | 'pen' | 'touch' = 'mouse';
	let inertiaRAF: number | null = null;
	let openingRef = false;
	let openStartedAt = 0;
	let focusedEl: HTMLElement | null = null;
	let originalTilePos: Rect | null = null;
	let scrollLocked = false;
	let modalImage = $state<TileImage | null>(null);
	let cursorMode = $state<CursorMode>('default');
	let galleryActive = false;
	let tileHoverDepth = 0;
	let leaveDebounceId: ReturnType<typeof setTimeout> | null = null;

	const findTile = (target: EventTarget | null): HTMLElement | null =>
		(target as Element | null)?.closest?.(TILE_SELECTOR) as HTMLElement | null;

	const getTileImageData = (tile: HTMLElement): TileImage => {
		const parent = tile.parentElement as HTMLElement;
		const img = tile.querySelector('img');
		return {
			src: parent.dataset.src ?? img?.getAttribute('src') ?? '',
			alt: parent.dataset.alt ?? img?.getAttribute('alt') ?? ''
		};
	};

	const clearHoverDebounce = () => {
		if (!leaveDebounceId) return;
		clearTimeout(leaveDebounceId);
		leaveDebounceId = null;
	};

	function resolveCursorMode(): CursorMode {
		if (modalImage || focusedEl) return 'default';
		if (!galleryActive) return 'default';
		if (dragging) {
			if (dragIntent) return 'grabbing';
			if (pendingTile) return 'pointer';
			return 'grab';
		}
		if (inertiaRAF != null) return 'grab';
		if (tileHoverDepth > 0) return 'pointer';
		return 'grab';
	}

	function syncCursor() {
		const next = resolveCursorMode();
		if (cursorMode !== next) cursorMode = next;
	}

	function onTilePointerEnter(e: PointerEvent) {
		if (e.pointerType === 'mouse' && e.buttons !== 0) return;
		clearHoverDebounce();
		tileHoverDepth++;
		syncCursor();
	}

	function onTilePointerLeave(e: PointerEvent) {
		if (e.pointerType === 'mouse' && e.buttons !== 0) return;
		tileHoverDepth = Math.max(0, tileHoverDepth - 1);
		if (tileHoverDepth > 0) {
			syncCursor();
			return;
		}
		clearHoverDebounce();
		leaveDebounceId = setTimeout(() => {
			leaveDebounceId = null;
			syncCursor();
		}, TILE_HOVER_LEAVE_MS);
	}

	function restoreTileHoverFromPoint(clientX: number, clientY: number) {
		if (!rootRef) return;
		const hit = document.elementFromPoint(clientX, clientY);
		if (!hit?.closest?.(TILE_SELECTOR) || !rootRef.contains(hit)) return;
		tileHoverDepth = Math.max(tileHoverDepth, 1);
		clearHoverDebounce();
	}

	function resetTileHover() {
		tileHoverDepth = 0;
		clearHoverDebounce();
	}

	// — scroll & transform —
	function applyTransform(x: number, y: number) {
		if (sphereRef)
			sphereRef.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${x}deg) rotateY(${y}deg)`;
	}

	function lockScroll() {
		if (scrollLocked) return;
		scrollLocked = true;
		document.body.classList.add('dg-scroll-lock');
	}
	function unlockScroll() {
		if (!scrollLocked) return;
		if (rootRef?.getAttribute('data-enlarging') === 'true') return;
		if (modalImage) return;
		scrollLocked = false;
		document.body.classList.remove('dg-scroll-lock');
	}
	function stopInertia() {
		if (inertiaRAF != null) {
			cancelAnimationFrame(inertiaRAF);
			inertiaRAF = null;
		}
	}

	function finishInertia() {
		inertiaRAF = null;
		syncCursor();
	}

	function startInertia(vx: number, vy: number) {
		const MAX = 1.4;
		let vX = clamp(vx, -MAX, MAX) * 80;
		let vY = clamp(vy, -MAX, MAX) * 80;
		let frames = 0;
		const d = clamp(dragDampening ?? 0.6, 0, 1);
		const fric = 0.94 + 0.055 * d;
		const stop = 0.015 - 0.01 * d;
		const maxF = Math.round(90 + 270 * d);
		const step = () => {
			vX *= fric;
			vY *= fric;
			if (Math.abs(vX) < stop && Math.abs(vY) < stop) {
				finishInertia();
				return;
			}
			if (++frames > maxF) {
				finishInertia();
				return;
			}
			const nx = clamp(rotation.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
			const ny = wrapSigned(rotation.y + vX / 200);
			rotation = { x: nx, y: ny };
			applyTransform(nx, ny);
			inertiaRAF = requestAnimationFrame(step);
		};
		stopInertia();
		syncCursor();
		inertiaRAF = requestAnimationFrame(step);
	}

	// — pointer / drag —
	function onPointerDown(e: PointerEvent) {
		if (focusedEl || modalImage) return;
		stopInertia();
		pointerType = (e.pointerType as 'mouse' | 'pen' | 'touch') || 'mouse';
		if (pointerType === 'touch') {
			e.preventDefault();
			lockScroll();
		}
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		dragging = true;
		dragIntent = false;
		pendingTile = findTile(e.target);
		if (pendingTile) restoreTileHoverFromPoint(e.clientX, e.clientY);
		syncCursor();
		startRot = { ...rotation };
		startPos = { x: e.clientX, y: e.clientY };
		lastPos = { x: e.clientX, y: e.clientY, t: performance.now() };
		velocity = { x: 0, y: 0 };
	}
	function onPointerMove(e: PointerEvent) {
		if (!dragging || !startPos) return;
		const dx = e.clientX - startPos.x;
		const dy = e.clientY - startPos.y;
		if (!dragIntent) {
			if (dx * dx + dy * dy > DRAG_THRESHOLD_SQ) {
				dragIntent = true;
				pendingTile = null;
				syncCursor();
			} else {
				return;
			}
		}
		if (pointerType === 'touch') e.preventDefault();
		const nx = clamp(
			startRot.x - dy / dragSensitivity,
			-maxVerticalRotationDeg,
			maxVerticalRotationDeg
		);
		const ny = startRot.y + dx / dragSensitivity;
		rotation = { x: nx, y: ny };
		applyTransform(nx, ny);
		// velocity sample
		const t = performance.now();
		const dt = Math.max(1, t - lastPos.t);
		velocity = { x: (e.clientX - lastPos.x) / dt, y: (e.clientY - lastPos.y) / dt };
		lastPos = { x: e.clientX, y: e.clientY, t };
	}
	function onPointerUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		const tile = pendingTile;
		pendingTile = null;

		if (!dragIntent && tile && !focusedEl) handleTileOpen(tile);
		else if (
			dragIntent &&
			(Math.abs(velocity.x) > MIN_INERTIA_VELOCITY || Math.abs(velocity.y) > MIN_INERTIA_VELOCITY)
		)
			startInertia(velocity.x, velocity.y);

		startPos = null;
		if (pointerType === 'touch') unlockScroll();
		dragIntent = false;
		restoreTileHoverFromPoint(e.clientX, e.clientY);
		syncCursor();
	}

	function onMainPointerEnter() {
		galleryActive = true;
		syncCursor();
	}

	function onMainPointerLeave() {
		galleryActive = false;
		resetTileHover();
		syncCursor();
	}

	// — tile open: modal & enlarge —
	function openModalFromElement(el: HTMLElement) {
		const { src, alt } = getTileImageData(el);
		if (!src) return;
		modalImage = { src, alt };
		lockScroll();
		syncCursor();
	}

	function closeModal() {
		modalImage = null;
		unlockScroll();
		syncCursor();
	}

	function handleTileOpen(el: HTMLElement) {
		if (openModalView) openModalFromElement(el);
		else openItemFromElement(el);
	}

	function openItemFromElement(el: HTMLElement) {
		if (openingRef) return;
		openingRef = true;
		openStartedAt = performance.now();
		lockScroll();
		const parent = el.parentElement as HTMLElement;
		focusedEl = el;
		el.setAttribute('data-focused', 'true');
		const ox = getDataNumber(parent, 'offsetX', 0);
		const oy = getDataNumber(parent, 'offsetY', 0);
		const sx = getDataNumber(parent, 'sizeX', 2);
		const sy = getDataNumber(parent, 'sizeY', 2);
		const pr = computeBaseRot(ox, oy, sx, sy, segments);
		const py = normalizeAngle(pr.rotateY);
		const gy = normalizeAngle(rotation.y);
		let rotY = -(py + gy) % 360;
		if (rotY < -180) rotY += 360;
		const rotX = -pr.rotateX - rotation.x;
		parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
		parent.style.setProperty('--rot-x-delta', `${rotX}deg`);
		const refDiv = document.createElement('div');
		refDiv.className = 'item__image item__image--reference opacity-0';
		refDiv.style.transform = `rotateX(${-pr.rotateX}deg) rotateY(${-pr.rotateY}deg)`;
		parent.appendChild(refDiv);
		void refDiv.offsetHeight;
		const tileR = refDiv.getBoundingClientRect();
		const mainR = mainRef?.getBoundingClientRect();
		const frameR = frameRef?.getBoundingClientRect();
		if (!mainR || !frameR || tileR.width <= 0) {
			openingRef = false;
			focusedEl = null;
			parent.removeChild(refDiv);
			unlockScroll();
			syncCursor();
			return;
		}
		originalTilePos = {
			left: tileR.left,
			top: tileR.top,
			width: tileR.width,
			height: tileR.height
		};
		el.style.visibility = 'hidden';
		el.style.zIndex = '0';
		const { src, alt } = getTileImageData(el);
		const overlay = document.createElement('div');
		overlay.className = 'enlarge';
		overlay.style.cssText = `position:absolute;left:${frameR.left - mainR.left}px;top:${frameR.top - mainR.top}px;width:${frameR.width}px;height:${frameR.height}px;opacity:0;z-index:30;will-change:transform,opacity;transform-origin:top left;transition:transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease;border-radius:${openedImageBorderRadius};overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);`;
		const img = document.createElement('img');
		img.src = src;
		img.alt = alt;
		img.style.cssText = `width:100%;height:100%;object-fit:cover;filter:${imageFilter};`;
		overlay.appendChild(img);
		viewerRef.appendChild(overlay);
		const tx0 = tileR.left - frameR.left;
		const ty0 = tileR.top - frameR.top;
		const sx0 = tileR.width / frameR.width;
		const sy0 = tileR.height / frameR.height;
		const vsx = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
		const vsy = isFinite(sy0) && sy0 > 0 ? sy0 : 1;
		overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${vsx}, ${vsy})`;
		setTimeout(() => {
			if (!overlay.parentElement) return;
			overlay.style.opacity = '1';
			overlay.style.transform = 'translate(0,0) scale(1,1)';
			rootRef?.setAttribute('data-enlarging', 'true');
		}, 16);
		const wantsResize = openedImageWidth || openedImageHeight;
		if (wantsResize) {
			const onFirstEnd = (ev: TransitionEvent) => {
				if (ev.propertyName !== 'transform') return;
				overlay.removeEventListener('transitionend', onFirstEnd);
				const prevT = overlay.style.transition;
				overlay.style.transition = 'none';
				const tw = openedImageWidth || `${frameR.width}px`;
				const th = openedImageHeight || `${frameR.height}px`;
				overlay.style.width = tw;
				overlay.style.height = th;
				const nr = overlay.getBoundingClientRect();
				overlay.style.width = frameR.width + 'px';
				overlay.style.height = frameR.height + 'px';
				void overlay.offsetWidth;
				overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;
				const cl = frameR.left - mainR.left + (frameR.width - nr.width) / 2;
				const ct = frameR.top - mainR.top + (frameR.height - nr.height) / 2;
				requestAnimationFrame(() => {
					overlay.style.left = `${cl}px`;
					overlay.style.top = `${ct}px`;
					overlay.style.width = tw;
					overlay.style.height = th;
				});
				overlay.addEventListener(
					'transitionend',
					() => {
						overlay.style.transition = prevT;
					},
					{ once: true }
				);
			};
			overlay.addEventListener('transitionend', onFirstEnd);
		}
	}

	function closeOverlay() {
		if (performance.now() - openStartedAt < OPEN_GUARD_MS) return;
		const el = focusedEl;
		if (!el) return;
		const parent = el.parentElement as HTMLElement;
		const overlay = viewerRef?.querySelector('.enlarge') as HTMLElement | null;
		if (!overlay) return;
		const refDiv = parent.querySelector('.item__image--reference') as HTMLElement | null;
		const op = originalTilePos;
		if (!op) {
			overlay.remove();
			refDiv?.remove();
			parent.style.setProperty('--rot-y-delta', `0deg`);
			parent.style.setProperty('--rot-x-delta', `0deg`);
			el.style.visibility = '';
			el.style.zIndex = '0';
			focusedEl = null;
			rootRef?.removeAttribute('data-enlarging');
			openingRef = false;
			syncCursor();
			return;
		}
		const cur = overlay.getBoundingClientRect();
		const rr = rootRef.getBoundingClientRect();
		const opR = {
			left: op.left - rr.left,
			top: op.top - rr.top,
			width: op.width,
			height: op.height
		};
		const ovR = {
			left: cur.left - rr.left,
			top: cur.top - rr.top,
			width: cur.width,
			height: cur.height
		};
		const ao = document.createElement('div');
		ao.className = 'enlarge-closing';
		ao.style.cssText = `position:absolute;left:${ovR.left}px;top:${ovR.top}px;width:${ovR.width}px;height:${ovR.height}px;z-index:9999;border-radius:${openedImageBorderRadius};overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;filter:${imageFilter};`;
		const oi = overlay.querySelector('img');
		if (oi) {
			const img = oi.cloneNode() as HTMLImageElement;
			img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
			ao.appendChild(img);
		}
		overlay.remove();
		rootRef.appendChild(ao);
		void ao.getBoundingClientRect();
		requestAnimationFrame(() => {
			ao.style.left = `${opR.left}px`;
			ao.style.top = `${opR.top}px`;
			ao.style.width = `${opR.width}px`;
			ao.style.height = `${opR.height}px`;
			ao.style.opacity = '0';
		});
		ao.addEventListener(
			'transitionend',
			() => {
				ao.remove();
				originalTilePos = null;
				refDiv?.remove();
				parent.style.transition = 'none';
				el.style.transition = 'none';
				parent.style.setProperty('--rot-y-delta', `0deg`);
				parent.style.setProperty('--rot-x-delta', `0deg`);
				requestAnimationFrame(() => {
					el.style.visibility = '';
					el.style.opacity = '0';
					el.style.zIndex = '0';
					focusedEl = null;
					rootRef?.removeAttribute('data-enlarging');
					requestAnimationFrame(() => {
						parent.style.transition = '';
						el.style.transition = 'opacity 300ms ease-out';
						requestAnimationFrame(() => {
							el.style.opacity = '1';
							setTimeout(() => {
								el.style.transition = '';
								el.style.opacity = '';
								openingRef = false;
								if (!dragging && rootRef?.getAttribute('data-enlarging') !== 'true') {
									document.body.classList.remove('dg-scroll-lock');
								}
								syncCursor();
							}, 300);
						});
					});
				});
			},
			{ once: true }
		);
	}

	function updateSphereLayout(w: number, h: number) {
		const minDim = Math.min(w, h);
		const maxDim = Math.max(w, h);
		const aspect = w / h;
		let basis: number;
		switch (fitBasis) {
			case 'min':
				basis = minDim;
				break;
			case 'max':
				basis = maxDim;
				break;
			case 'width':
				basis = w;
				break;
			case 'height':
				basis = h;
				break;
			default:
				basis = aspect >= 1.3 ? w : minDim;
		}
		let radius = basis * fit;
		radius = Math.min(radius, h * 1.35);
		radius = clamp(radius, minRadius, maxRadius);
		rootRef.style.setProperty('--radius', `${Math.round(radius)}px`);
		rootRef.style.setProperty('--viewer-pad', `${Math.max(8, Math.round(minDim * padFactor))}px`);
		rootRef.style.setProperty('--tile-radius', imageBorderRadius);
		rootRef.style.setProperty('--enlarge-radius', openedImageBorderRadius);
		rootRef.style.setProperty('--image-filter', imageFilter);
		applyTransform(rotation.x, rotation.y);
	}

	onMount(() => {
		const ro = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			updateSphereLayout(Math.max(1, width), Math.max(1, height));
		});
		ro.observe(rootRef);
		applyTransform(0, 0);

		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return;
			if (modalImage) closeModal();
			else closeOverlay();
		};
		const onScrim = () => closeOverlay();
		scrimRef.addEventListener('click', onScrim);
		window.addEventListener('keydown', onKey);

		return () => {
			ro.disconnect();
			scrimRef?.removeEventListener('click', onScrim);
			window.removeEventListener('keydown', onKey);
			resetTileHover();
			modalImage = null;
			document.body.classList.remove('dg-scroll-lock');
			stopInertia();
		};
	});

	function handleTileKeyDown(e: KeyboardEvent) {
		if (e.key !== 'Enter' && e.key !== ' ') return;
		e.preventDefault();
		if (openingRef || focusedEl || modalImage) return;
		handleTileOpen(e.currentTarget as HTMLElement);
	}
</script>

<div
	bind:this={rootRef}
	class="sphere-root relative w-full h-full"
	style="--segments-x:{segments};--segments-y:{segments};--tile-radius:{imageBorderRadius};--enlarge-radius:{openedImageBorderRadius};--image-filter:{imageFilter};"
>
	<div
		bind:this={mainRef}
		class="gallery-main absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent"
		style="--gallery-cursor:{cursorMode};touch-action:none;-webkit-user-select:none;"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
		onpointerenter={onMainPointerEnter}
		onpointerleave={onMainPointerLeave}
		role="presentation"
	>
		<div class="stage">
			<div bind:this={sphereRef} class="sphere">
				{#each items as it, i (`${it.x},${it.y},${i}`)}
					<div
						class="sphere-item absolute m-auto"
						data-src={it.src}
						data-alt={it.alt}
						data-offset-x={it.x}
						data-offset-y={it.y}
						data-size-x={it.sizeX}
						data-size-y={it.sizeY}
						style="--offset-x:{it.x};--offset-y:{it.y};--item-size-x:{it.sizeX};--item-size-y:{it.sizeY};top:-999px;bottom:-999px;left:-999px;right:-999px;"
					>
						<div
							class="item__image absolute block overflow-hidden bg-gray-200 shadow-md shadow-black/30 transition-transform ui-ease-transition"
							role="button"
							tabindex="0"
							aria-label={it.alt || 'Open image'}
							onpointerenter={onTilePointerEnter}
							onpointerleave={onTilePointerLeave}
							onkeydown={handleTileKeyDown}
							style="inset:10px;border-radius:var(--tile-radius, {imageBorderRadius});backface-visibility:hidden;"
						>
							<img
								src={it.src}
								draggable="false"
								alt={it.alt}
								class="w-full h-full object-cover pointer-events-none"
								style="backface-visibility:hidden;filter:var(--image-filter, {imageFilter});"
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div
			bind:this={viewerRef}
			class="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
			style="padding:var(--viewer-pad);"
		>
			<div
				bind:this={scrimRef}
				class="scrim absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-500"
				style="background:rgba(0,0,0,0.4);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);"
			></div>
			<div
				bind:this={frameRef}
				class="viewer-frame h-full aspect-square flex"
				style="border-radius:var(--enlarge-radius, {openedImageBorderRadius});"
			></div>
		</div>
	</div>
</div>

{#if modalImage}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="dg-modal"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-label={modalImage.alt || 'Image preview'}
		onclick={closeModal}
	>
		<button
			type="button"
			class="dg-modal__close"
			aria-label="Закрыть"
			onclick={(e) => {
				e.stopPropagation();
				closeModal();
			}}
		>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path
					d="M18 6L6 18M6 6l12 12"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</button>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="dg-modal__content" onclick={(e) => e.stopPropagation()}>
			<img
				src={modalImage.src}
				alt={modalImage.alt}
				class="dg-modal__image"
				style:filter={imageFilter}
			/>
			{#if modalImage.alt}
				<p class="dg-modal__caption">{modalImage.alt}</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	:global(.sphere-root) {
		--radius: 520px;
		--viewer-pad: 72px;
		--circ: calc(var(--radius) * 3.14);
		--rot-y: calc((360deg / var(--segments-x)) / 2);
		--rot-x: calc((360deg / var(--segments-y)) / 2);
		--item-width: calc(var(--circ) / var(--segments-x));
		--item-height: calc(var(--circ) / var(--segments-y));
	}
	:global(.sphere-root *) {
		box-sizing: border-box;
	}
	:global(.sphere-root .sphere),
	:global(.sphere-root .sphere-item),
	:global(.sphere-root .item__image) {
		transform-style: preserve-3d;
	}
	:global(.sphere-root .stage) {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		position: absolute;
		inset: 0;
		margin: auto;
		perspective: calc(var(--radius) * 2);
		perspective-origin: 50% 50%;
	}
	:global(.sphere-root .gallery-main) {
		cursor: var(--gallery-cursor, grab);
	}
	:global(.sphere-root .gallery-main *),
	:global(.sphere-root .gallery-main *::before),
	:global(.sphere-root .gallery-main *::after) {
		cursor: inherit !important;
	}
	:global(.sphere-root .sphere) {
		transform: translateZ(calc(var(--radius) * -1));
		will-change: transform;
		position: absolute;
	}
	:global(.sphere-root .sphere-item) {
		width: calc(var(--item-width) * var(--item-size-x));
		height: calc(var(--item-height) * var(--item-size-y));
		position: absolute;
		top: -999px;
		bottom: -999px;
		left: -999px;
		right: -999px;
		margin: auto;
		transform-origin: 50% 50%;
		backface-visibility: hidden;
		transition: transform 300ms;
		transform: rotateY(
				calc(
					var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) +
						var(--rot-y-delta, 0deg)
				)
			)
			rotateX(
				calc(
					var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) +
						var(--rot-x-delta, 0deg)
				)
			)
			translateZ(var(--radius));
	}
	:global(.sphere-root[data-enlarging='true'] .scrim) {
		opacity: 1 !important;
		pointer-events: all !important;
	}
	@media (max-aspect-ratio: 1/1) {
		:global(.sphere-root .viewer-frame) {
			height: auto !important;
			width: 100% !important;
		}
	}
	:global(.item__image) {
		position: absolute;
		inset: 10px;
		border-radius: var(--tile-radius, 12px);
		overflow: hidden;
		backface-visibility: hidden;
		transition: transform 300ms;
		pointer-events: auto;
		transform: translateZ(0);
	}
	:global(.item__image--reference) {
		position: absolute;
		inset: 10px;
		pointer-events: none;
	}

	.dg-modal {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(4px);
		cursor: default;
		animation: dg-modal-in 200ms ease-out;
	}

	.dg-modal__close {
		position: absolute;
		top: 1.25rem;
		right: 1.25rem;
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border: none;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
		cursor: pointer;
		transition: background 150ms ease;
	}

	.dg-modal__close:hover {
		background: rgba(255, 255, 255, 0.16);
	}

	.dg-modal__content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		max-width: 100%;
		gap: 1rem;
	}

	.dg-modal__image {
		max-width: min(100%, 96vw);
		max-height: calc(100dvh - 6rem);
		width: auto;
		height: auto;
		object-fit: contain;
		user-select: none;
		-webkit-user-drag: none;
	}

	.dg-modal__caption {
		margin: 0;
		max-width: min(42rem, 92vw);
		padding: 0 0.5rem 0.5rem;
		color: rgba(255, 255, 255, 0.82);
		font-size: 0.95rem;
		line-height: 1.5;
		text-align: center;
		letter-spacing: 0.01em;
	}

	@keyframes dg-modal-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>

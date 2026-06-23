<script module lang="ts">
	import * as THREE from 'three';
	import { sfx } from '$lib/sound.svelte';

	export type DistortionSlide = {
		name: string;
		img: string;
	};

	export type DistortionSliderOrientation = 'vertical' | 'horizontal';

	export type DistortionSliderConfig = {
		minHeight: number;
		maxHeight: number;
		aspectRatio: number;
		gap: number;
		smoothing: number;
		distortionStrength: number;
		distortionSmoothing: number;
		momentumFriction: number;
		momentumThreshold: number;
		wheelSpeed: number;
		wheelMax: number;
		dragSpeed: number;
		dragMomentum: number;
		touchSpeed: number;
		touchMomentum: number;
	};

	type SlideMeshUserData = {
		originalVertices: Float32Array | number[];
		offset: number;
		name: string;
		index: number;
	};

	type DistortionMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> & {
		userData: SlideMeshUserData;
	};

	export const DEFAULT_DISTORTION_CONFIG: DistortionSliderConfig = {
		minHeight: 1,
		maxHeight: 1.5,
		aspectRatio: 1.5,
		gap: 0.05,
		smoothing: 0.05,
		distortionStrength: 2.5,
		distortionSmoothing: 0.1,
		momentumFriction: 0.95,
		momentumThreshold: 0.001,
		wheelSpeed: 0.01,
		wheelMax: 150,
		dragSpeed: 0.01,
		dragMomentum: 0.01,
		touchSpeed: 0.01,
		touchMomentum: 0.1
	};

	export const DEFAULT_DISTORTION_SLIDES: DistortionSlide[] = [
		{ name: 'Bleach Cat', img: '/img/img1.jpg' },
		{ name: 'Lake at Sunset', img: '/img/img2.jpg' },
		{ name: 'White Blossoms', img: '/img/img3.jpg' },
		{ name: 'Golden Meadow', img: '/img/img4.jpg' },
		{ name: 'Ceramic Vases', img: '/img/img5.jpg' },
		{ name: 'Butterflies on Pine', img: '/img/img6.jpg' },
		{ name: 'Raindrops on Hosta', img: '/img/img7.jpg' },
		{ name: 'Red Poppies', img: '/img/img8.jpg' },
		{ name: 'Tent in the Mist', img: '/img/img9.jpg' },
		{ name: 'Fallow Deer', img: '/img/img10.jpg' },
		{ name: 'Glowing Mushroom', img: '/img/img11.jpg' },
		{ name: 'Red Fox', img: '/img/img12.jpg' },
		{ name: 'Foggy Log Cabin', img: '/img/img13.jpg' },
		{ name: 'Mount Rundle', img: '/img/img14.jpg' },
		{ name: 'Rainy Manhattan', img: '/img/img15.jpg' },
		{ name: 'Deer by the Lake', img: '/img/img16.jpg' },
		{ name: 'White Tiger', img: '/img/img17.jpg' },
		{ name: 'Cats grin', img: '/img/img18.jpg' },
		{ name: 'Waifu', img: '/img/img19.jpg' },
		{ name: 'Skull', img: '/img/img20.jpg' },
		{ name: 'Soft Cat', img: '/img/img21.jpg' },
		{ name: 'Soft Cat', img: '/img/img22.jpg' },
		{ name: 'Soft Fox', img: '/img/img23.jpg' },
		{ name: 'Mini Robot', img: '/img/img24.jpg' },
		{ name: 'Knight in the Sky', img: '/img/img25.jpg' },
		{ name: 'Guy looks sky', img: '/img/img26.jpg' }
	];

	const wrap = (value: number, range: number) => ((value % range) + range) % range;

	const applyDistortion = (
		mesh: DistortionMesh,
		position: number,
		strength: number,
		orientation: DistortionSliderOrientation
	) => {
		const positions = mesh.geometry.attributes.position;
		const original = mesh.userData.originalVertices;
		const horizontal = orientation === 'horizontal';

		for (let i = 0; i < positions.count; i++) {
			const x = original[i * 3];
			const y = original[i * 3 + 1];
			const distance = horizontal
				? Math.sqrt((position + x) ** 2 + y * y)
				: Math.sqrt(x * x + (position + y) ** 2);
			const falloff = Math.max(0, 1 - distance / 2);
			const bend = Math.pow(Math.sin((falloff * Math.PI) / 2), 1.5);
			positions.setZ(i, bend * strength);
		}

		positions.needsUpdate = true;
		mesh.geometry.computeVertexNormals();
	};

	const createDistortionSlider = (
		canvas: HTMLCanvasElement,
		slides: DistortionSlide[],
		config: DistortionSliderConfig,
		backgroundColor: number | null,
		orientation: DistortionSliderOrientation,
		onActiveSlideChange: (index: number, name: string) => void
	) => {
		const horizontal = orientation === 'horizontal';
		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		if (backgroundColor === null) {
			renderer.setClearColor(0x000000, 0);
		} else {
			renderer.setClearColor(backgroundColor, 1);
		}

		const scene = new THREE.Scene();
		if (backgroundColor !== null) {
			scene.background = new THREE.Color(backgroundColor);
		}

		const camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			100
		);
		camera.position.z = 5;

		const totalSlides = slides.length;
		const slideSizes = Array.from(
			{ length: totalSlides },
			() => config.minHeight + Math.random() * (config.maxHeight - config.minHeight)
		);

		const slideOffsets: number[] = [];
		let stackPosition = 0;

		for (let i = 0; i < totalSlides; i++) {
			if (i === 0) {
				slideOffsets.push(0);
				stackPosition = slideSizes[0] / 2;
			} else {
				stackPosition += config.gap + slideSizes[i] / 2;
				slideOffsets.push(stackPosition);
				stackPosition += slideSizes[i] / 2;
			}
		}

		const loopLength = stackPosition + config.gap + slideSizes[0] / 2;
		const halfLoop = loopLength / 2;
		const maxSlideSize = config.maxHeight;

		const meshes: DistortionMesh[] = [];
		const textureLoader = new THREE.TextureLoader();

		for (let i = 0; i < totalSlides; i++) {
			const primary = slideSizes[i];
			const width = horizontal ? primary : primary * config.aspectRatio;
			const height = horizontal ? primary / config.aspectRatio : primary;
			const segmentsX = horizontal ? 16 : 32;
			const segmentsY = horizontal ? 32 : 16;

			const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
			const material = new THREE.MeshBasicMaterial({
				side: THREE.DoubleSide,
				color: 0x999999
			});

			const mesh = new THREE.Mesh(geometry, material) as DistortionMesh;
			mesh.userData = {
				originalVertices: [...geometry.attributes.position.array],
				offset: slideOffsets[i],
				name: slides[i].name,
				index: i
			};

			textureLoader.load(slides[i].img, (texture) => {
				texture.colorSpace = THREE.SRGBColorSpace;

				material.map = texture;
				material.color.set(0xffffff);
				material.needsUpdate = true;

				const imageAspect = texture.image.width / texture.image.height;
				const planeAspect = width / height;
				const ratio = imageAspect / planeAspect;

				if (ratio > 1) {
					mesh.scale.y = 1 / ratio;
				} else {
					mesh.scale.x = ratio;
				}
			});

			scene.add(mesh);
			meshes.push(mesh);
		}

		let scrollPosition = 0;
		let scrollTarget = 0;
		let scrollMomentum = 0;
		let isScrolling = false;
		let lastFrameTime = 0;

		let distortionAmount = 0;
		let distortionTarget = 0;
		let velocityPeak = 0;
		let scrollDirection = 0;
		let directionTarget = 0;
		const velocityHistory = [0, 0, 0, 0, 0];

		let isDragging = false;
		let dragStart = 0;
		let dragDelta = 0;
		let touchStart = 0;
		let touchLast = 0;

		let activeSlideIndex = -1;
		let scrollTimeout: ReturnType<typeof setTimeout> | undefined;
		let raf = 0;

		const getWheelDelta = (e: WheelEvent) => {
			if (!horizontal) return e.deltaY;
			return Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
		};

		const getPointer = (e: MouseEvent | Touch) => (horizontal ? e.clientX : e.clientY);

		const addDistortionBurst = (amount: number) => {
			distortionTarget = Math.min(1, distortionTarget + amount);
		};

		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			sfx.unlock();

			const rawDelta = getWheelDelta(e);
			const clampedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), config.wheelMax);

			addDistortionBurst(Math.abs(clampedDelta) * 0.001);
			scrollTarget += clampedDelta * config.wheelSpeed;
			isScrolling = true;

			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				isScrolling = false;
			}, 150);
		};

		const onTouchStart = (e: TouchEvent) => {
			sfx.unlock();
			touchStart = touchLast = getPointer(e.touches[0]);
			isScrolling = false;
			scrollMomentum = 0;
		};

		const onTouchMove = (e: TouchEvent) => {
			e.preventDefault();

			const pointer = getPointer(e.touches[0]);
			const delta = pointer - touchLast;
			touchLast = pointer;

			addDistortionBurst(Math.abs(delta) * 0.02);
			scrollTarget -= delta * config.touchSpeed;
			isScrolling = true;
		};

		const onTouchEnd = () => {
			const swipeVelocity = (touchLast - touchStart) * 0.005;

			if (Math.abs(swipeVelocity) > 0.5) {
				scrollMomentum = -swipeVelocity * config.touchMomentum;
				addDistortionBurst(Math.abs(swipeVelocity) * 0.45);
				isScrolling = true;
				setTimeout(() => {
					isScrolling = false;
				}, 800);
			}
		};

		const onMouseDown = (e: MouseEvent) => {
			sfx.unlock();
			isDragging = true;
			dragStart = getPointer(e);
			dragDelta = 0;
			scrollMomentum = 0;
			canvas.style.cursor = 'grabbing';
		};

		const onMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;

			const pointer = getPointer(e);
			const delta = pointer - dragStart;
			dragStart = pointer;
			dragDelta = delta;

			addDistortionBurst(Math.abs(delta) * 0.02);
			scrollTarget -= delta * config.dragSpeed;
			isScrolling = true;
		};

		const onMouseUp = () => {
			if (!isDragging) return;

			isDragging = false;
			canvas.style.cursor = 'grab';

			if (Math.abs(dragDelta) > 2) {
				scrollMomentum = -dragDelta * config.dragMomentum;
				addDistortionBurst(Math.abs(dragDelta) * 0.005);
				isScrolling = true;
				setTimeout(() => {
					isScrolling = false;
				}, 800);
			}
		};

		const onResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};

		canvas.style.cursor = 'grab';

		window.addEventListener('wheel', onWheel, { passive: false });
		window.addEventListener('touchstart', onTouchStart, { passive: false });
		window.addEventListener('touchmove', onTouchMove, { passive: false });
		window.addEventListener('touchend', onTouchEnd);
		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
		window.addEventListener('resize', onResize);

		const animate = (time: number) => {
			raf = requestAnimationFrame(animate);

			const deltaTime = lastFrameTime ? (time - lastFrameTime) / 1000 : 0.016;
			lastFrameTime = time;

			const previousScroll = scrollPosition;

			if (isScrolling) {
				scrollTarget += scrollMomentum;
				scrollMomentum *= config.momentumFriction;
				if (Math.abs(scrollMomentum) < config.momentumThreshold) scrollMomentum = 0;
			}

			scrollPosition += (scrollTarget - scrollPosition) * config.smoothing;

			const frameDelta = scrollPosition - previousScroll;

			if (Math.abs(frameDelta) > 0.00001) {
				directionTarget = frameDelta > 0 ? 1 : -1;
			}

			scrollDirection += (directionTarget - scrollDirection) * 0.08;

			const velocity = Math.abs(frameDelta) / deltaTime;
			velocityHistory.push(velocity);
			velocityHistory.shift();
			const averageVelocity = velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length;

			if (averageVelocity > velocityPeak) velocityPeak = averageVelocity;

			const isDecelerating = averageVelocity / (velocityPeak + 0.001) < 0.7 && velocityPeak > 0.5;
			velocityPeak *= 0.99;

			if (velocity > 0.05) {
				distortionTarget = Math.max(distortionTarget, Math.min(1, velocity * 0.1));
			}

			if (isDecelerating || averageVelocity < 0.2) {
				distortionTarget *= isDecelerating ? 0.95 : 0.855;
			}

			distortionAmount += (distortionTarget - distortionAmount) * config.distortionSmoothing;

			const signedDistortion = distortionAmount * scrollDirection;

			let closestDistance = Infinity;
			let closestIndex = 0;

			meshes.forEach((mesh) => {
				const { offset } = mesh.userData;

				let axis = -(offset - wrap(scrollPosition, loopLength));
				axis = wrap(axis + halfLoop, loopLength) - halfLoop;

				if (horizontal) {
					mesh.position.x = axis;
					mesh.position.y = 0;
				} else {
					mesh.position.x = 0;
					mesh.position.y = axis;
				}

				if (Math.abs(axis) < closestDistance) {
					closestDistance = Math.abs(axis);
					closestIndex = mesh.userData.index;
				}

				if (Math.abs(axis) < halfLoop + maxSlideSize) {
					applyDistortion(mesh, axis, config.distortionStrength * signedDistortion, orientation);
				}
			});

			if (closestIndex !== activeSlideIndex) {
				activeSlideIndex = closestIndex;
				onActiveSlideChange(activeSlideIndex, slides[activeSlideIndex].name);
			}

			renderer.render(scene, camera);
		};

		raf = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(scrollTimeout);

			window.removeEventListener('wheel', onWheel);
			window.removeEventListener('touchstart', onTouchStart);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onTouchEnd);
			window.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('resize', onResize);

			meshes.forEach((mesh) => {
				mesh.geometry.dispose();
				mesh.material.map?.dispose();
				mesh.material.dispose();
				scene.remove(mesh);
			});

			renderer.dispose();
		};
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		slides?: DistortionSlide[];
		config?: Partial<DistortionSliderConfig>;
		backgroundColor?: string | null;
		orientation?: DistortionSliderOrientation;
		class?: string;
	};

	let {
		slides = DEFAULT_DISTORTION_SLIDES,
		config: configOverrides = {},
		backgroundColor = null,
		orientation = 'vertical',
		class: className = ''
	}: Props = $props();

	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let activeTitle = $state('');
	let activeIndex = $state(0);

	const zeroPad = (n: number) => String(n).padStart(2, '0');

	const sliderConfig = $derived({ ...DEFAULT_DISTORTION_CONFIG, ...configOverrides });
	const sceneBackground = $derived(
		backgroundColor ? Number.parseInt(backgroundColor.replace('#', ''), 16) : null
	);

	onMount(() => {
		if (!canvasEl) return;

		let slideSoundReady = false;

		return createDistortionSlider(
			canvasEl,
			slides,
			sliderConfig,
			sceneBackground,
			orientation,
			(index, name) => {
				activeIndex = index;
				activeTitle = name;

				if (slideSoundReady) {
					sfx.play('scroll');
				} else {
					slideSoundReady = true;
				}
			}
		);
	});
</script>

<section class="distortion-slider {className}" data-orientation={orientation}>
	<div class="distortion-slider__info">
		<p class="distortion-slider__title">{activeTitle}</p>
		<p class="distortion-slider__count">{zeroPad(activeIndex + 1)}</p>
	</div>

	<canvas bind:this={canvasEl} class="distortion-slider__canvas"></canvas>
</section>

<style>
	.distortion-slider {
		position: relative;
		width: 100%;
		height: 100svh;
		overflow: hidden;
	}

	.distortion-slider__canvas {
		position: fixed;
		inset: 0;
		z-index: 1;
		width: 100%;
		height: 100%;
		overflow: hidden;
		pointer-events: auto;
	}

	.distortion-slider__info {
		position: absolute;
		z-index: 2;
		display: flex;
		color: var(--color-canvas);
		pointer-events: none;
		mix-blend-mode: difference;
	}

	/* vertical: название слева, счётчик справа */
	.distortion-slider[data-orientation='vertical'] .distortion-slider__info {
		top: 50%;
		left: 0;
		width: 100%;
		justify-content: space-between;
		padding: 0 2rem;
		transform: translateY(-50%);
	}

	/* horizontal: название сверху, счётчик снизу */
	.distortion-slider[data-orientation='horizontal'] .distortion-slider__info {
		top: 0;
		left: 50%;
		height: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		padding: 2rem 0;
		transform: translateX(-50%);
	}

	.distortion-slider__title {
		font-size: clamp(1.5rem, 4vw, 3rem);
		font-weight: 500;
		letter-spacing: -0.02em;
		text-align: center;
	}

	.distortion-slider__count {
		font-size: clamp(1.5rem, 4vw, 3rem);
		font-weight: 500;
		opacity: 0.85;
	}

	@media (max-width: 768px) {
		.distortion-slider__title {
			font-size: clamp(1rem, 2vw, 2rem);
		}

		.distortion-slider__count {
			font-size: clamp(1rem, 2vw, 2rem);
		}
	}
</style>

/**
 * Центральный модуль звуков. Каталог — пара строк на звук (src + cooldown).
 * HTMLAudio + clone для overlap, cooldown, SSR-safe, unlock после жеста.
 */
import { browser } from '$app/environment';

/** Добавь звук: `name: { src, cooldown?, bypassGlobal? }` */
export const SOUND_CATALOG = {
	hover: { src: '/sfx/ui/ui_hover_3.mp3', cooldown: 120 },
	click: { src: '/sfx/ui/ui_tap.mp3', cooldown: 100 },
	tap: { src: '/sfx/ui/ui_tap.mp3', cooldown: 100 },
	scroll: { src: '/sfx/ui/scroll.mp3', cooldown: 10 },
	// open: { src: '/sfx/ui/popup-open.mp3', cooldown: 400, bypassGlobal: true },
	openMenu: { src: '/sfx/ui/open-menu.mp3', cooldown: 300, bypassGlobal: true },
	closeMenu: { src: '/sfx/ui/close-menu.mp3', cooldown: 300, bypassGlobal: true }
} as const satisfies Record<string, { src: string; cooldown: number; bypassGlobal?: boolean }>;

export type SoundName = keyof typeof SOUND_CATALOG;

const STORAGE = {
	enabled: 'sound-enabled',
	volume: 'sound-volume',
	musicEnabled: 'music-enabled',
	musicVolume: 'music-volume'
} as const;
const GLOBAL_COOLDOWN_MS = 70;

class SoundPrefs {
	enabled = $state(true);
	volume = $state(0.5);
}

class MusicPrefs {
	enabled = $state(true);
	volume = $state(0.1);
}

export const soundPrefs = new SoundPrefs();
export const musicPrefs = new MusicPrefs();

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const loadPrefs = (): void => {
	if (!browser) return;

	try {
		const storedVol = localStorage.getItem(STORAGE.volume);
		if (storedVol != null) {
			const v = Number(storedVol);
			if (!Number.isNaN(v)) soundPrefs.volume = clamp(v, 0, 1);
		}
		const storedEnabled = localStorage.getItem(STORAGE.enabled);
		if (storedEnabled !== null) soundPrefs.enabled = storedEnabled === 'true';

		const storedMusicVol = localStorage.getItem(STORAGE.musicVolume);
		if (storedMusicVol != null) {
			const v = Number(storedMusicVol);
			if (!Number.isNaN(v)) musicPrefs.volume = clamp(v, 0, 1);
		}
		const storedMusicEnabled = localStorage.getItem(STORAGE.musicEnabled);
		if (storedMusicEnabled !== null) musicPrefs.enabled = storedMusicEnabled === 'true';
	} catch (e) {
		console.warn('[sound] loadPrefs failed:', e);
	}
};

if (browser) loadPrefs();

const isTouch = () => browser && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

class SoundEngine {
	private cache = new Map<string, HTMLAudioElement>();
	private lastByName = new Map<SoundName, number>();
	private lastGlobal = 0;
	private unlocked = false;

	play(name: SoundName, volumeScale = 1): void {
		if (!browser || !soundPrefs.enabled) return;

		const entry = SOUND_CATALOG[name];
		if (!entry) return;

		const t = now();
		if (t - (this.lastByName.get(name) ?? 0) < entry.cooldown) return;
		if (
			!('bypassGlobal' in entry && entry.bypassGlobal) &&
			t - this.lastGlobal < GLOBAL_COOLDOWN_MS
		)
			return;

		this.lastByName.set(name, t);
		this.lastGlobal = t;
		this.playSrc(entry.src, volumeScale);
	}

	playSrc(src: string, volumeScale = 1): void {
		if (!browser || !soundPrefs.enabled) return;

		try {
			let base = this.cache.get(src);
			if (!base) {
				base = new Audio(src);
				base.preload = 'auto';
				this.cache.set(src, base);
			}

			base.volume = clamp(soundPrefs.volume * volumeScale, 0, 1);

			const audio = base.cloneNode() as HTMLAudioElement;
			audio.volume = base.volume;
			audio.addEventListener('ended', () => audio.remove(), { once: true });

			// sync play — user activation теряется в async/await
			const result = audio.play();
			if (result instanceof Promise) {
				result.catch((e: unknown) => {
					if (e instanceof Error && e.name !== 'NotAllowedError') {
						console.warn('[sound] play failed:', src, e);
					}
				});
			}
		} catch (e) {
			if (e instanceof Error && e.name !== 'NotAllowedError') {
				console.warn('[sound] play failed:', src, e);
			}
		}
	}

	preloadAll(): void {
		if (!browser) return;
		const urls = [...new Set(Object.values(SOUND_CATALOG).map((e) => e.src))];
		urls.forEach((src) => {
			if (this.cache.has(src)) return;
			const audio = new Audio(src);
			audio.preload = 'auto';
			audio.load();
			this.cache.set(src, audio);
		});
	}

	unlock(): void {
		if (!browser || this.unlocked) return;
		this.unlocked = true;
		this.preloadAll();

		const first = this.cache.values().next().value as HTMLAudioElement | undefined;
		if (!first) return;

		const prime = first.cloneNode() as HTMLAudioElement;
		prime.volume = 0.001;
		const result = prime.play();
		if (result instanceof Promise) {
			result
				.then(() => {
					prime.pause();
					prime.remove();
				})
				.catch(() => prime.remove());
		}
	}

	syncVolume(): void {
		soundPrefs.volume = clamp(soundPrefs.volume, 0, 1);
		this.cache.forEach((a) => {
			a.volume = soundPrefs.volume;
		});
	}

	persistVolume(): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE.volume, String(soundPrefs.volume));
		} catch {
			/* private mode */
		}
	}

	setEnabled(value: boolean): void {
		soundPrefs.enabled = value;
		try {
			localStorage.setItem(STORAGE.enabled, String(value));
		} catch {
			/* private mode */
		}
	}

	setVolume(value: number): void {
		soundPrefs.volume = clamp(value, 0, 1);
		this.syncVolume();
		this.persistVolume();
	}
}

export const sfx = new SoundEngine();

export const setMusicEnabled = (value: boolean): void => {
	musicPrefs.enabled = value;
	try {
		localStorage.setItem(STORAGE.musicEnabled, String(value));
	} catch {
		/* private mode */
	}
};

export const setMusicVolume = (value: number): void => {
	musicPrefs.volume = clamp(value, 0, 1);
	try {
		localStorage.setItem(STORAGE.musicVolume, String(musicPrefs.volume));
	} catch {
		/* private mode */
	}
};

export const initSound = (): (() => void) | void => {
	if (!browser) return;

	loadPrefs();
	sfx.syncVolume();
	// persistVolume намеренно не вызываем — не перезаписываем storage при старте

	const onUnlock = () => {
		sfx.unlock();
		window.removeEventListener('pointerdown', onUnlock);
		window.removeEventListener('keydown', onUnlock);
	};

	window.addEventListener('pointerdown', onUnlock, { passive: true });
	window.addEventListener('keydown', onUnlock);

	return () => {
		window.removeEventListener('pointerdown', onUnlock);
		window.removeEventListener('keydown', onUnlock);
	};
};

export const toggleSound = () => {
	sfx.setEnabled(!soundPrefs.enabled);
	return soundPrefs.enabled;
};

export type SoundActionOptions = {
	name?: SoundName;
	hover?: boolean;
	click?: boolean;
};

/** Svelte action: `use:sound` | `use:sound={'click'}` | `use:sound={{ name: 'open', hover: false }}` */
export function sound(node: HTMLElement, options: SoundName | SoundActionOptions = {}) {
	const opts: Required<SoundActionOptions> = {
		name: 'hover',
		hover: true,
		click: true,
		...(typeof options === 'string' ? { name: options } : options)
	};

	const touch = isTouch();

	const onHover = () => {
		if (opts.hover && !touch) sfx.play('hover');
	};

	const onClick = () => {
		if (!opts.click) return;
		sfx.unlock();
		sfx.play(opts.name === 'hover' ? 'click' : opts.name);
	};

	node.addEventListener('mouseenter', onHover);
	node.addEventListener('click', onClick);

	return {
		update(next: SoundName | SoundActionOptions = {}) {
			Object.assign(
				opts,
				{ name: 'hover', hover: true, click: true },
				typeof next === 'string' ? { name: next } : next
			);
		},
		destroy() {
			node.removeEventListener('mouseenter', onHover);
			node.removeEventListener('click', onClick);
		}
	};
}

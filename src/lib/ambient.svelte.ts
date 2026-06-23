/**
 * Фоновая музыка: плейлист по кругу, сохранение трека/позиции, синхронизация с musicPrefs.
 */
import { browser } from '$app/environment';
import { musicPrefs } from './sound.svelte';

const STORAGE = {
	track: 'music-track',
	time: 'music-time'
} as const;

const SAVE_INTERVAL_MS = 2000;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const trackPath = (file: string) => `/sfx/ambient/${encodeURIComponent(file)}`;

export const AMBIENT_TRACKS = [
	{ id: 'after-hours', name: 'widx. - after hours', src: trackPath('widx. - after hours.mp3') },
	{ id: 'waterfall', name: 'widx. - waterfall', src: trackPath('widx. - waterfall.mp3') },
	{
		id: 'lxstnght-night-angel',
		name: 'lxstnght - night angel',
		src: trackPath('lxstnght-night-angel.mp3')
	},
	{
		id: 'hiding place w Tre Flip',
		name: 'Antent - hiding place w Tre Flip',
		src: trackPath('Antent - hiding place w Tre Flip.mp3')
	},
	{
		id: 'milk cassette x (slowed)',
		name: 'analog_mannequin - milk cassette x (slowed)',
		src: trackPath('analog_mannequin - milk cassette x (slowed).mp3')
	},
	{
		id: 'green to blue (slowed + reverbed)',
		name: 'daniel - green to blue (slowed + reverbed)',
		src: trackPath('daniel - green to blue.mp3')
	},
	{
		id: 'Shelter w Nectry',
		name: 'Antent - Shelter w Nectry',
		src: trackPath('Antent - Shelter w Nectry.mp3')
	}
] as const;

export type AmbientTrackId = (typeof AMBIENT_TRACKS)[number]['id'];

const findTrack = (id: string | null) => AMBIENT_TRACKS.find((t) => t.id === id) ?? null;

const nextTrackId = (currentId: AmbientTrackId): AmbientTrackId => {
	const idx = AMBIENT_TRACKS.findIndex((t) => t.id === currentId);
	const next = AMBIENT_TRACKS[(idx + 1) % AMBIENT_TRACKS.length];
	return next.id;
};

type AmbientGlobal = typeof globalThis & { __ambientEngine?: AmbientEngine };

class AmbientEngine {
	isPlaying = $state(false);
	currentTrackId = $state<AmbientTrackId | null>(null);

	private audio: HTMLAudioElement | null = null;
	private saveTimer: ReturnType<typeof setInterval> | null = null;
	private gestureUnlocked = false;
	private playGen = 0;
	private advancing = false;

	hasAudio = (): boolean => this.audio !== null;

	loadTrackMeta = (): void => {
		if (!browser) return;
		try {
			const track = localStorage.getItem(STORAGE.track);
			if (track && findTrack(track)) {
				this.currentTrackId = track as AmbientTrackId;
			}
		} catch {
			/* private mode */
		}
	};

	private savedTime = (): number => {
		if (!browser) return 0;
		try {
			const t = Number(localStorage.getItem(STORAGE.time));
			return Number.isNaN(t) ? 0 : Math.max(0, t);
		} catch {
			return 0;
		}
	};

	private persistTrack = (): void => {
		if (!browser) return;
		try {
			if (this.currentTrackId) {
				localStorage.setItem(STORAGE.track, this.currentTrackId);
			} else {
				localStorage.removeItem(STORAGE.track);
			}
		} catch {
			/* private mode */
		}
	};

	persistTime = (time = this.audio?.currentTime ?? 0): void => {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE.time, String(time));
		} catch {
			/* private mode */
		}
	};

	private stopAudioElement = (audio: HTMLAudioElement): void => {
		audio.removeEventListener('ended', this.onTrackEnded);
		audio.pause();
		audio.currentTime = 0;
		audio.src = '';
		audio.load();
	};

	private destroyAudio = (): void => {
		if (!this.audio) return;
		this.stopAudioElement(this.audio);
		this.audio = null;
		this.isPlaying = false;
		this.playGen++;
	};

	private onTrackEnded = (): void => {
		if (this.advancing || !musicPrefs.enabled || !this.currentTrackId) return;
		this.advancing = true;
		try {
			this.advancePlaylist();
		} finally {
			this.advancing = false;
		}
	};

	private initAudio = (src: string, fromStart = false): void => {
		this.destroyAudio();

		const audio = new Audio(src);
		audio.loop = false;
		audio.preload = 'auto';
		audio.volume = clamp(musicPrefs.volume, 0, 1);

		if (fromStart) {
			audio.currentTime = 0;
			this.persistTime(0);
		} else {
			const saved = this.savedTime();
			if (saved > 0) {
				audio.currentTime = saved;
			}
		}

		audio.addEventListener('ended', this.onTrackEnded);
		this.audio = audio;
	};

	private advancePlaylist = (): void => {
		if (!this.currentTrackId) return;

		const nextId = nextTrackId(this.currentTrackId);
		const track = findTrack(nextId);
		if (!track) return;

		this.currentTrackId = nextId;
		this.persistTrack();
		this.initAudio(track.src, true);

		if (musicPrefs.enabled) {
			this.tryPlay();
		}
	};

	private tryPlay = (): void => {
		if (!this.audio || !musicPrefs.enabled) return;
		if (!this.audio.paused && this.isPlaying) return;

		const audio = this.audio;
		const gen = ++this.playGen;

		const result = audio.play();
		if (result instanceof Promise) {
			result
				.then(() => {
					if (gen !== this.playGen || this.audio !== audio) return;
					this.isPlaying = !audio.paused;
				})
				.catch((e: unknown) => {
					if (gen !== this.playGen || this.audio !== audio) return;
					if (e instanceof Error && e.name !== 'NotAllowedError') {
						console.warn('[ambient] play failed:', e);
					}
					this.isPlaying = false;
				});
		} else {
			this.isPlaying = true;
		}
	};

	startSaving = (): void => {
		if (this.saveTimer) return;
		this.saveTimer = setInterval(() => {
			if (this.audio && this.isPlaying) {
				this.persistTime(this.audio.currentTime);
			}
		}, SAVE_INTERVAL_MS);
	};

	stopSaving = (): void => {
		if (!this.saveTimer) return;
		clearInterval(this.saveTimer);
		this.saveTimer = null;
	};

	/** Полная остановка — для cleanup / HMR */
	teardown = (): void => {
		this.stopSaving();
		this.persistTime();
		this.destroyAudio();
		this.advancing = false;
	};

	restore = (): void => {
		if (!browser || !this.currentTrackId || this.audio) return;
		const track = findTrack(this.currentTrackId);
		if (!track) return;
		this.initAudio(track.src, false);
	};

	applyVolume = (volume: number): void => {
		if (this.audio) {
			this.audio.volume = clamp(volume, 0, 1);
		}
	};

	applyEnabled = (enabled: boolean): void => {
		if (enabled && this.currentTrackId && !this.audio) {
			this.restore();
		}
		if (!this.audio) return;

		if (enabled) {
			this.tryPlay();
		} else {
			this.audio.pause();
			this.isPlaying = false;
			this.persistTime(this.audio.currentTime);
		}
	};

	playTrack = (trackId: AmbientTrackId): void => {
		const track = findTrack(trackId);
		if (!track) return;

		if (this.currentTrackId === trackId && this.audio) {
			if (this.audio.paused) this.tryPlay();
			return;
		}

		this.currentTrackId = trackId;
		this.persistTrack();
		this.initAudio(track.src, true);

		if (musicPrefs.enabled) {
			this.tryPlay();
		}
	};

	pause = (): void => {
		if (!this.audio) return;
		this.audio.pause();
		this.isPlaying = false;
		this.persistTime(this.audio.currentTime);
	};

	resume = (): void => {
		if (!musicPrefs.enabled) return;
		this.tryPlay();
	};

	toggleTrack = (trackId: AmbientTrackId): void => {
		if (this.currentTrackId === trackId && this.isPlaying) {
			this.pause();
			return;
		}
		if (this.currentTrackId === trackId && !this.isPlaying) {
			this.resume();
			return;
		}
		this.playTrack(trackId);
	};

	setEnabled = (enabled: boolean): void => {
		musicPrefs.enabled = enabled;
		try {
			localStorage.setItem('music-enabled', String(enabled));
		} catch {
			/* private mode */
		}
		this.applyEnabled(enabled);
	};

	setVolume = (volume: number): void => {
		musicPrefs.volume = clamp(volume, 0, 1);
		try {
			localStorage.setItem('music-volume', String(musicPrefs.volume));
		} catch {
			/* private mode */
		}
		this.applyVolume(musicPrefs.volume);
	};

	unlock = (): void => {
		if (!browser || this.gestureUnlocked) return;
		this.gestureUnlocked = true;

		if (this.currentTrackId && musicPrefs.enabled && this.audio?.paused) {
			this.tryPlay();
		}
	};

	currentTrackName = (): string | null => findTrack(this.currentTrackId)?.name ?? null;
}

const createAmbientEngine = (): AmbientEngine => {
	if (browser) {
		const g = globalThis as AmbientGlobal;
		g.__ambientEngine?.teardown();
		const engine = new AmbientEngine();
		g.__ambientEngine = engine;
		engine.loadTrackMeta();
		return engine;
	}
	return new AmbientEngine();
};

export const ambient = createAmbientEngine();

let initCleanup: (() => void) | null = null;

export const initAmbient = (): (() => void) | void => {
	if (!browser) return;

	initCleanup?.();

	ambient.loadTrackMeta();
	ambient.restore();
	ambient.startSaving();

	const onUnlock = () => {
		ambient.unlock();
	};

	window.addEventListener('pointerdown', onUnlock, { passive: true });
	window.addEventListener('keydown', onUnlock);

	initCleanup = () => {
		window.removeEventListener('pointerdown', onUnlock);
		window.removeEventListener('keydown', onUnlock);
		ambient.stopSaving();
		ambient.persistTime();
		initCleanup = null;
	};

	return initCleanup;
};

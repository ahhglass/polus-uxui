<script lang="ts">
	import type { Snippet } from 'svelte';

	import Sparkles from './Sparkles.svelte';
	import { sound } from '$lib/sound.svelte';

	type Variant = 'default' | 'outline' | 'ghost';
	type Radius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
	type Size = 'sm' | 'md' | 'lg' | 'icon';
	type Ring = 'none' | 'sm' | 'md' | 'lg';

	interface Props {
		children?: Snippet;

		variant?: Variant;
		radius?: Radius;
		size?: Size;

		color?: string;
		textColor?: string;

		ring?: Ring;
		ringOpacity?: number;

		disabled?: boolean;

		sparkle?: boolean;
		sparkleColor?: string;
		sound?: boolean;

		type?: 'button' | 'submit' | 'reset';
		onclick?: (event: MouseEvent) => void;
	}

	let {
		children,

		variant = 'default',
		radius = 'lg',
		size = 'md',

		color = 'var(--color-black)',
		textColor = 'white',

		ring = 'md',
		ringOpacity = 20,

		disabled = false,
		sparkle = false,
		sparkleColor = 'var(--color-pear)',
		sound: withSound = true,
		type = 'button',
		onclick
	}: Props = $props();

	const radiusMap = {
		none: 'rounded-none',
		sm: 'rounded-sm',
		md: 'rounded-md',
		lg: 'rounded-lg',
		xl: 'rounded-xl',
		xxl: 'rounded-2xl',
		full: 'rounded-full'
	} satisfies Record<Radius, string>;

	const sizeMap = {
		sm: 'h-8 px-3 text-xs',
		md: 'h-10 px-4 text-sm',
		lg: 'h-12 px-6 text-base',
		icon: 'h-10 w-10 p-0'
	} satisfies Record<Size, string>;

	const ringMap = {
		none: '0px',
		sm: '2px',
		md: '4px',
		lg: '8px'
	} satisfies Record<Ring, string>;

	const variants = {
		default: `
			bg-[var(--button-color)]
			border-[var(--button-color)]
			text-[var(--button-text)]
		`,

		outline: `
			bg-transparent
			border-[var(--button-color)]
			text-[var(--button-color)]

			hover:bg-[var(--button-color)]
			hover:text-[var(--button-text)]
		`,

		ghost: `
			bg-transparent
			border-transparent
			text-[var(--button-color)]
		`
	} satisfies Record<Variant, string>;

	const showSparkle = $derived(sparkle && !disabled);
</script>

{#if showSparkle}
	<Sparkles color={sparkleColor}>
		{@render button()}
	</Sparkles>
{:else}
	{@render button()}
{/if}

{#snippet button()}
	<button
		{type}
		{disabled}
		{onclick}
		use:sound={withSound ? {} : { hover: false, click: false }}
		style={`
		--button-color:${color};
		--button-text:${textColor};
		--button-ring-size:${ringMap[ring]};
		--button-ring-opacity:${ringOpacity}%;		
	`}
		class={`
		ui-button
		ui-ease-transition

		inline-flex
		items-center
		justify-center
		border
		font-medium
		cursor-pointer
		active:scale-[0.98]
		focus-visible:outline-none
		disabled:pointer-events-none
		disabled:opacity-50

		${sparkle && !disabled ? 'w-full' : ''}

		${variants[variant]}
		${radiusMap[radius]}
		${sizeMap[size]}
	`}
	>
		{@render children?.()}
	</button>
{/snippet}

<style>
	.ui-button:hover {
		filter: brightness(0.95);
		box-shadow: 0 0 0 var(--button-ring-size)
			color-mix(in srgb, var(--button-color) var(--button-ring-opacity), transparent);
	}

	.ui-button:focus-visible {
		box-shadow: 0 0 0 var(--button-ring-size)
			color-mix(in srgb, var(--button-color) var(--button-ring-opacity), transparent);
	}

	.ui-button:active {
		filter: brightness(0.9);
		box-shadow: 0 0 0 calc(var(--button-ring-size) - 1px)
			color-mix(in srgb, var(--button-color) var(--button-ring-opacity), transparent);
	}
</style>

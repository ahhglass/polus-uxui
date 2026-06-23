<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	import SingleSparkle from './SingleSparkle.svelte';

	interface Sparkle {
		id: string;
		createdAt: number;
		color: string;
		size: number;
		style: { top: string; left: string };
	}

	interface Props {
		color?: string;
		children?: Snippet;
	}

	let { color = 'var(--color-pear)', children }: Props = $props();

	let sparkles = $state<Sparkle[]>([]);

	const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

	function generateSparkle(): Sparkle {
		return {
			id: crypto.randomUUID(),
			createdAt: Date.now(),
			color,
			size: random(10, 20),
			style: {
				top: `${random(-10, 80)}%`,
				left: `${random(0, 100)}%`,
			},
		};
	}

	onMount(() => {
		const interval = setInterval(() => {
			const now = Date.now();

			sparkles = sparkles
				.filter((sparkle) => now - sparkle.createdAt < 1500)
				.concat(generateSparkle());
		}, 400);

		return () => clearInterval(interval);
	});
</script>

<div class="relative w-full">
	{#each sparkles as sparkle (sparkle.id)}
		<SingleSparkle color={sparkle.color} size={sparkle.size} style={sparkle.style} />
	{/each}

	<span class="relative z-[1] block w-full">
		{#if children}
			{@render children()}
		{/if}
	</span>
</div>

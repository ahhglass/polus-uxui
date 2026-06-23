<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button, pageTitle } from '$lib';

	function goHome() {
		goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>{pageTitle('Кнопки')}</title>
</svelte:head>

<div class="page-shell">
	<h1 class="text-5xl font-bold mix-blend-difference text-[var(--color-canvas)] md:text-9xl">
		Кнопки
	</h1>
	<p class="max-w-xl text-lg mix-blend-difference text-[var(--color-canvas)] md:text-2xl">
		Страница компонентов кнопок.
	</p>

	<div class="mix-blend-overlay">
		<Button radius="full" size="lg" color="#ffffff" textColor="#070D0D" sound onclick={goHome}>
			Назад на главную
		</Button>
	</div>
</div>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button, pageTitle } from '$lib';

	function goHome() {
		goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>{pageTitle('Модалки')}</title>
</svelte:head>

<div class="page-shell">
	<h1 class="text-5xl font-bold mix-blend-luminosity text-[var(--color-canvas)] md:text-9xl">
		Модалки
	</h1>
	<p class="max-w-xl text-lg mix-blend-luminosity text-[var(--color-canvas)] md:text-2xl">
		Раздел с модальными окнами и overlay-паттернами.
	</p>

	<div class="mix-blend-luminosity">
		<Button radius="full" size="lg" color="#ffffff" textColor="#070D0D" onclick={goHome}>
			Назад на главную
		</Button>
	</div>
</div>

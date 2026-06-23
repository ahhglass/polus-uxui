<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button, pageTitle } from '$lib';

	function goHome() {
		goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>{pageTitle(String(page.status))}</title>
</svelte:head>

<div class="flex h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
	<div>
		<p class="text-sm font-semibold tracking-[0.3em] uppercase mix-blend-difference text-white">
			Ошибка {page.status}
		</p>

		<h1 class="mt-4 text-9xl font-extrabold tracking-tight mix-blend-difference text-white">
			{page.status}
		</h1>

		<p class="mt-2 max-w-md text-2xl mix-blend-difference text-white">
			Куда-то не туда мы свернули...
		</p>
	</div>

	<div class="mix-blend-overlay">
		<Button radius="full" size="lg" color="#ffffff" textColor="#070D0D" onclick={goHome}>
			Назад на главную
		</Button>
	</div>
</div>

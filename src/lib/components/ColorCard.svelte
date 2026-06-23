<script lang="ts">
	interface Props {
		name: string;
		value: string;
	}

	let { name, value }: Props = $props();

	let copied = $state(false);

	function getContrastColor(hex: string) {
		const color = hex.replace('#', '');

		const r = parseInt(color.substring(0, 2), 16);
		const g = parseInt(color.substring(2, 4), 16);
		const b = parseInt(color.substring(4, 6), 16);

		const brightness = (r * 299 + g * 587 + b * 114) / 1000;

		return brightness > 170 ? '#000000' : '#FFFFFF';
	}

	const textColor = $derived(getContrastColor(value));

	async function copyColor() {
		await navigator.clipboard.writeText(value);

		copied = true;

		setTimeout(() => {
			copied = false;
		}, 1500);
	}
</script>

<button
	onclick={copyColor}
	style={`
		background:${value};
		color:${textColor};
	`}
	class="
		ui-ease-transition

		group
		relative
		w-full
		min-h-40
		cursor-pointer
		overflow-hidden
		rounded-4xl

		p-6
		text-left

		hover:-translate-y-1
		hover:rotate-1
	"
>
	<div class="flex h-full flex-col justify-between">
		<div>
			<h3
				class="
					text-3xl
					font-medium
					leading-none
				"
			>
				{name}
			</h3>

			<p
				class="
					mt-2
					font-mono
					text-lg
					opacity-70
				"
			>
				{copied ? 'Скопировано' : value}
			</p>
		</div>
	</div>
</button>

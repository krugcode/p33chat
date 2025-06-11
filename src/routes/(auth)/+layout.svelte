<script lang="ts">
	import { Images } from '$lib';
	import '../../app.css';
	let { children } = $props();
</script>

<div class="relative bg-slate-100">
	<!-- Grid overlay -->
	<div class="grid"></div>
	<div
		class="absolute right-10 bottom-10 h-[600px] w-[500px] opacity-10"
		style={`background-image:url(${Images.Toilet})`}
	></div>
	<div class="relative z-10 flex min-h-screen items-center justify-center p-4">
		<div class="w-full max-w-md">
			{@render children()}
		</div>
	</div>
</div>

<style>
	/* Grid overlay */
	.grid {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
		background-size: 50px 50px;
		animation: gridMove 20s linear infinite;
		z-index: 5; /* Above background elements */
	}
	.grid {
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
	}

	/* .dark.grid { */
	/* 	background-image: */
	/* 		linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px), */
	/* 		linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px); */
	/* } */
</style>

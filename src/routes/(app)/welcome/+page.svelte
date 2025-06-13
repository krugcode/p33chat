<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { ChevronDownIcon, GithubIcon } from '@lucide/svelte';
	import { Providers } from '$lib/components/forms';
	let { data } = $props();
	const { superform } = data;

	const sourceURL = 'https://github.com/krugcode/p33chat';
	const coolifyURL = 'https://coolify.io/';
	const AddProviderForm = Providers.Forms.AddProvider;
</script>

<div class="flex h-full w-full flex-col items-center justify-center">
	<h1 class="text-primary text-md mb-2 font-bold">Welcome to P33!</h1>

	<h3 class="mb-8 text-3xl font-bold">Bring Your Own AI</h3>
	<div class="flex max-w-xl flex-col items-center gap-2">
		<p class="text-center">
			To start chatting to your favourite GPU space heater, you'll need to add your own API Keys
			from various providers.
		</p>
		<p>
			Follow the steps below or on <Button
				class="ml-2"
				variant="outline"
				size="icon"
				href={sourceURL}><GithubIcon /></Button
			>
		</p>
		<div class="mt-5 w-full max-w-xl rounded-lg bg-gray-50 px-5 py-1">
			<Accordion.Root type="single" class="w-full max-w-xl">
				<Accordion.Item class="w-full">
					<Accordion.Trigger
						>Is it secure?
						<ChevronDownIcon stroke-width={1} />
					</Accordion.Trigger>
					<Accordion.Content>
						<div class="grid w-full grid-cols-1 gap-4">
							<p>
								Your keys are encrypted, sent to the server and destroyed on any password change. If
								you're comfortable with that basic security, jump in. I'd prefer that you <Button
									href={sourceURL}
									variant="link">self host it,</Button
								> for your own peace of mind.
							</p>
							<p class="text-xs">
								(Psst.. use <Button class="text-xs" variant="link" href={coolifyURL}>Coolify</Button
								>)
							</p>
						</div>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	</div>
	<div class="mt-3 flex w-full max-w-xl flex-col gap-3 rounded-lg border p-5">
		<h3 class="text-xl font-bold">Add A Key</h3>
		<p class="text-sm">
			You can add, delete and generally manage your keys for each provider later.
		</p>
		<AddProviderForm {superform} />
	</div>
</div>

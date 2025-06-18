import type { Types } from '$lib';
import type {
	ProviderModelFeaturesJunctionResponse,
	TypedPocketBase
} from '$lib/types/pocketbase-types';
import type { Single } from '$lib/types/server';
import { MovePocketBaseExpandsInline } from '$lib/utils';

export async function GetModelFeatures(
	pb: TypedPocketBase,
	modelID: string,
	providerID: string
): Promise<Single<Record<string, any>>> {
	let error: any | null;
	let notify: string = '';
	let modelFeaturesResponse: Record<string, any> = {} as Record<string, any>;

	try {
		const filter = `provider="${providerID}" && model="${modelID}"`;
		modelFeaturesResponse = await pb.collection('providerModelFeaturesJunction').getFullList({
			filter,
			expand: 'feature,model,provider'
		});

		if (modelFeaturesResponse?.length === 0) {
			error = "Can't find any features for provider";
			notify = "Can't find any features for provider";
			return { data: modelFeaturesResponse, error, notify };
		}
		modelFeaturesResponse = MovePocketBaseExpandsInline(modelFeaturesResponse);
		modelFeaturesResponse = normalizeModelInfo(modelFeaturesResponse);
	} catch (e) {
		error = e;
		notify = 'Error finding features';
		return { data: modelFeaturesResponse, error, notify };
	}

	return { data: modelFeaturesResponse, error, notify };
}

function normalizeModelInfo(junctions: any[]): Record<string, any> {
	if (!junctions || junctions.length === 0) return {};

	const base = {
		model: junctions[0].model,
		provider: junctions[0].provider,
		supportsStreaming: junctions[0].supportsStreaming,
		supportsVision: junctions[0].supportsVision,
		supportsImages: junctions[0].supportsImages,
		inputCostPer1k: junctions[0].inputCostPer1k,
		outputCostPer1k: junctions[0].outputCostPer1k,
		features: {}
	};

	for (const entry of junctions) {
		if (entry.feature?.key) {
			base.features[entry.feature.key] = true;
		}
	}

	return base;
}

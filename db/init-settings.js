// TODO:this might be the most cursed shit ive ever done
// please figure out something better in future
import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pb = new PocketBase('http://pocketbase:8090');

const DEFAULT_SETTINGS = {
	meta: {
		appName: 'P33Chat',
		appUrl: process.env.APP_URL || 'http://localhost:5173',
		senderName: 'P33Chat Support',
		senderAddress: process.env.SENDER_EMAIL || 'noreply@noreply.com',
		hideControls: false
	},
	smtp: {
		enabled: !!process.env.SMTP_PASSWORD,
		host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
		port: parseInt(process.env.SMTP_PORT || '587'),
		username: process.env.SMTP_LOGIN || '',
		password: process.env.SMTP_PASSWORD || '',
		tls: true,
		authMethod: 'PLAIN'
	},
	s3: {
		enabled: !!process.env.S3_ENABLED && process.env.S3_ENABLED === 'true',
		bucket: process.env.S3_BUCKET || '',
		region: process.env.S3_REGION || 'us-east-1',
		endpoint: process.env.S3_ENDPOINT || '',
		accessKey: process.env.S3_ACCESS_KEY || '',
		secret: process.env.S3_SECRET_KEY || '',
		forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
	},
	backups: {
		cron: process.env.BACKUP_CRON || '0 2 * * *', // daily at 2 am
		cronMaxKeep: parseInt(process.env.BACKUP_MAX_KEEP || '7'), // keep 7 backups
		s3: {
			enabled: !!process.env.BACKUP_S3_ENABLED && process.env.BACKUP_S3_ENABLED === 'true',
			bucket: process.env.BACKUP_S3_BUCKET || process.env.S3_BUCKET || '',
			region: process.env.BACKUP_S3_REGION || process.env.S3_REGION || 'us-east-1',
			endpoint: process.env.BACKUP_S3_ENDPOINT || process.env.S3_ENDPOINT || '',
			accessKey: process.env.BACKUP_S3_ACCESS_KEY || process.env.S3_ACCESS_KEY || '',
			secret: process.env.BACKUP_S3_SECRET_KEY || process.env.S3_SECRET_KEY || '',
			forcePathStyle:
				(process.env.BACKUP_S3_FORCE_PATH_STYLE || process.env.S3_FORCE_PATH_STYLE) === 'true'
		}
	},
	logs: {
		maxDays: parseInt(process.env.LOG_MAX_DAYS || '7'),
		minLevel: parseInt(process.env.LOG_MIN_LEVEL || '0'),
		logIP: process.env.LOG_IP !== 'false',
		logAuthId: process.env.LOG_AUTH_ID === 'true'
	},
	rateLimits: {
		enabled: process.env.RATE_LIMITS_ENABLED !== 'false',
		rules: [
			{
				label: '*:auth',
				duration: parseInt(process.env.RATE_LIMIT_AUTH_DURATION || '60'),
				maxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5')
			},
			{
				label: '*:create',
				duration: parseInt(process.env.RATE_LIMIT_CREATE_DURATION || '60'),
				maxRequests: parseInt(process.env.RATE_LIMIT_CREATE_MAX || '10')
			},
			{
				label: '/api/',
				duration: parseInt(process.env.RATE_LIMIT_API_DURATION || '60'),
				maxRequests: parseInt(process.env.RATE_LIMIT_API_MAX || '100')
			}
		]
	}
};

// provider config
const PROVIDERS = [
	{
		providerKey: 'openai',
		name: 'OpenAI',
		features: ['Basic', 'Image', 'Voice'],
		howToGetAPIKey: 'https://platform.openai.com/api-keys',
		homePage: 'https://openai.com',
		logoPath: path.join(__dirname, 'logos', 'chatgpt.png')
	},
	{
		providerKey: 'anthropic',
		name: 'Anthropic',
		features: ['Basic', 'Thinking', 'Image'],
		howToGetAPIKey: 'https://console.anthropic.com/settings/keys',
		homePage: 'https://anthropic.com',
		logoPath: path.join(__dirname, 'logos', 'claude.png')
	},
	{
		providerKey: 'google',
		name: 'Google',
		features: ['Basic', 'Image'],
		howToGetAPIKey: 'https://aistudio.google.com/app/apikey',
		homePage: 'https://ai.google.dev',
		logoPath: path.join(__dirname, 'logos', 'gemini.jpg')
	},
	{
		providerKey: 'openrouter',
		name: 'OpenRouter',
		features: ['Basic', 'Image'],
		howToGetAPIKey: 'https://openrouter.ai/keys',
		homePage: 'https://openrouter.ai',
		logoPath: path.join(__dirname, 'logos', 'openrouter.jpg')
	}
];

// model feature presets
const MODEL_FEATURES = [
	{
		key: 'basic-chat',
		name: 'Basic Chat',
		config: {
			type: 'text-generation',
			capabilities: ['chat', 'completion'],
			contextAware: true,
			multiTurn: true
		}
	},
	{
		key: 'vision-enabled',
		name: 'Vision Enabled',
		config: {
			type: 'multimodal',
			capabilities: ['vision', 'image-analysis', 'chart-reading'],
			supportedFormats: ['jpeg', 'png', 'webp', 'gif'],
			maxImageSize: '20MB'
		}
	},
	{
		key: 'reasoning-model',
		name: 'Advanced Reasoning',
		config: {
			type: 'reasoning',
			capabilities: ['chain-of-thought', 'step-by-step', 'complex-problem-solving'],
			supportsStreaming: false,
			processingTime: 'extended'
		}
	},
	{
		key: 'code-specialist',
		name: 'Code Specialist',
		config: {
			type: 'code-generation',
			capabilities: ['code-completion', 'debugging', 'refactoring', 'explanation'],
			languages: ['python', 'javascript', 'typescript', 'go', 'rust', 'java', 'cpp'],
			frameworks: ['react', 'vue', 'svelte', 'express', 'django', 'fastapi']
		}
	},
	{
		key: 'image-generation',
		name: 'Image Generation',
		config: {
			type: 'image-generation',
			capabilities: ['dalle', 'text-to-image'],
			outputFormats: ['png', 'jpeg'],
			maxResolution: '1024x1024'
		}
	},
	{
		key: 'voice-enabled',
		name: 'Voice Enabled',
		config: {
			type: 'audio',
			capabilities: ['speech-to-text', 'text-to-speech'],
			voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
			languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl']
		}
	},
	{
		key: 'web-search',
		name: 'Web Search',
		config: {
			type: 'tool-use',
			capabilities: ['web-search', 'real-time-data', 'fact-checking'],
			providers: ['bing', 'google', 'duckduckgo']
		}
	},
	{
		key: 'function-calling',
		name: 'Function Calling',
		config: {
			type: 'tool-use',
			capabilities: ['function-calling', 'api-integration', 'structured-output'],
			formats: ['json', 'xml', 'yaml']
		}
	}
];

// model configurations
const MODELS = [
	// openai models
	{
		name: 'GPT-4o',
		key: 'gpt-4o',
		providerKey: 'openai',
		featureKeys: ['basic-chat', 'vision-enabled', 'function-calling', 'code-specialist'],
		inputCostPer1k: 0.0025,
		outputCostPer1k: 0.01,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 4096,
		description: 'Most advanced GPT-4 model with vision capabilities',
		order: 1
	},
	{
		name: 'GPT-4o Mini',
		key: 'gpt-4o-mini',
		providerKey: 'openai',
		featureKeys: ['basic-chat', 'vision-enabled', 'function-calling'],
		inputCostPer1k: 0.00015,
		outputCostPer1k: 0.0006,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 16384,
		description: 'Fast and cost-effective GPT-4 model',
		order: 2
	},
	{
		name: 'o1-preview',
		key: 'o1-preview',
		providerKey: 'openai',
		featureKeys: ['basic-chat', 'reasoning-model', 'code-specialist'],
		inputCostPer1k: 0.015,
		outputCostPer1k: 0.06,
		supportsStreaming: false,
		supportsVision: false,
		supportsImages: false,
		maxOutputTokens: 32768,
		description: 'Advanced reasoning model for complex problems',
		order: 3
	},
	{
		name: 'o1-mini',
		key: 'o1-mini',
		providerKey: 'openai',
		featureKeys: ['basic-chat', 'reasoning-model'],
		inputCostPer1k: 0.003,
		outputCostPer1k: 0.012,
		supportsStreaming: false,
		supportsVision: false,
		supportsImages: false,
		maxOutputTokens: 65536,
		description: 'Smaller reasoning model for STEM tasks',
		order: 4
	},
	{
		name: 'DALL-E 3',
		key: 'dall-e-3',
		providerKey: 'openai',
		featureKeys: ['image-generation'],
		inputCostPer1k: 0.04,
		outputCostPer1k: 0,
		supportsStreaming: false,
		supportsVision: false,
		supportsImages: true,
		maxOutputTokens: 0,
		description: 'Advanced image generation model',
		order: 5
	},

	// anthropic models
	{
		name: 'Claude 3.5 Sonnet',
		key: 'claude-3-5-sonnet-20241022',
		providerKey: 'anthropic',
		featureKeys: ['basic-chat', 'vision-enabled', 'code-specialist', 'function-calling'],
		inputCostPer1k: 0.003,
		outputCostPer1k: 0.015,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Most intelligent Claude model with vision capabilities',
		order: 6
	},
	{
		name: 'Claude 3.5 Sonnet (New)',
		key: 'claude-3-5-sonnet-20241220',
		providerKey: 'anthropic',
		featureKeys: ['basic-chat', 'vision-enabled', 'code-specialist', 'function-calling'],
		inputCostPer1k: 0.003,
		outputCostPer1k: 0.015,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Latest Claude 3.5 Sonnet with improved capabilities',
		order: 7
	},
	{
		name: 'Claude 3.5 Haiku',
		key: 'claude-3-5-haiku-20241022',
		providerKey: 'anthropic',
		featureKeys: ['basic-chat', 'vision-enabled'],
		inputCostPer1k: 0.0008,
		outputCostPer1k: 0.004,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Fast and affordable Claude model',
		order: 8
	},
	{
		name: 'Claude 3 Opus',
		key: 'claude-3-opus-20240229',
		providerKey: 'anthropic',
		featureKeys: ['basic-chat', 'vision-enabled', 'code-specialist'],
		inputCostPer1k: 0.015,
		outputCostPer1k: 0.075,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 4096,
		description: 'Most powerful Claude model for complex tasks',
		order: 9
	},

	// google models
	{
		name: 'Gemini 1.5 Pro',
		key: 'gemini-1.5-pro',
		providerKey: 'google',
		featureKeys: ['basic-chat', 'vision-enabled', 'code-specialist', 'function-calling'],
		inputCostPer1k: 0.00125,
		outputCostPer1k: 0.005,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Advanced Gemini model with large context window',
		order: 10
	},
	{
		name: 'Gemini 1.5 Pro (002)',
		key: 'gemini-1.5-pro-002',
		providerKey: 'google',
		featureKeys: ['basic-chat', 'vision-enabled', 'code-specialist', 'function-calling'],
		inputCostPer1k: 0.00125,
		outputCostPer1k: 0.005,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Updated Gemini 1.5 Pro with improved performance',
		order: 11
	},
	{
		name: 'Gemini 1.5 Flash',
		key: 'gemini-1.5-flash',
		providerKey: 'google',
		featureKeys: ['basic-chat', 'vision-enabled'],
		inputCostPer1k: 0.000075,
		outputCostPer1k: 0.0003,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Fast and efficient Gemini model',
		order: 12
	},
	{
		name: 'Gemini 1.5 Flash (002)',
		key: 'gemini-1.5-flash-002',
		providerKey: 'google',
		featureKeys: ['basic-chat', 'vision-enabled', 'code-specialist'],
		inputCostPer1k: 0.000075,
		outputCostPer1k: 0.0003,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Updated Gemini 1.5 Flash with better efficiency',
		order: 13
	},
	{
		name: 'Gemini 2.0 Flash (Experimental)',
		key: 'gemini-2.0-flash-exp',
		providerKey: 'google',
		featureKeys: ['basic-chat', 'vision-enabled', 'code-specialist', 'function-calling'],
		inputCostPer1k: 0.000075,
		outputCostPer1k: 0.0003,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Next-generation Gemini model with enhanced multimodal capabilities',
		order: 14
	},

	// openrouter models
	{
		name: 'Claude 3.5 Sonnet (OpenRouter)',
		key: 'anthropic/claude-3.5-sonnet',
		providerKey: 'openrouter',
		featureKeys: ['basic-chat', 'vision-enabled', 'code-specialist'],
		inputCostPer1k: 0.003,
		outputCostPer1k: 0.015,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Claude 3.5 Sonnet via OpenRouter',
		order: 15
	},
	{
		name: 'Claude 3.5 Sonnet (Latest - OpenRouter)',
		key: 'anthropic/claude-3.5-sonnet:beta',
		providerKey: 'openrouter',
		featureKeys: ['basic-chat', 'vision-enabled', 'code-specialist'],
		inputCostPer1k: 0.003,
		outputCostPer1k: 0.015,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Latest Claude 3.5 Sonnet via OpenRouter',
		order: 16
	},
	{
		name: 'GPT-4o (OpenRouter)',
		key: 'openai/gpt-4o',
		providerKey: 'openrouter',
		featureKeys: ['basic-chat', 'vision-enabled', 'function-calling'],
		inputCostPer1k: 0.0025,
		outputCostPer1k: 0.01,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 4096,
		description: 'GPT-4o via OpenRouter',
		order: 17
	},
	{
		name: 'Gemini 2.0 Flash (OpenRouter)',
		key: 'google/gemini-2.0-flash-exp:free',
		providerKey: 'openrouter',
		featureKeys: ['basic-chat', 'vision-enabled', 'code-specialist'],
		inputCostPer1k: 0,
		outputCostPer1k: 0,
		supportsStreaming: true,
		supportsVision: true,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Latest Gemini 2.0 Flash via OpenRouter (free tier)',
		order: 18
	},
	{
		name: 'Llama 3.1 405B Instruct',
		key: 'meta-llama/llama-3.1-405b-instruct',
		providerKey: 'openrouter',
		featureKeys: ['basic-chat', 'code-specialist'],
		inputCostPer1k: 0.003,
		outputCostPer1k: 0.003,
		supportsStreaming: true,
		supportsVision: false,
		supportsImages: false,
		maxOutputTokens: 4096,
		description: "Meta's largest Llama model via OpenRouter",
		order: 19
	},
	{
		name: 'Qwen 2.5 Coder 32B Instruct',
		key: 'qwen/qwen-2.5-coder-32b-instruct',
		providerKey: 'openrouter',
		featureKeys: ['basic-chat', 'code-specialist'],
		inputCostPer1k: 0.0006,
		outputCostPer1k: 0.0006,
		supportsStreaming: true,
		supportsVision: false,
		supportsImages: false,
		maxOutputTokens: 8192,
		description: 'Specialized coding model via OpenRouter',
		order: 20
	}
];

const DEFAULT_REACTIONS = [
	{ name: 'Like', iconKey: '👍' },
	{ name: 'Love', iconKey: '❤️' },
	{ name: 'Laugh', iconKey: '😂' },
	{ name: 'Wow', iconKey: '😮' },
	{ name: 'Sad', iconKey: '😢' },
	{ name: 'Angry', iconKey: '😠' },
	{ name: 'Thinking', iconKey: '🤔' },
	{ name: 'Fire', iconKey: '🔥' },
	{ name: 'Party', iconKey: '🎉' },
	{ name: 'Mind Blown', iconKey: '🤯' }
];

async function initProviders() {
	console.log('Initializing providers...');

	const createdProviders = new Map();

	for (const providerData of PROVIDERS) {
		try {
			// check if provider already exists
			const existingProviders = await pb.collection('providers').getFullList({
				filter: `providerKey = "${providerData.providerKey}"`
			});

			if (existingProviders.length > 0) {
				console.log(`Provider ${providerData.name} already exists, skipping...`);
				createdProviders.set(providerData.providerKey, existingProviders[0]);
				continue;
			}

			const formData = new FormData();

			formData.append('providerKey', providerData.providerKey);
			formData.append('name', providerData.name);
			formData.append('howToGetAPIKey', providerData.howToGetAPIKey);
			formData.append('homePage', providerData.homePage);

			if (providerData.features) {
				providerData.features.forEach((feature) => {
					formData.append('features', feature);
				});
			}

			// add logo file if it exists
			if (providerData.logoPath && fs.existsSync(providerData.logoPath)) {
				const logoFile = new Blob([fs.readFileSync(providerData.logoPath)]);
				formData.append('logo', logoFile, path.basename(providerData.logoPath));
				console.log(
					`Adding logo for ${providerData.name}: ${path.basename(providerData.logoPath)}`
				);
			} else if (providerData.logoPath) {
				console.warn(`Logo file not found for ${providerData.name}: ${providerData.logoPath}`);
			}

			const provider = await pb.collection('providers').create(formData);
			createdProviders.set(providerData.providerKey, provider);
			console.log(`Created provider: ${providerData.name}`);
		} catch (error) {
			console.error(`Failed to create provider ${providerData.name}:`, error.message);
		}
	}

	return createdProviders;
}

async function initModelFeatures() {
	console.log('Initializing model features...');

	const createdFeatures = new Map();

	for (const featureData of MODEL_FEATURES) {
		try {
			const existingFeatures = await pb.collection('modelFeatures').getFullList({
				filter: `key = "${featureData.key}"`
			});

			if (existingFeatures.length > 0) {
				console.log(`Model feature ${featureData.name} already exists, skipping...`);
				createdFeatures.set(featureData.key, existingFeatures[0]);
				continue;
			}

			const feature = await pb.collection('modelFeatures').create(featureData);
			createdFeatures.set(featureData.key, feature);
			console.log(`Created model feature: ${featureData.name}`);
		} catch (error) {
			console.error(`Failed to create model feature ${featureData.name}:`, error.message);
		}
	}

	return createdFeatures;
}

async function initModels(providers, features) {
	console.log('Initializing models...');

	const createdModels = new Map();

	for (const modelData of MODELS) {
		try {
			const existingModels = await pb.collection('models').getFullList({
				filter: `key = "${modelData.key}"`
			});

			if (existingModels.length > 0) {
				console.log(`Model ${modelData.name} already exists, skipping...`);
				createdModels.set(modelData.key, existingModels[0]);
				continue;
			}

			const {
				providerKey,
				featureKeys,
				inputCostPer1k,
				outputCostPer1k,
				supportsStreaming,
				supportsVision,
				supportsImages,
				...modelCreateData
			} = modelData;

			const model = await pb.collection('models').create(modelCreateData);
			createdModels.set(modelData.key, model);
			console.log(`Created model: ${modelData.name}`);
		} catch (error) {
			console.error(`Failed to create model ${modelData.name}:`, error.message);
		}
	}

	return createdModels;
}

async function initProviderModelFeaturesJunction(providers, models, features) {
	console.log('Initializing provider model features junction...');

	for (const modelData of MODELS) {
		try {
			const provider = providers.get(modelData.providerKey);
			const model = models.get(modelData.key);

			if (!provider) {
				console.error(`Provider not found for model ${modelData.name}`);
				continue;
			}

			if (!model) {
				console.error(`Model not found: ${modelData.name}`);
				continue;
			}

			if (modelData.featureKeys) {
				for (const featureKey of modelData.featureKeys) {
					const feature = features.get(featureKey);
					if (!feature) {
						console.warn(`Feature ${featureKey} not found for model ${modelData.name}`);
						continue;
					}

					const existingJunctions = await pb
						.collection('providerModelFeaturesJunction')
						.getFullList({
							filter: `provider = "${provider.id}" && model = "${model.id}" && feature = "${feature.id}"`
						});

					if (existingJunctions.length > 0) {
						console.log(
							`Junction for ${provider.name} - ${model.name} - ${feature.name} already exists, skipping...`
						);
						continue;
					}

					const junctionData = {
						provider: provider.id,
						model: model.id,
						feature: feature.id,
						inputCostPer1k: modelData.inputCostPer1k,
						outputCostPer1k: modelData.outputCostPer1k,
						supportsStreaming: modelData.supportsStreaming,
						supportsVision: modelData.supportsVision,
						supportsImages: modelData.supportsImages
					};

					await pb.collection('providerModelFeaturesJunction').create(junctionData);
					console.log(`Created junction: ${provider.name} - ${model.name} - ${feature.name}`);
				}
			}
		} catch (error) {
			console.error(`Failed to create junction for model ${modelData.name}:`, error.message);
		}
	}
}

async function initReactions() {
	console.log('Initializing reactions...');

	for (const reactionData of DEFAULT_REACTIONS) {
		try {
			const existingReactions = await pb.collection('reactions').getFullList({
				filter: `name = "${reactionData.name}"`
			});

			if (existingReactions.length > 0) {
				continue;
			}

			await pb.collection('reactions').create(reactionData);
			console.log(`Created reaction: ${reactionData.name}`);
		} catch (error) {
			console.error(`Failed to create reaction ${reactionData.name}:`, error.message);
		}
	}
}

async function initSettings() {
	try {
		console.log('Init PocketBase settings...');

		// authenticate as superuser
		await pb
			.collection('_superusers')
			.authWithPassword(
				process.env.POCKETBASE_SU_EMAIL || 'admin@p33chat.com',
				process.env.POCKETBASE_SU_PASSWORD || 'p33chatisverycool'
			);

		// get current settings
		const currentSettings = await pb.settings.getAll();

		// check if settings need updating
		const needsUpdate = shouldUpdateSettings(currentSettings, DEFAULT_SETTINGS);

		if (needsUpdate) {
			console.log('Updating PocketBase settings...');
			await pb.settings.update(DEFAULT_SETTINGS);
			console.log('Settings updated successfully');

			// test s3 storage if enabled
			if (DEFAULT_SETTINGS.s3.enabled) {
				try {
					await pb.settings.testS3('storage');
					console.log('S3 storage test successful!');
				} catch (error) {
					console.warn('[WARNING] S3 storage test failed:', error.message);
				}
			}

			// test s3 backups if enabled
			if (DEFAULT_SETTINGS.backups.s3.enabled) {
				try {
					await pb.settings.testS3('backups');
					console.log('S3 backup test successful!');
				} catch (error) {
					console.warn('[WARNING]  S3 backup test failed:', error.message);
				}
			}

			// test email if smtp is enabled
			if (DEFAULT_SETTINGS.smtp.enabled) {
				try {
					await pb.settings.testEmail(DEFAULT_SETTINGS.meta.senderAddress, 'verification');
					console.log('SMTP test successful!');
				} catch (error) {
					console.warn('[WARNING] SMTP test failed:', error.message);
				}
			}
		} else {
			console.log('Settings already up to date!');
		}

		// in order: providers -> features -> models -> junction -> reactions
		const providers = await initProviders();
		const features = await initModelFeatures();
		const models = await initModels(providers, features);
		await initProviderModelFeaturesJunction(providers, models, features);
		await initReactions();
	} catch (error) {
		console.error('[ERROR] Failed to initialize settings:', error.message);
		process.exit(1);
	}
}

function shouldUpdateSettings(current, defaults) {
	return (
		current.meta?.appName !== defaults.meta.appName ||
		current.meta?.appUrl !== defaults.meta.appUrl ||
		current.smtp?.enabled !== defaults.smtp.enabled ||
		current.smtp?.host !== defaults.smtp.host ||
		current.s3?.enabled !== defaults.s3.enabled ||
		current.s3?.bucket !== defaults.s3.bucket ||
		current.backups?.s3?.enabled !== defaults.backups.s3.enabled ||
		current.backups?.cron !== defaults.backups.cron ||
		current.rateLimits?.enabled !== defaults.rateLimits.enabled
	);
}

// wait for pocketbase to be ready
async function waitForPocketBase() {
	for (let i = 0; i < 30; i++) {
		try {
			await fetch('http://pocketbase:8090/api/health');
			return;
		} catch {
			console.log('Waiting for PocketBase...');
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}
	throw new Error('PocketBase failed to start');
}

async function main() {
	await waitForPocketBase();
	await initSettings();
}

main().catch(console.error);

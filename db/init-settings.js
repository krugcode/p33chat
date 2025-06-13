// TODO:this might be the most cursed shit ive ever done
// please figure out something better in future
import PocketBase from 'pocketbase';

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

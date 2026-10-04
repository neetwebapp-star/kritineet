/**
 * Phase 13: Strict Environment Startup Validator
 * Enforces environment separation (DEVELOPMENT, TEST, STAGING, PRODUCTION)
 * Classifies variables as REQUIRED, OPTIONAL, or FEATURE_DEPENDENT.
 * Fails fast on missing required production configuration.
 */

export type AppEnvironment = 'DEVELOPMENT' | 'TEST' | 'STAGING' | 'PRODUCTION';
export type VariableClassification = 'REQUIRED' | 'OPTIONAL' | 'FEATURE_DEPENDENT';

export interface EnvVariableSpec {
  name: string;
  classification: VariableClassification;
  description: string;
  defaultValue?: string;
  environmentsRequired: AppEnvironment[];
  validator?: (val: string) => boolean;
}

export const ENV_SPECIFICATIONS: EnvVariableSpec[] = [
  {
    name: 'DATABASE_URL',
    classification: 'REQUIRED',
    description: 'PostgreSQL or SQLite database connection URI',
    environmentsRequired: ['DEVELOPMENT', 'TEST', 'STAGING', 'PRODUCTION'],
    validator: (v) => v.length > 5,
  },
  {
    name: 'AUTH_SECRET',
    classification: 'REQUIRED',
    description: 'Cryptographic secret key for signing JWTs and session tokens',
    environmentsRequired: ['STAGING', 'PRODUCTION'],
    validator: (v) => v.length >= 16,
  },
  {
    name: 'APP_URL',
    classification: 'REQUIRED',
    description: 'Canonical base public URL of the application',
    defaultValue: 'http://localhost:3000',
    environmentsRequired: ['DEVELOPMENT', 'TEST', 'STAGING', 'PRODUCTION'],
    validator: (v) => v.startsWith('http://') || v.startsWith('https://'),
  },
  {
    name: 'ENCRYPTION_KEY',
    classification: 'FEATURE_DEPENDENT',
    description: 'Key for AES-256 field-level and backup payload encryption',
    environmentsRequired: ['PRODUCTION'],
    validator: (v) => v.length >= 32,
  },
  {
    name: 'STORAGE_CONFIG',
    classification: 'FEATURE_DEPENDENT',
    description: 'S3/Blob storage configuration JSON or connection string',
    environmentsRequired: [],
  },
  {
    name: 'QUEUE_CONFIG',
    classification: 'OPTIONAL',
    description: 'Redis or memory queue configuration for background tasks',
    environmentsRequired: [],
  },
  {
    name: 'AI_PROVIDER_KEYS',
    classification: 'FEATURE_DEPENDENT',
    description: 'API keys for LLM providers (e.g. Gemini, OpenAI, Claude)',
    environmentsRequired: [],
  },
  {
    name: 'PAYMENT_KEYS',
    classification: 'FEATURE_DEPENDENT',
    description: 'Stripe or Razorpay API keys and webhook signing secrets',
    environmentsRequired: [],
  },
  {
    name: 'EMAIL_CONFIG',
    classification: 'FEATURE_DEPENDENT',
    description: 'SMTP or transactional email provider credentials',
    environmentsRequired: [],
  },
];

export interface ValidationReport {
  environment: AppEnvironment;
  isValid: boolean;
  canBoot: boolean;
  variables: Record<string, {
    status: 'SET' | 'MISSING' | 'INVALID' | 'DEFAULT_USED';
    classification: VariableClassification;
    description: string;
  }>;
  missingRequired: string[];
  warnings: string[];
}

export class EnvValidator {
  public static getEnvironment(): AppEnvironment {
    const raw = (process.env.NODE_ENV || 'development').toUpperCase();
    if (raw.includes('PROD')) return 'PRODUCTION';
    if (raw.includes('STAGE')) return 'STAGING';
    if (raw.includes('TEST')) return 'TEST';
    return 'DEVELOPMENT';
  }

  public static validate(overrideEnv?: AppEnvironment, customEnvRecord?: Record<string, string | undefined>): ValidationReport {
    const env = overrideEnv || this.getEnvironment();
    const envMap = customEnvRecord || process.env;

    const report: ValidationReport = {
      environment: env,
      isValid: true,
      canBoot: true,
      variables: {},
      missingRequired: [],
      warnings: [],
    };

    for (const spec of ENV_SPECIFICATIONS) {
      const val = envMap[spec.name] || spec.defaultValue;
      const isRequired = spec.environmentsRequired.includes(env);

      if (!val) {
        if (isRequired) {
          report.variables[spec.name] = {
            status: 'MISSING',
            classification: spec.classification,
            description: spec.description,
          };
          report.missingRequired.push(spec.name);
          report.isValid = false;
        } else {
          report.variables[spec.name] = {
            status: 'MISSING',
            classification: spec.classification,
            description: spec.description,
          };
          if (spec.classification === 'FEATURE_DEPENDENT') {
            report.warnings.push(`Feature-dependent variable ${spec.name} is not set; related subsystem will degrade gracefully.`);
          }
        }
      } else {
        const passesValidator = spec.validator ? spec.validator(val) : true;
        if (!passesValidator) {
          report.variables[spec.name] = {
            status: 'INVALID',
            classification: spec.classification,
            description: spec.description,
          };
          if (isRequired) {
            report.missingRequired.push(spec.name);
            report.isValid = false;
          } else {
            report.warnings.push(`Variable ${spec.name} failed custom validation format.`);
          }
        } else {
          const usedDefault = !envMap[spec.name] && !!spec.defaultValue;
          report.variables[spec.name] = {
            status: usedDefault ? 'DEFAULT_USED' : 'SET',
            classification: spec.classification,
            description: spec.description,
          };
        }
      }
    }

    if (report.missingRequired.length > 0) {
      report.canBoot = env !== 'PRODUCTION' && env !== 'STAGING';
    }

    return report;
  }

  public static assertProductionReady(customEnvRecord?: Record<string, string | undefined>): void {
    const report = this.validate('PRODUCTION', customEnvRecord);
    if (!report.isValid) {
      throw new Error(`CRITICAL STARTUP FAILURE: Missing required production environment variables: ${report.missingRequired.join(', ')}`);
    }
  }
}

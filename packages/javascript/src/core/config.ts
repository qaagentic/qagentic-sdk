/**
 * Configuration management for QAagentic SDK.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * API reporting configuration.
 */
export interface APIConfig {
  enabled: boolean;
  url: string;
  key?: string;
  timeout: number;
  retryCount: number;
  batchSize: number;
}

/**
 * Local file reporting configuration.
 */
export interface LocalConfig {
  enabled: boolean;
  outputDir: string;
  formats: ('json' | 'html' | 'junit')[];
  cleanOnStart: boolean;
}

/**
 * Feature flags configuration.
 */
export interface FeaturesConfig {
  aiAnalysis: boolean;
  failureClustering: boolean;
  flakyDetection: boolean;
  screenshots: 'always' | 'on_failure' | 'never';
  videos: 'always' | 'on_failure' | 'never';
  consoleOutput: boolean;
}

/**
 * Labels configuration.
 */
export interface LabelsConfig {
  team?: string;
  component?: string;
  environment?: string;
  custom: Record<string, string>;
}

/**
 * Main configuration for QAagentic SDK.
 */
export interface QAgenticConfig {
  projectName: string;
  environment: string;
  api: APIConfig;
  local: LocalConfig;
  features: FeaturesConfig;
  labels: LabelsConfig;
}

/**
 * Default configuration values.
 */
const defaultConfig: QAgenticConfig = {
  projectName: 'default',
  environment: 'local',
  api: {
    enabled: true,
    url: 'http://localhost:8080',
    timeout: 30000,
    retryCount: 3,
    batchSize: 100,
  },
  local: {
    enabled: true,
    outputDir: './qagentic-results',
    formats: ['json', 'html'],
    cleanOnStart: true,
  },
  features: {
    aiAnalysis: true,
    failureClustering: true,
    flakyDetection: true,
    screenshots: 'on_failure',
    videos: 'on_failure',
    consoleOutput: true,
  },
  labels: {
    custom: {},
  },
};

// Global configuration instance
let globalConfig: QAgenticConfig = { ...defaultConfig };

/**
 * Load configuration from environment variables.
 */
function loadFromEnv(config: QAgenticConfig): QAgenticConfig {
  const env = process.env;

  // Project settings
  if (env.QAGENTIC_PROJECT_NAME) {
    config.projectName = env.QAGENTIC_PROJECT_NAME;
  }
  if (env.QAGENTIC_ENVIRONMENT) {
    config.environment = env.QAGENTIC_ENVIRONMENT;
  }

  // API settings
  if (env.QAGENTIC_API_ENABLED !== undefined) {
    config.api.enabled = env.QAGENTIC_API_ENABLED.toLowerCase() === 'true';
  }
  if (env.QAGENTIC_API_URL) {
    config.api.url = env.QAGENTIC_API_URL;
  }
  if (env.QAGENTIC_API_KEY) {
    config.api.key = env.QAGENTIC_API_KEY;
  }

  // Local settings
  if (env.QAGENTIC_LOCAL_ENABLED !== undefined) {
    config.local.enabled = env.QAGENTIC_LOCAL_ENABLED.toLowerCase() === 'true';
  }
  if (env.QAGENTIC_OUTPUT_DIR) {
    config.local.outputDir = env.QAGENTIC_OUTPUT_DIR;
  }
  if (env.QAGENTIC_OUTPUT_FORMAT) {
    config.local.formats = env.QAGENTIC_OUTPUT_FORMAT.split(',').map(
      (f) => f.trim() as 'json' | 'html' | 'junit'
    );
  }

  // Feature flags
  if (env.QAGENTIC_AI_ANALYSIS !== undefined) {
    config.features.aiAnalysis = env.QAGENTIC_AI_ANALYSIS.toLowerCase() === 'true';
  }
  if (env.QAGENTIC_SCREENSHOTS) {
    config.features.screenshots = env.QAGENTIC_SCREENSHOTS as 'always' | 'on_failure' | 'never';
  }
  if (env.QAGENTIC_VIDEOS) {
    config.features.videos = env.QAGENTIC_VIDEOS as 'always' | 'on_failure' | 'never';
  }

  // Labels
  if (env.QAGENTIC_TEAM) {
    config.labels.team = env.QAGENTIC_TEAM;
  }
  if (env.QAGENTIC_COMPONENT) {
    config.labels.component = env.QAGENTIC_COMPONENT;
  }

  return config;
}

/**
 * Load configuration from YAML file.
 */
function loadFromFile(filePath: string, config: QAgenticConfig): QAgenticConfig {
  try {
    if (!fs.existsSync(filePath)) {
      return config;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    // Simple YAML parsing for common cases
    const yaml = require('yaml');
    const data = yaml.parse(content);

    if (data.project) {
      if (data.project.name) config.projectName = data.project.name;
      if (data.project.environment) config.environment = data.project.environment;
    }

    if (data.reporting?.api) {
      if (data.reporting.api.enabled !== undefined) config.api.enabled = data.reporting.api.enabled;
      if (data.reporting.api.url) config.api.url = data.reporting.api.url;
      if (data.reporting.api.key) config.api.key = data.reporting.api.key;
    }

    if (data.reporting?.local) {
      if (data.reporting.local.enabled !== undefined)
        config.local.enabled = data.reporting.local.enabled;
      if (data.reporting.local.output_dir) config.local.outputDir = data.reporting.local.output_dir;
      if (data.reporting.local.formats) config.local.formats = data.reporting.local.formats;
    }

    if (data.features) {
      if (data.features.ai_analysis !== undefined)
        config.features.aiAnalysis = data.features.ai_analysis;
      if (data.features.failure_clustering !== undefined)
        config.features.failureClustering = data.features.failure_clustering;
      if (data.features.flaky_detection !== undefined)
        config.features.flakyDetection = data.features.flaky_detection;
      if (data.features.screenshots) config.features.screenshots = data.features.screenshots;
      if (data.features.videos) config.features.videos = data.features.videos;
    }

    if (data.labels) {
      if (data.labels.team) config.labels.team = data.labels.team;
      if (data.labels.component) config.labels.component = data.labels.component;
      config.labels.custom = { ...config.labels.custom, ...data.labels };
    }
  } catch (error) {
    console.warn(`Failed to load config from ${filePath}:`, error);
  }

  return config;
}

/**
 * Auto-discover configuration from common locations.
 */
function autoDiscover(): QAgenticConfig {
  const config = { ...defaultConfig };
  const cwd = process.cwd();

  const searchPaths = [
    path.join(cwd, 'qagentic.yaml'),
    path.join(cwd, 'qagentic.yml'),
    path.join(cwd, '.qagentic.yaml'),
    path.join(cwd, '.qagentic.yml'),
  ];

  for (const filePath of searchPaths) {
    if (fs.existsSync(filePath)) {
      loadFromFile(filePath, config);
      break;
    }
  }

  return loadFromEnv(config);
}

/**
 * Configure QAagentic SDK.
 */
export function configure(options: Partial<QAgenticConfig> & {
  projectName?: string;
  apiUrl?: string;
  apiKey?: string;
  outputDir?: string;
} = {}): QAgenticConfig {
  globalConfig = autoDiscover();

  if (options.projectName) {
    globalConfig.projectName = options.projectName;
  }
  if (options.environment) {
    globalConfig.environment = options.environment;
  }
  if (options.apiUrl) {
    globalConfig.api.url = options.apiUrl;
  }
  if (options.apiKey) {
    globalConfig.api.key = options.apiKey;
  }
  if (options.outputDir) {
    globalConfig.local.outputDir = options.outputDir;
  }

  // Merge nested configs
  if (options.api) {
    globalConfig.api = { ...globalConfig.api, ...options.api };
  }
  if (options.local) {
    globalConfig.local = { ...globalConfig.local, ...options.local };
  }
  if (options.features) {
    globalConfig.features = { ...globalConfig.features, ...options.features };
  }
  if (options.labels) {
    globalConfig.labels = { ...globalConfig.labels, ...options.labels };
  }

  return globalConfig;
}

/**
 * Get the current configuration.
 */
export function getConfig(): QAgenticConfig {
  return globalConfig;
}

/**
 * Reset configuration to defaults.
 */
export function resetConfig(): void {
  globalConfig = { ...defaultConfig };
}

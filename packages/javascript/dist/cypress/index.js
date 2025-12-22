'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var uuid = require('uuid');
var fs2 = require('fs');
var path2 = require('path');
var axios = require('axios');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var fs2__namespace = /*#__PURE__*/_interopNamespace(fs2);
var path2__namespace = /*#__PURE__*/_interopNamespace(path2);
var axios__default = /*#__PURE__*/_interopDefault(axios);

var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var defaultConfig = {
  projectName: "default",
  environment: "local",
  api: {
    enabled: true,
    url: "http://localhost:8080",
    timeout: 3e4,
    retryCount: 3,
    batchSize: 100
  },
  local: {
    enabled: true,
    outputDir: "./qagentic-results",
    formats: ["json", "html"],
    cleanOnStart: true
  },
  features: {
    aiAnalysis: true,
    failureClustering: true,
    flakyDetection: true,
    screenshots: "on_failure",
    videos: "on_failure",
    consoleOutput: true
  },
  labels: {
    custom: {}
  }
};
var globalConfig = { ...defaultConfig };
function loadFromEnv(config) {
  const env = process.env;
  if (env.QAGENTIC_PROJECT_NAME) {
    config.projectName = env.QAGENTIC_PROJECT_NAME;
  }
  if (env.QAGENTIC_ENVIRONMENT) {
    config.environment = env.QAGENTIC_ENVIRONMENT;
  }
  if (env.QAGENTIC_API_ENABLED !== void 0) {
    config.api.enabled = env.QAGENTIC_API_ENABLED.toLowerCase() === "true";
  }
  if (env.QAGENTIC_API_URL) {
    config.api.url = env.QAGENTIC_API_URL;
  }
  if (env.QAGENTIC_API_KEY) {
    config.api.key = env.QAGENTIC_API_KEY;
  }
  if (env.QAGENTIC_LOCAL_ENABLED !== void 0) {
    config.local.enabled = env.QAGENTIC_LOCAL_ENABLED.toLowerCase() === "true";
  }
  if (env.QAGENTIC_OUTPUT_DIR) {
    config.local.outputDir = env.QAGENTIC_OUTPUT_DIR;
  }
  if (env.QAGENTIC_OUTPUT_FORMAT) {
    config.local.formats = env.QAGENTIC_OUTPUT_FORMAT.split(",").map(
      (f) => f.trim()
    );
  }
  if (env.QAGENTIC_AI_ANALYSIS !== void 0) {
    config.features.aiAnalysis = env.QAGENTIC_AI_ANALYSIS.toLowerCase() === "true";
  }
  if (env.QAGENTIC_SCREENSHOTS) {
    config.features.screenshots = env.QAGENTIC_SCREENSHOTS;
  }
  if (env.QAGENTIC_VIDEOS) {
    config.features.videos = env.QAGENTIC_VIDEOS;
  }
  if (env.QAGENTIC_TEAM) {
    config.labels.team = env.QAGENTIC_TEAM;
  }
  if (env.QAGENTIC_COMPONENT) {
    config.labels.component = env.QAGENTIC_COMPONENT;
  }
  return config;
}
function loadFromFile(filePath, config) {
  try {
    if (!fs2__namespace.existsSync(filePath)) {
      return config;
    }
    const content = fs2__namespace.readFileSync(filePath, "utf-8");
    const yaml = __require("yaml");
    const data = yaml.parse(content);
    if (data.project) {
      if (data.project.name) config.projectName = data.project.name;
      if (data.project.environment) config.environment = data.project.environment;
    }
    if (data.reporting?.api) {
      if (data.reporting.api.enabled !== void 0) config.api.enabled = data.reporting.api.enabled;
      if (data.reporting.api.url) config.api.url = data.reporting.api.url;
      if (data.reporting.api.key) config.api.key = data.reporting.api.key;
    }
    if (data.reporting?.local) {
      if (data.reporting.local.enabled !== void 0)
        config.local.enabled = data.reporting.local.enabled;
      if (data.reporting.local.output_dir) config.local.outputDir = data.reporting.local.output_dir;
      if (data.reporting.local.formats) config.local.formats = data.reporting.local.formats;
    }
    if (data.features) {
      if (data.features.ai_analysis !== void 0)
        config.features.aiAnalysis = data.features.ai_analysis;
      if (data.features.failure_clustering !== void 0)
        config.features.failureClustering = data.features.failure_clustering;
      if (data.features.flaky_detection !== void 0)
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
function autoDiscover() {
  const config = { ...defaultConfig };
  const cwd = process.cwd();
  const searchPaths = [
    path2__namespace.join(cwd, "qagentic.yaml"),
    path2__namespace.join(cwd, "qagentic.yml"),
    path2__namespace.join(cwd, ".qagentic.yaml"),
    path2__namespace.join(cwd, ".qagentic.yml")
  ];
  for (const filePath of searchPaths) {
    if (fs2__namespace.existsSync(filePath)) {
      loadFromFile(filePath, config);
      break;
    }
  }
  return loadFromEnv(config);
}
function configure(options = {}) {
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
function getConfig() {
  return globalConfig;
}

// src/core/status.ts
var Status = /* @__PURE__ */ ((Status2) => {
  Status2["PASSED"] = "passed";
  Status2["FAILED"] = "failed";
  Status2["BROKEN"] = "broken";
  Status2["SKIPPED"] = "skipped";
  Status2["PENDING"] = "pending";
  Status2["RUNNING"] = "running";
  Status2["UNKNOWN"] = "unknown";
  return Status2;
})(Status || {});
function parseStatus(value) {
  const normalized = value.toLowerCase();
  switch (normalized) {
    case "passed":
    case "pass":
    case "success":
      return "passed" /* PASSED */;
    case "failed":
    case "fail":
    case "failure":
      return "failed" /* FAILED */;
    case "broken":
    case "error":
      return "broken" /* BROKEN */;
    case "skipped":
    case "skip":
    case "pending":
      return "skipped" /* SKIPPED */;
    case "running":
      return "running" /* RUNNING */;
    default:
      return "unknown" /* UNKNOWN */;
  }
}

// src/core/reporter.ts
var ConsoleReporter = class {
  constructor(config) {
    this.config = config || getConfig();
  }
  startRun(run) {
    console.log("\n" + "=".repeat(60));
    console.log(`\u{1F680} QAagentic Test Run - ${run.projectName}`);
    console.log(`Environment: ${run.environment}`);
    console.log("=".repeat(60) + "\n");
  }
  endRun(run) {
    const icon = run.failed === 0 ? "\u2705" : "\u274C";
    console.log("\n" + "=".repeat(60));
    console.log(`${icon} Test Run Complete - ${run.passRate.toFixed(1)}% Pass Rate`);
    console.log(`Passed: ${run.passed} | Failed: ${run.failed} | Skipped: ${run.skipped}`);
    console.log("=".repeat(60) + "\n");
  }
  reportTest(test) {
    if (!this.config.features.consoleOutput) return;
    const symbols = {
      ["passed" /* PASSED */]: "\u2713",
      ["failed" /* FAILED */]: "\u2717",
      ["broken" /* BROKEN */]: "!",
      ["skipped" /* SKIPPED */]: "\u25CB",
      ["pending" /* PENDING */]: "\u2026",
      ["running" /* RUNNING */]: "\u2192",
      ["unknown" /* UNKNOWN */]: "?"
    };
    const symbol = symbols[test.status] || "?";
    console.log(`  ${symbol} ${test.name}`);
    if (test.errorMessage) {
      console.log(`    Error: ${test.errorMessage.slice(0, 100)}...`);
    }
  }
};
var JSONReporter = class {
  constructor(config) {
    this.config = config || getConfig();
    this.outputDir = this.config.local.outputDir;
  }
  startRun(run) {
    if (!fs2__namespace.existsSync(this.outputDir)) {
      fs2__namespace.mkdirSync(this.outputDir, { recursive: true });
    }
    if (this.config.local.cleanOnStart) {
      const files = fs2__namespace.readdirSync(this.outputDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          fs2__namespace.unlinkSync(path2__namespace.join(this.outputDir, file));
        }
      }
    }
  }
  endRun(run) {
    if (!this.config.local.enabled || !this.config.local.formats.includes("json")) {
      return;
    }
    const runFile = path2__namespace.join(this.outputDir, "run.json");
    fs2__namespace.writeFileSync(runFile, JSON.stringify(this.serializeRun(run), null, 2));
    const testsDir = path2__namespace.join(this.outputDir, "tests");
    if (!fs2__namespace.existsSync(testsDir)) {
      fs2__namespace.mkdirSync(testsDir, { recursive: true });
    }
    for (const test of run.tests) {
      const testFile = path2__namespace.join(testsDir, `${test.id}.json`);
      fs2__namespace.writeFileSync(testFile, JSON.stringify(this.serializeTest(test), null, 2));
    }
  }
  reportTest(_test) {
  }
  serializeRun(run) {
    return {
      ...run,
      startTime: run.startTime?.toISOString(),
      endTime: run.endTime?.toISOString(),
      tests: run.tests.map((t) => this.serializeTest(t))
    };
  }
  serializeTest(test) {
    return {
      ...test,
      startTime: test.startTime?.toISOString(),
      endTime: test.endTime?.toISOString(),
      steps: test.steps.map((s) => this.serializeStep(s))
    };
  }
  serializeStep(step2) {
    return {
      ...step2,
      startTime: step2.startTime?.toISOString(),
      endTime: step2.endTime?.toISOString(),
      children: step2.children.map((c) => this.serializeStep(c))
    };
  }
};
var JUnitReporter = class {
  constructor(config) {
    this.config = config || getConfig();
    this.outputDir = this.config.local.outputDir;
  }
  startRun(_run) {
    if (!fs2__namespace.existsSync(this.outputDir)) {
      fs2__namespace.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  endRun(run) {
    if (!this.config.local.enabled || !this.config.local.formats.includes("junit")) {
      return;
    }
    const xml = this.generateXml(run);
    const junitFile = path2__namespace.join(this.outputDir, "junit.xml");
    fs2__namespace.writeFileSync(junitFile, xml);
  }
  reportTest(_test) {
  }
  generateXml(run) {
    const escape = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<testsuite name="${escape(run.projectName)}" `;
    xml += `tests="${run.total}" `;
    xml += `failures="${run.failed}" `;
    xml += `errors="${run.broken}" `;
    xml += `skipped="${run.skipped}" `;
    xml += `time="${(run.durationMs / 1e3).toFixed(3)}" `;
    xml += `timestamp="${run.startTime?.toISOString() || ""}">
`;
    for (const test of run.tests) {
      xml += `  <testcase name="${escape(test.name)}" `;
      xml += `classname="${escape(test.fullName)}" `;
      xml += `time="${(test.durationMs / 1e3).toFixed(3)}"`;
      if (test.status === "passed" /* PASSED */) {
        xml += "/>\n";
      } else if (test.status === "failed" /* FAILED */) {
        xml += ">\n";
        xml += `    <failure message="${escape(test.errorMessage || "Test failed")}" `;
        xml += `type="${escape(test.errorType || "AssertionError")}">`;
        if (test.stackTrace) {
          xml += escape(test.stackTrace);
        }
        xml += "</failure>\n";
        xml += "  </testcase>\n";
      } else if (test.status === "broken" /* BROKEN */) {
        xml += ">\n";
        xml += `    <error message="${escape(test.errorMessage || "Test error")}" `;
        xml += `type="${escape(test.errorType || "Error")}">`;
        if (test.stackTrace) {
          xml += escape(test.stackTrace);
        }
        xml += "</error>\n";
        xml += "  </testcase>\n";
      } else if (test.status === "skipped" /* SKIPPED */) {
        xml += ">\n";
        xml += `    <skipped${test.errorMessage ? ` message="${escape(test.errorMessage)}"` : ""}/>
`;
        xml += "  </testcase>\n";
      } else {
        xml += "/>\n";
      }
    }
    xml += "</testsuite>\n";
    return xml;
  }
};
var APIReporter = class {
  constructor(config) {
    this.batch = [];
    this.config = config || getConfig();
  }
  async startRun(run) {
    if (!this.config.api.enabled) return;
    this.currentRun = run;
    this.batch = [];
    try {
      await axios__default.default.post(
        `${this.config.api.url}/api/v1/runs`,
        {
          id: run.id,
          name: run.name,
          project_name: run.projectName,
          environment: run.environment,
          start_time: run.startTime?.toISOString(),
          labels: run.labels,
          ci_build_id: run.ciBuildId,
          branch: run.branch,
          commit_hash: run.commitHash
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": this.config.api.key || "",
            "X-Project": this.config.projectName
          },
          timeout: this.config.api.timeout
        }
      );
    } catch (error) {
      console.warn("Warning: Failed to register run with API:", error);
    }
  }
  async endRun(run) {
    if (!this.config.api.enabled) return;
    await this.flushBatch();
    try {
      await axios__default.default.patch(
        `${this.config.api.url}/api/v1/runs/${run.id}`,
        {
          end_time: run.endTime?.toISOString(),
          duration_ms: run.durationMs,
          total: run.total,
          passed: run.passed,
          failed: run.failed,
          broken: run.broken,
          skipped: run.skipped,
          status: "completed"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": this.config.api.key || ""
          },
          timeout: this.config.api.timeout
        }
      );
    } catch (error) {
      console.warn("Warning: Failed to finalize run with API:", error);
    }
  }
  async reportTest(test) {
    if (!this.config.api.enabled) return;
    this.batch.push(test);
    if (this.batch.length >= this.config.api.batchSize) {
      await this.flushBatch();
    }
  }
  async flushBatch() {
    if (this.batch.length === 0 || !this.currentRun) return;
    try {
      await axios__default.default.post(
        `${this.config.api.url}/api/v1/runs/${this.currentRun.id}/results`,
        this.batch.map((t) => ({
          ...t,
          startTime: t.startTime?.toISOString(),
          endTime: t.endTime?.toISOString()
        })),
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": this.config.api.key || ""
          },
          timeout: this.config.api.timeout
        }
      );
    } catch (error) {
      console.warn("Warning: Failed to send test results to API:", error);
    } finally {
      this.batch = [];
    }
  }
};
var _QAgenticReporter = class _QAgenticReporter {
  constructor(config) {
    this.reporters = [];
    this.currentRun = null;
    this.config = config || getConfig();
    if (this.config.features.consoleOutput) {
      this.reporters.push(new ConsoleReporter(this.config));
    }
    if (this.config.local.enabled) {
      this.reporters.push(new JSONReporter(this.config));
      if (this.config.local.formats.includes("junit")) {
        this.reporters.push(new JUnitReporter(this.config));
      }
    }
    if (this.config.api.enabled) {
      this.reporters.push(new APIReporter(this.config));
    }
  }
  /**
   * Get singleton instance.
   */
  static getInstance(config) {
    if (!_QAgenticReporter.instance) {
      _QAgenticReporter.instance = new _QAgenticReporter(config);
    }
    return _QAgenticReporter.instance;
  }
  /**
   * Reset singleton instance.
   */
  static reset() {
    _QAgenticReporter.instance = null;
  }
  /**
   * Start a new test run.
   */
  async startRun(options = {}) {
    this.currentRun = {
      id: options.id || uuid.v4(),
      name: options.name || `run_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "")}`,
      projectName: options.projectName || this.config.projectName,
      environment: options.environment || this.config.environment,
      startTime: /* @__PURE__ */ new Date(),
      durationMs: 0,
      tests: [],
      total: 0,
      passed: 0,
      failed: 0,
      broken: 0,
      skipped: 0,
      passRate: 0,
      labels: { ...this.config.labels.custom, ...options.labels },
      parameters: options.parameters || {},
      ciBuildId: options.ciBuildId,
      ciBuildUrl: options.ciBuildUrl,
      branch: options.branch,
      commitHash: options.commitHash
    };
    for (const reporter of this.reporters) {
      await reporter.startRun(this.currentRun);
    }
    return this.currentRun;
  }
  /**
   * End the current test run.
   */
  async endRun() {
    if (!this.currentRun) return null;
    this.currentRun.endTime = /* @__PURE__ */ new Date();
    this.currentRun.durationMs = this.currentRun.endTime.getTime() - (this.currentRun.startTime?.getTime() || 0);
    this.currentRun.passRate = this.currentRun.total > 0 ? this.currentRun.passed / this.currentRun.total * 100 : 0;
    for (const reporter of this.reporters) {
      await reporter.endRun(this.currentRun);
    }
    const run = this.currentRun;
    this.currentRun = null;
    return run;
  }
  /**
   * Report a test result.
   */
  async reportTest(test) {
    if (this.currentRun) {
      this.currentRun.tests.push(test);
      this.currentRun.total++;
      switch (test.status) {
        case "passed" /* PASSED */:
          this.currentRun.passed++;
          break;
        case "failed" /* FAILED */:
          this.currentRun.failed++;
          break;
        case "broken" /* BROKEN */:
          this.currentRun.broken++;
          break;
        case "skipped" /* SKIPPED */:
          this.currentRun.skipped++;
          break;
      }
    }
    for (const reporter of this.reporters) {
      await reporter.reportTest(test);
    }
  }
  /**
   * Get the current test run.
   */
  getCurrentRun() {
    return this.currentRun;
  }
};
_QAgenticReporter.instance = null;
var QAgenticReporter = _QAgenticReporter;
var currentSteps = [];
function getCurrentStep() {
  return currentSteps[currentSteps.length - 1];
}
var Step = class {
  constructor(name, description, parameters) {
    this.status = "pending" /* PENDING */;
    this.durationMs = 0;
    this.attachments = [];
    this.children = [];
    this.parameters = {};
    this.id = uuid.v4();
    this.name = name;
    this.description = description;
    this.parameters = parameters || {};
  }
  /**
   * Start the step.
   */
  start() {
    this.startTime = /* @__PURE__ */ new Date();
    this.status = "running" /* RUNNING */;
    currentSteps.push(this);
    return this;
  }
  /**
   * End the step.
   */
  end(error) {
    this.endTime = /* @__PURE__ */ new Date();
    if (this.startTime) {
      this.durationMs = this.endTime.getTime() - this.startTime.getTime();
    }
    const index = currentSteps.indexOf(this);
    if (index > -1) {
      currentSteps.splice(index, 1);
    }
    const parent = getCurrentStep();
    if (parent) {
      parent.children.push(this);
    }
    if (error) {
      this.status = "failed" /* FAILED */;
      this.error = error.message;
      this.errorTrace = error.stack;
    } else {
      this.status = "passed" /* PASSED */;
    }
    return this;
  }
  /**
   * Attach data to this step.
   */
  attach(data, name, type = "text/plain") {
    const content = typeof data === "string" ? data : data.toString("base64");
    this.attachments.push({
      id: uuid.v4(),
      name,
      type,
      content,
      size: typeof data === "string" ? data.length : data.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    return this;
  }
  /**
   * Attach a screenshot.
   */
  attachScreenshot(path3, name = "Screenshot") {
    return this.attach(path3, name, "image/png");
  }
  /**
   * Attach JSON data.
   */
  attachJson(data, name = "JSON Data") {
    return this.attach(JSON.stringify(data, null, 2), name, "application/json");
  }
  /**
   * Set a step parameter.
   */
  setParameter(name, value) {
    this.parameters[name] = value;
    return this;
  }
  /**
   * Convert to result object.
   */
  toResult() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      durationMs: this.durationMs,
      error: this.error,
      errorTrace: this.errorTrace,
      attachments: this.attachments,
      children: this.children.map((c) => c.toResult()),
      parameters: this.parameters
    };
  }
};
function step(name, descriptionOrFn, fn) {
  const description = typeof descriptionOrFn === "string" ? descriptionOrFn : void 0;
  const callback = typeof descriptionOrFn === "function" ? descriptionOrFn : fn;
  const s = new Step(name, description);
  s.start();
  try {
    const result = callback();
    if (result instanceof Promise) {
      return result.then((value) => {
        s.end();
        return value;
      }).catch((error) => {
        s.end(error);
        throw error;
      });
    }
    s.end();
    return result;
  } catch (error) {
    s.end(error);
    throw error;
  }
}

// src/core/severity.ts
var Severity = /* @__PURE__ */ ((Severity3) => {
  Severity3["BLOCKER"] = "blocker";
  Severity3["CRITICAL"] = "critical";
  Severity3["NORMAL"] = "normal";
  Severity3["MINOR"] = "minor";
  Severity3["TRIVIAL"] = "trivial";
  return Severity3;
})(Severity || {});
function parseSeverity(value) {
  const normalized = value.toLowerCase();
  switch (normalized) {
    case "blocker":
      return "blocker" /* BLOCKER */;
    case "critical":
      return "critical" /* CRITICAL */;
    case "minor":
      return "minor" /* MINOR */;
    case "trivial":
      return "trivial" /* TRIVIAL */;
    default:
      return "normal" /* NORMAL */;
  }
}

// src/core/decorators.ts
var QAGENTIC_METADATA = /* @__PURE__ */ Symbol("qagentic_metadata");
function getMetadata(target) {
  const obj = target;
  if (!obj[QAGENTIC_METADATA]) {
    obj[QAGENTIC_METADATA] = {
      labels: {},
      links: [],
      attachments: []
    };
  }
  return obj[QAGENTIC_METADATA];
}
function addLabel(name, value) {
  return function(target) {
    const metadata = getMetadata(target);
    metadata.labels[name] = value;
    return target;
  };
}
function feature(name) {
  return addLabel("feature", name);
}
function story(name) {
  return addLabel("story", name);
}
function epic(name) {
  return addLabel("epic", name);
}
function severity(level) {
  const sev = typeof level === "string" ? parseSeverity(level) : level;
  return addLabel("severity", sev);
}
function tag(...tags) {
  return function(target) {
    const metadata = getMetadata(target);
    const existingTags = metadata.labels["tags"] || [];
    metadata.labels["tags"] = [...existingTags, ...tags];
    return target;
  };
}
function label(name, value) {
  return addLabel(name, value);
}
function attach(data, name, type = "text/plain", extension) {
  const attachmentId = uuid.v4();
  let content;
  let size;
  if (Buffer.isBuffer(data)) {
    content = data.toString("base64");
    size = data.length;
  } else {
    content = data;
    size = data.length;
  }
  const attachment = {
    id: attachmentId,
    name,
    type,
    extension,
    content,
    size,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  const currentStep = getCurrentStep();
  if (currentStep) {
    currentStep.attachments.push(attachment);
  }
  return attachmentId;
}
function attachScreenshot(data, name = "Screenshot") {
  if (typeof data === "string" && fs2__namespace.existsSync(data)) {
    const content = fs2__namespace.readFileSync(data);
    return attach(content, name, "image/png", "png");
  }
  return attach(data, name, "image/png", "png");
}
function attachJson(data, name = "JSON Data") {
  const jsonStr = JSON.stringify(data, null, 2);
  return attach(jsonStr, name, "application/json", "json");
}
function attachText(text, name = "Text") {
  return attach(text, name, "text/plain", "txt");
}
function setupQAgentic(on, config) {
  const projectName = process.env.QAGENTIC_PROJECT_NAME || config.projectId || "Cypress E2E Tests";
  const environment = process.env.QAGENTIC_ENVIRONMENT || process.env.NODE_ENV || "e2e";
  const apiUrl = process.env.QAGENTIC_API_URL || "http://localhost:8080";
  configure({
    projectName,
    environment,
    apiUrl,
    outputDir: "./qagentic-results"
  });
  const reporter = QAgenticReporter.getInstance();
  let currentRun = null;
  on("before:run", async () => {
    try {
      currentRun = await reporter.startRun({
        name: `cypress_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "")}`,
        projectName,
        environment
      });
      console.log("[QAagentic] Test run started successfully");
    } catch (error) {
      console.warn("[QAagentic] Failed to start run:", error);
    }
  });
  on("after:spec", async (_spec, results) => {
    if (!results?.tests) return;
    for (const test of results.tests) {
      try {
        const testResult = {
          id: uuid.v4(),
          name: test.title[test.title.length - 1],
          fullName: test.title.join(" > "),
          status: parseStatus(test.state),
          durationMs: test.duration,
          startTime: new Date(Date.now() - test.duration),
          endTime: /* @__PURE__ */ new Date(),
          labels: {
            suite: test.title.slice(0, -1).join(" > "),
            feature: test.title[0]
          },
          links: [],
          parameters: {},
          steps: [],
          attachments: [],
          filePath: results.spec.relative,
          retryCount: 0,
          isRetry: false,
          isFlaky: false
        };
        if (test.err) {
          testResult.errorMessage = test.err.message;
          testResult.stackTrace = test.err.stack;
          testResult.errorType = "AssertionError";
        }
        await reporter.reportTest(testResult);
      } catch (error) {
        console.warn("[QAagentic] Failed to report test:", error);
      }
    }
  });
  on("after:run", async () => {
    try {
      await reporter.endRun();
      console.log("[QAagentic] Test run completed");
    } catch (error) {
      console.warn("[QAagentic] Failed to end run:", error);
    }
  });
}

// src/cypress/index.ts
function qagentic(on, config, options = {}) {
  configure({
    projectName: options.projectName || config.projectId || "cypress-project",
    environment: options.environment || config.env?.QAGENTIC_ENVIRONMENT || "local",
    apiUrl: options.apiUrl || config.env?.QAGENTIC_API_URL,
    apiKey: options.apiKey || config.env?.QAGENTIC_API_KEY,
    outputDir: options.outputDir || "./qagentic-results"
  });
  const reporter = QAgenticReporter.getInstance();
  on("before:run", async (details) => {
    await reporter.startRun({
      name: `cypress_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "")}`,
      projectName: options.projectName || details.config?.projectId || "cypress-project",
      environment: options.environment || "local",
      branch: details.config?.env?.BRANCH || process.env.BRANCH,
      commitHash: details.config?.env?.COMMIT || process.env.COMMIT
    });
  });
  on("after:spec", async (_spec, results) => {
    if (!results || !results.tests) return;
    for (const test of results.tests) {
      const testResult = {
        id: uuid.v4(),
        name: test.title[test.title.length - 1],
        fullName: test.title.join(" > "),
        status: parseStatus(test.state),
        durationMs: test.duration,
        startTime: new Date(Date.now() - test.duration),
        endTime: /* @__PURE__ */ new Date(),
        labels: {
          suite: test.title.slice(0, -1).join(" > "),
          feature: test.title[0]
        },
        links: [],
        parameters: {},
        steps: [],
        attachments: [],
        filePath: results.spec.relative,
        retryCount: 0,
        isRetry: false,
        isFlaky: false
      };
      if (test.err) {
        testResult.errorMessage = test.err.message;
        testResult.stackTrace = test.err.stack;
        testResult.errorType = "AssertionError";
      }
      await reporter.reportTest(testResult);
    }
  });
  on("after:run", async () => {
    await reporter.endRun();
  });
}
function registerCommands() {
}
var cypress_default = qagentic;

exports.Severity = Severity;
exports.Status = Status;
exports.Step = Step;
exports.attach = attach;
exports.attachJson = attachJson;
exports.attachScreenshot = attachScreenshot;
exports.attachText = attachText;
exports.default = cypress_default;
exports.epic = epic;
exports.feature = feature;
exports.label = label;
exports.qagentic = qagentic;
exports.registerCommands = registerCommands;
exports.setupQAgentic = setupQAgentic;
exports.severity = severity;
exports.step = step;
exports.story = story;
exports.tag = tag;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
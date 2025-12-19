# Changelog

All notable changes to QAagentic SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2024-12-19

### 🎉 Initial Release

We're excited to announce the first stable release of QAagentic SDK!

#### Python SDK (`qagentic-pytest`)

**Added**
- pytest integration with automatic test discovery and reporting
- Decorators for test metadata: `@feature`, `@story`, `@epic`, `@severity`, `@tag`, `@owner`, `@link`, `@issue`, `@testcase`, `@description`, `@title`, `@label`
- Step context manager for structured test steps
- Attachment utilities: `attach`, `attach_file`, `attach_screenshot`, `attach_json`, `attach_text`, `attach_html`, `attach_video`, `attach_csv`
- Multiple output formats: JSON, HTML, JUnit XML
- API reporter for real-time reporting to QAagentic server
- Console reporter with rich formatting
- Configuration via environment variables, YAML files, and programmatic API
- CI/CD detection for GitHub Actions, GitLab CI, Jenkins, Azure DevOps, CircleCI, Travis CI
- Severity levels: BLOCKER, CRITICAL, NORMAL, MINOR, TRIVIAL
- Status tracking: PASSED, FAILED, BROKEN, SKIPPED, PENDING

**Requirements**
- Python 3.8+
- pytest 7.0+

#### JavaScript/TypeScript SDK (`@qagentic/reporter`)

**Added**
- Cypress plugin with automatic test result capture
- Playwright reporter integration
- Jest reporter integration
- Step function for structured test steps
- Decorators for test metadata (TypeScript)
- Attachment utilities: `attach`, `attachScreenshot`, `attachJson`, `attachText`
- Multiple output formats: JSON, JUnit XML
- API reporter for real-time reporting
- Configuration via environment variables, YAML files, and programmatic API
- TypeScript type definitions included

**Requirements**
- Node.js 16+
- Cypress 12+ (optional)
- Playwright 1.40+ (optional)
- Jest 29+ (optional)

#### AI Features

**Added**
- Automatic root cause analysis for test failures
- Failure clustering to group related issues
- Flaky test detection and scoring
- Smart recommendations for fixing issues
- Quality trend analysis

#### Documentation

**Added**
- Comprehensive API reference
- Framework-specific guides (pytest, Cypress, Playwright, Jest)
- CI/CD integration examples
- Configuration guide
- AI features documentation
- Migration guide from Allure

---

## [Unreleased]

### Planned Features

#### Python SDK
- Robot Framework integration
- unittest integration improvements
- Async test support enhancements
- HTML report generation

#### JavaScript SDK
- Mocha integration
- WebdriverIO integration
- TestCafe integration
- HTML report generation

#### AI Features
- Code change correlation
- Automated fix suggestions with code snippets
- Test prioritization recommendations
- Coverage gap analysis

#### Platform
- Team collaboration features
- Slack/Teams notifications
- Custom dashboards
- API webhooks

---

## Version History

| Version | Release Date | Python Package | JavaScript Package |
|---------|--------------|----------------|-------------------|
| 1.0.0 | 2024-12-19 | `qagentic-pytest` | `@qagentic/reporter` |

---

## Upgrade Guide

### Upgrading to 1.0.0

This is the initial release. No upgrade steps required.

### Future Upgrades

We follow semantic versioning:
- **Major versions** (2.0.0): May contain breaking changes
- **Minor versions** (1.1.0): New features, backward compatible
- **Patch versions** (1.0.1): Bug fixes, backward compatible

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/qagentic/qagentic-sdk/issues
- Discord: https://discord.gg/qagentic
- Email: support@qagentic.io

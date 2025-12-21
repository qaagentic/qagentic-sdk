# QAagentic SDK Publishing Guide

## Pre-Publishing Checklist

✅ Version: 0.1.2
✅ CLI Tool: `qagentic init` command implemented
✅ Auto-configuration system: Complete
✅ Updated integration tests: Simplified setup
✅ Updated documentation: New quick-start guide
✅ Dependencies: All added (click>=8.0.0)
✅ Entry points: CLI and pytest plugin configured

## Publishing Steps

### Step 1: Setup PyPI Credentials

Create or update `~/.pypirc`:

```ini
[distutils]
index-servers =
    pypi
    testpypi

[pypi]
repository = https://upload.pypi.org/legacy/
username = __token__
password = pypi-AgEIcHlwaS5vcmc...  # Your PyPI token

[testpypi]
repository = https://test.pypi.org/legacy/
username = __token__
password = pypi-AgEIcHlwaS5vcmc...  # Your TestPyPI token
```

### Step 2: Install Build Tools

```bash
pip install build twine
```

### Step 3: Build Distribution Packages

```bash
cd c:\Users\psingh\git\parinder-personal-space\QAagentic\qagentic-sdk\packages\python
python -m build
```

This creates:
- `dist/qagentic_pytest-0.1.2-py3-none-any.whl` (wheel)
- `dist/qagentic_pytest-0.1.2.tar.gz` (source distribution)

### Step 4: Verify Packages (Optional but Recommended)

```bash
twine check dist/*
```

### Step 5: Publish to TestPyPI (Optional - for testing)

```bash
twine upload --repository testpypi dist/*
```

Then test installation:
```bash
pip install --index-url https://test.pypi.org/simple/ qagentic-pytest==0.1.2
```

### Step 6: Publish to PyPI (Production)

```bash
twine upload dist/*
```

Or with explicit repository:
```bash
twine upload -r pypi dist/*
```

### Step 7: Verify Package on PyPI

Visit: https://pypi.org/project/qagentic-pytest/

### Step 8: Test Installation

```bash
pip install qagentic-pytest==0.1.2
```

Verify CLI is available:
```bash
qagentic --help
qagentic init --help
```

## What's New in v0.1.2

### New Features
- **CLI Tool**: One-command setup with `qagentic init`
- **Auto-Configuration**: Automatic detection and setup for pytest, Cypress, Playwright
- **Simplified Setup**: Reduced from 5+ steps to 1 command
- **Health Check**: `qagentic doctor` command for diagnostics
- **Status Check**: `qagentic status` command for configuration verification

### Improvements
- Fixed API Gateway endpoint compatibility
- Improved test result serialization
- Better error handling and logging
- Comprehensive documentation updates

### Breaking Changes
None - fully backward compatible

## Release Notes

```markdown
# v0.1.2 - Simplified Integration & CLI Tool

## Features
- ✨ New CLI tool for one-command setup
- 🚀 Auto-configuration system for all frameworks
- 📊 Automatic test result capture and reporting
- 🔧 Health check and status commands
- 📖 Comprehensive quick-start guide

## Improvements
- ⚡ Reduced setup time from 15+ minutes to 2 minutes
- 🎯 Simplified configuration process
- 🐛 Fixed API Gateway endpoint compatibility
- 📝 Updated documentation with new quick-start

## Installation
```bash
pip install qagentic-pytest==0.1.2
qagentic init --name "My Project" --framework pytest
pytest tests/ -v
```

## Documentation
- [Quick Start Guide](./QUICK_START.md)
- [Full Documentation](./docs)
- [GitHub Repository](https://github.com/qagentic/qagentic-sdk)
```

## Troubleshooting

### Issue: "twine: command not found"
```bash
pip install twine
```

### Issue: "Invalid authentication"
- Verify PyPI token in `~/.pypirc`
- Generate new token at https://pypi.org/manage/account/tokens/

### Issue: "Package already exists"
- Increment version number in `pyproject.toml`
- Rebuild and republish

### Issue: "Build fails"
```bash
# Clean previous builds
rm -rf dist/ build/ *.egg-info

# Rebuild
python -m build
```

## Post-Publishing

1. Update GitHub releases with release notes
2. Announce on social media/community channels
3. Update documentation links
4. Monitor for issues and feedback
5. Plan next release (v0.1.3, v0.2.0, etc.)

## Version Bumping Strategy

- **Patch (0.1.x)**: Bug fixes, minor improvements
- **Minor (0.x.0)**: New features, backward compatible
- **Major (x.0.0)**: Breaking changes, major refactoring

Current: v0.1.2 → Next: v0.1.3 or v0.2.0

## Resources

- [PyPI Help](https://pypi.org/help/)
- [Twine Documentation](https://twine.readthedocs.io/)
- [Python Packaging Guide](https://packaging.python.org/)

# Troubleshooting Guide

Solutions to common issues when using QAagentic SDK.

---

## Installation Issues

### Python: Package Not Found

**Error:**
```
ERROR: Could not find a version that satisfies the requirement qagentic-pytest
```

**Solution:**
```bash
# Upgrade pip
pip install --upgrade pip

# Install from PyPI
pip install qagentic-pytest

# Or install from source
pip install git+https://github.com/qagentic/qagentic-sdk.git#subdirectory=packages/python
```

### JavaScript: Peer Dependency Warnings

**Warning:**
```
npm WARN @qagentic/reporter@1.0.0 requires a peer of cypress@>=12.0.0
```

**Solution:**
This is expected if you're not using all supported frameworks. The peer dependencies are optional.

---

## Plugin Not Loading

### Python: pytest Plugin Not Detected

**Symptom:** Tests run but no QAagentic output is generated.

**Solutions:**

1. **Verify installation:**
   ```bash
   pip show qagentic-pytest
   pytest --co -q  # List plugins
   ```

2. **Enable explicitly:**
   ```bash
   pytest --qagentic
   ```

3. **Check for conflicts:**
   ```bash
   pip list | grep allure  # Conflicts with allure-pytest
   ```

4. **Add to pytest.ini:**
   ```ini
   [pytest]
   addopts = --qagentic
   ```

### JavaScript: Reporter Not Running

**Symptom:** Tests complete but no reports generated.

**Solutions:**

1. **Verify configuration:**
   ```javascript
   // cypress.config.js - Check plugin is called
   setupNodeEvents(on, config) {
     qagentic(on, config);  // Must be called
     return config;
   }
   ```

2. **Check for errors in console:**
   ```bash
   DEBUG=qagentic* npx cypress run
   ```

---

## No Output Generated

### Output Directory Not Created

**Symptom:** `qagentic-results` folder doesn't exist after test run.

**Solutions:**

1. **Check permissions:**
   ```bash
   # Verify write permissions
   touch qagentic-results/test.txt
   ```

2. **Specify absolute path:**
   ```yaml
   # qagentic.yaml
   reporting:
     local:
       output_dir: /absolute/path/to/results
   ```

3. **Enable local reporting:**
   ```bash
   QAGENTIC_LOCAL_ENABLED=true pytest --qagentic
   ```

### Empty JSON Files

**Symptom:** JSON files are created but contain no test data.

**Solutions:**

1. **Check test discovery:**
   ```bash
   pytest --collect-only
   ```

2. **Verify tests are running:**
   ```bash
   pytest -v --qagentic
   ```

---

## API Connection Issues

### Connection Refused

**Error:**
```
ConnectionError: Failed to connect to https://api.qagentic.io
```

**Solutions:**

1. **Verify URL:**
   ```bash
   curl -I https://api.qagentic.io/health
   ```

2. **Check firewall/proxy:**
   ```bash
   # Set proxy if needed
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

3. **Disable API reporting temporarily:**
   ```bash
   QAGENTIC_API_ENABLED=false pytest --qagentic
   ```

### Authentication Failed

**Error:**
```
401 Unauthorized: Invalid API key
```

**Solutions:**

1. **Verify API key:**
   ```bash
   echo $QAGENTIC_API_KEY
   ```

2. **Check key format:**
   ```bash
   # Key should be a valid token, not contain quotes
   QAGENTIC_API_KEY=abc123  # Correct
   QAGENTIC_API_KEY="abc123"  # May cause issues
   ```

3. **Regenerate API key** in QAagentic dashboard.

### Timeout Errors

**Error:**
```
TimeoutError: Request timed out after 30000ms
```

**Solutions:**

1. **Increase timeout:**
   ```yaml
   reporting:
     api:
       timeout: 60000  # 60 seconds
   ```

2. **Reduce batch size:**
   ```yaml
   reporting:
     api:
       batch_size: 50  # Smaller batches
   ```

---

## Test Metadata Not Captured

### Decorators Not Working

**Symptom:** Labels like `@feature`, `@story` not appearing in reports.

**Solutions:**

1. **Import from correct module:**
   ```python
   # Correct
   from qagentic import feature, story
   
   # Wrong
   from allure import feature, story
   ```

2. **Apply to test function, not class:**
   ```python
   @feature("Auth")  # On function
   def test_login():
       pass
   ```

### Steps Not Recorded

**Symptom:** Test passes but steps are empty.

**Solutions:**

1. **Use context manager correctly:**
   ```python
   # Correct
   with step("My step"):
       do_something()
   
   # Wrong - step not entered
   step("My step")
   do_something()
   ```

2. **Check for exceptions in step:**
   ```python
   with step("My step"):
       try:
           risky_operation()
       except Exception as e:
           # Step will be marked as failed
           raise
   ```

---

## Attachments Not Appearing

### Screenshots Not Attached

**Symptom:** `attach_screenshot` called but not in report.

**Solutions:**

1. **Verify file exists:**
   ```python
   import os
   print(os.path.exists("screenshot.png"))  # Should be True
   ```

2. **Use absolute path:**
   ```python
   from pathlib import Path
   attach_screenshot(Path("screenshot.png").absolute())
   ```

3. **Check file size:**
   ```python
   # Large files may be truncated
   # Max recommended: 10MB
   ```

### JSON Attachments Empty

**Symptom:** JSON attachment shows `{}` or `null`.

**Solutions:**

1. **Verify data is serializable:**
   ```python
   import json
   json.dumps(data)  # Should not raise
   ```

2. **Handle non-serializable types:**
   ```python
   # Convert datetime, etc.
   attach_json({
       "timestamp": datetime.now().isoformat(),
       "data": data
   })
   ```

---

## Performance Issues

### Slow Test Execution

**Symptom:** Tests run slower with QAagentic enabled.

**Solutions:**

1. **Disable console output:**
   ```yaml
   features:
     console_output: false
   ```

2. **Reduce attachment size:**
   ```python
   # Compress large attachments
   attach_json(summary_data)  # Not full response
   ```

3. **Use batch API reporting:**
   ```yaml
   reporting:
     api:
       batch_size: 100  # Send in batches
   ```

### High Memory Usage

**Symptom:** Memory grows during long test runs.

**Solutions:**

1. **Clear attachments between tests:**
   ```python
   # Automatic in pytest plugin
   # Manual: qagentic.clear_attachments()
   ```

2. **Limit attachment retention:**
   ```yaml
   features:
     screenshots: on_failure  # Not 'always'
   ```

---

## CI/CD Issues

### Secrets Not Available

**Symptom:** API key is empty in CI.

**Solutions:**

1. **GitHub Actions:**
   ```yaml
   env:
     QAGENTIC_API_KEY: ${{ secrets.QAGENTIC_API_KEY }}
   ```

2. **GitLab CI:**
   ```yaml
   variables:
     QAGENTIC_API_KEY: $QAGENTIC_API_KEY  # From CI/CD settings
   ```

3. **Verify secret is set:**
   ```yaml
   - run: |
       if [ -z "$QAGENTIC_API_KEY" ]; then
         echo "API key not set!"
         exit 1
       fi
   ```

### Artifacts Not Uploaded

**Symptom:** Results not available after build.

**Solutions:**

1. **Use `if: always()`:**
   ```yaml
   - uses: actions/upload-artifact@v4
     if: always()  # Upload even on failure
     with:
       name: results
       path: qagentic-results/
   ```

2. **Check path exists:**
   ```yaml
   - run: ls -la qagentic-results/
   ```

---

## Debug Mode

Enable debug logging for detailed troubleshooting:

### Python

```bash
QAGENTIC_DEBUG=true pytest --qagentic -v
```

### JavaScript

```bash
DEBUG=qagentic* npx cypress run
```

### Output Example

```
[QAagentic] Configuration loaded from qagentic.yaml
[QAagentic] API URL: https://api.qagentic.io
[QAagentic] Output directory: ./qagentic-results
[QAagentic] Starting test run: run_20241219_143052
[QAagentic] Test started: test_login
[QAagentic] Step started: Navigate to login page
[QAagentic] Step completed: Navigate to login page (450ms)
[QAagentic] Test completed: test_login (PASSED, 1250ms)
[QAagentic] Sending batch of 1 results to API
[QAagentic] API response: 200 OK
[QAagentic] Test run completed: 1 passed, 0 failed
```

---

## Getting Help

If you're still experiencing issues:

1. **Check GitHub Issues:** https://github.com/qagentic/qagentic-sdk/issues
2. **Join Discord:** https://discord.gg/qagentic
3. **Email Support:** support@qagentic.io

When reporting issues, include:
- QAagentic SDK version
- Python/Node.js version
- Test framework and version
- Full error message and stack trace
- Minimal reproduction steps

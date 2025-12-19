# CI/CD Integration Guide

Complete guide for integrating QAagentic with popular CI/CD platforms.

---

## Overview

QAagentic seamlessly integrates with all major CI/CD platforms to provide:

- **Automated test reporting** - Results sent automatically after each run
- **Historical tracking** - Track quality trends across builds
- **Failure analysis** - AI-powered insights in your pipeline
- **Artifact management** - Reports stored as build artifacts

---

## GitHub Actions

### Basic Setup

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install qagentic-pytest
      
      - name: Run tests with QAagentic
        run: pytest --qagentic -v
        env:
          QAGENTIC_PROJECT_NAME: ${{ github.repository }}
          QAGENTIC_ENVIRONMENT: ci
          QAGENTIC_API_URL: ${{ secrets.QAGENTIC_API_URL }}
          QAGENTIC_API_KEY: ${{ secrets.QAGENTIC_API_KEY }}
      
      - name: Upload QAagentic results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: qagentic-results
          path: qagentic-results/
          retention-days: 30
```

### With Matrix Testing

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.9', '3.10', '3.11', '3.12']
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python ${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      
      - name: Install and test
        run: |
          pip install -r requirements.txt qagentic-pytest
          pytest --qagentic
        env:
          QAGENTIC_PROJECT_NAME: ${{ github.repository }}
          QAGENTIC_ENVIRONMENT: ci-${{ matrix.os }}-py${{ matrix.python-version }}
```

### JavaScript/Cypress

```yaml
jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Cypress tests
        uses: cypress-io/github-action@v6
        with:
          start: npm start
          wait-on: 'http://localhost:3000'
        env:
          QAGENTIC_API_URL: ${{ secrets.QAGENTIC_API_URL }}
          QAGENTIC_API_KEY: ${{ secrets.QAGENTIC_API_KEY }}
      
      - name: Upload results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: qagentic-results
          path: qagentic-results/
```

### JavaScript/Playwright

```yaml
jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run Playwright tests
        run: npx playwright test
        env:
          QAGENTIC_API_URL: ${{ secrets.QAGENTIC_API_URL }}
          QAGENTIC_API_KEY: ${{ secrets.QAGENTIC_API_KEY }}
      
      - name: Upload results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            qagentic-results/
            playwright-report/
```

---

## GitLab CI

### Basic Setup

```yaml
# .gitlab-ci.yml
stages:
  - test

variables:
  QAGENTIC_PROJECT_NAME: $CI_PROJECT_NAME
  QAGENTIC_ENVIRONMENT: ci
  QAGENTIC_API_URL: $QAGENTIC_API_URL
  QAGENTIC_API_KEY: $QAGENTIC_API_KEY

test:python:
  stage: test
  image: python:3.11
  script:
    - pip install -r requirements.txt
    - pip install qagentic-pytest
    - pytest --qagentic
  artifacts:
    when: always
    paths:
      - qagentic-results/
    reports:
      junit: qagentic-results/junit.xml
    expire_in: 30 days

test:cypress:
  stage: test
  image: cypress/browsers:node-20.9.0-chrome-118.0.5993.88-1-ff-118.0.2-edge-118.0.2088.46-1
  script:
    - npm ci
    - npm start &
    - npx wait-on http://localhost:3000
    - npx cypress run
  artifacts:
    when: always
    paths:
      - qagentic-results/
      - cypress/screenshots/
      - cypress/videos/
    reports:
      junit: qagentic-results/junit.xml

test:playwright:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  script:
    - npm ci
    - npx playwright test
  artifacts:
    when: always
    paths:
      - qagentic-results/
      - playwright-report/
    reports:
      junit: qagentic-results/junit.xml
```

### With Parallel Testing

```yaml
test:parallel:
  stage: test
  image: python:3.11
  parallel: 4
  script:
    - pip install -r requirements.txt qagentic-pytest
    - pytest --qagentic -n auto --dist loadfile
  artifacts:
    when: always
    paths:
      - qagentic-results/
    reports:
      junit: qagentic-results/junit.xml
```

---

## Jenkins

### Declarative Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        QAGENTIC_PROJECT_NAME = "${env.JOB_NAME}"
        QAGENTIC_ENVIRONMENT = 'ci'
        QAGENTIC_API_URL = credentials('qagentic-api-url')
        QAGENTIC_API_KEY = credentials('qagentic-api-key')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install') {
            steps {
                sh '''
                    python -m venv venv
                    . venv/bin/activate
                    pip install -r requirements.txt
                    pip install qagentic-pytest
                '''
            }
        }
        
        stage('Test') {
            steps {
                sh '''
                    . venv/bin/activate
                    pytest --qagentic -v
                '''
            }
            post {
                always {
                    junit 'qagentic-results/junit.xml'
                    archiveArtifacts artifacts: 'qagentic-results/**/*', allowEmptyArchive: true
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
```

### Scripted Pipeline

```groovy
node {
    stage('Checkout') {
        checkout scm
    }
    
    stage('Test') {
        withCredentials([
            string(credentialsId: 'qagentic-api-url', variable: 'QAGENTIC_API_URL'),
            string(credentialsId: 'qagentic-api-key', variable: 'QAGENTIC_API_KEY')
        ]) {
            withEnv([
                "QAGENTIC_PROJECT_NAME=${env.JOB_NAME}",
                "QAGENTIC_ENVIRONMENT=ci"
            ]) {
                sh '''
                    pip install -r requirements.txt qagentic-pytest
                    pytest --qagentic
                '''
            }
        }
    }
    
    stage('Publish Results') {
        junit 'qagentic-results/junit.xml'
        archiveArtifacts 'qagentic-results/**/*'
    }
}
```

---

## Azure DevOps

### YAML Pipeline

```yaml
# azure-pipelines.yml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  QAGENTIC_PROJECT_NAME: $(Build.Repository.Name)
  QAGENTIC_ENVIRONMENT: ci

stages:
  - stage: Test
    jobs:
      - job: PythonTests
        steps:
          - task: UsePythonVersion@0
            inputs:
              versionSpec: '3.11'
          
          - script: |
              pip install -r requirements.txt
              pip install qagentic-pytest
            displayName: 'Install dependencies'
          
          - script: pytest --qagentic
            displayName: 'Run tests'
            env:
              QAGENTIC_API_URL: $(QAGENTIC_API_URL)
              QAGENTIC_API_KEY: $(QAGENTIC_API_KEY)
          
          - task: PublishTestResults@2
            condition: always()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'qagentic-results/junit.xml'
              testRunTitle: 'Python Tests'
          
          - task: PublishBuildArtifacts@1
            condition: always()
            inputs:
              pathToPublish: 'qagentic-results'
              artifactName: 'qagentic-results'

      - job: CypressTests
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
          
          - script: npm ci
            displayName: 'Install dependencies'
          
          - script: |
              npm start &
              npx wait-on http://localhost:3000
              npx cypress run
            displayName: 'Run Cypress tests'
            env:
              QAGENTIC_API_URL: $(QAGENTIC_API_URL)
              QAGENTIC_API_KEY: $(QAGENTIC_API_KEY)
          
          - task: PublishTestResults@2
            condition: always()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'qagentic-results/junit.xml'
```

---

## CircleCI

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  python: circleci/python@2.1
  node: circleci/node@5.1

jobs:
  test-python:
    docker:
      - image: cimg/python:3.11
    environment:
      QAGENTIC_PROJECT_NAME: my-project
      QAGENTIC_ENVIRONMENT: ci
    steps:
      - checkout
      - python/install-packages:
          pkg-manager: pip
      - run:
          name: Install QAagentic
          command: pip install qagentic-pytest
      - run:
          name: Run tests
          command: pytest --qagentic
      - store_test_results:
          path: qagentic-results
      - store_artifacts:
          path: qagentic-results

  test-cypress:
    docker:
      - image: cypress/browsers:node-20.9.0-chrome-118.0.5993.88-1-ff-118.0.2-edge-118.0.2088.46-1
    environment:
      QAGENTIC_PROJECT_NAME: my-project
      QAGENTIC_ENVIRONMENT: ci
    steps:
      - checkout
      - node/install-packages
      - run:
          name: Start app
          command: npm start
          background: true
      - run:
          name: Wait for app
          command: npx wait-on http://localhost:3000
      - run:
          name: Run Cypress
          command: npx cypress run
      - store_test_results:
          path: qagentic-results
      - store_artifacts:
          path: qagentic-results

workflows:
  test:
    jobs:
      - test-python
      - test-cypress
```

---

## Travis CI

```yaml
# .travis.yml
language: python
python:
  - "3.11"

env:
  global:
    - QAGENTIC_PROJECT_NAME=$TRAVIS_REPO_SLUG
    - QAGENTIC_ENVIRONMENT=ci

install:
  - pip install -r requirements.txt
  - pip install qagentic-pytest

script:
  - pytest --qagentic

after_script:
  - |
    if [ -d "qagentic-results" ]; then
      echo "QAagentic results generated"
    fi
```

---

## Bitbucket Pipelines

```yaml
# bitbucket-pipelines.yml
image: python:3.11

pipelines:
  default:
    - step:
        name: Run Tests
        caches:
          - pip
        script:
          - pip install -r requirements.txt
          - pip install qagentic-pytest
          - pytest --qagentic
        artifacts:
          - qagentic-results/**

  branches:
    main:
      - step:
          name: Run Tests (Production)
          script:
            - pip install -r requirements.txt qagentic-pytest
            - pytest --qagentic
          artifacts:
            - qagentic-results/**

definitions:
  caches:
    pip: ~/.cache/pip
```

---

## Docker Integration

### Dockerfile for Testing

```dockerfile
# Dockerfile.test
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir qagentic-pytest

# Copy test files
COPY . .

# Run tests
CMD ["pytest", "--qagentic"]
```

### Docker Compose

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  test:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      - QAGENTIC_PROJECT_NAME=my-project
      - QAGENTIC_ENVIRONMENT=docker
      - QAGENTIC_API_URL=${QAGENTIC_API_URL}
      - QAGENTIC_API_KEY=${QAGENTIC_API_KEY}
    volumes:
      - ./qagentic-results:/app/qagentic-results
```

---

## Best Practices

### 1. Store Secrets Securely

Never commit API keys. Use your CI/CD platform's secret management:

- **GitHub**: Repository Secrets
- **GitLab**: CI/CD Variables (masked)
- **Jenkins**: Credentials Plugin
- **Azure DevOps**: Variable Groups

### 2. Always Upload Artifacts

```yaml
# Always upload, even on failure
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: qagentic-results
    path: qagentic-results/
```

### 3. Use JUnit Reports

Most CI/CD platforms can parse JUnit XML for test insights:

```yaml
# GitLab
artifacts:
  reports:
    junit: qagentic-results/junit.xml

# Azure DevOps
- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'qagentic-results/junit.xml'
```

### 4. Set Meaningful Environment Names

```bash
QAGENTIC_ENVIRONMENT=ci-${CI_COMMIT_BRANCH}-${CI_JOB_NAME}
```

### 5. Include Build Context

```yaml
env:
  QAGENTIC_CI_BUILD_ID: ${{ github.run_id }}
  QAGENTIC_CI_BUILD_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
  QAGENTIC_BRANCH: ${{ github.ref_name }}
  QAGENTIC_COMMIT: ${{ github.sha }}
```

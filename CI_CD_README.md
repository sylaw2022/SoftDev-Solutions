# CI/CD Pipeline Documentation

This project includes a comprehensive Jenkins CI/CD pipeline with end-to-end testing.

## Pipeline Overview

The Jenkins pipeline includes the following stages:

1. **Checkout** - Retrieves source code from repository
2. **Setup Node.js** - Configures Node.js environment (version 20)
3. **Install Dependencies** - Installs npm packages
4. **Lint** - Runs ESLint for code quality checks
5. **Type Check** - Validates TypeScript types
6. **Unit Tests** - Runs Jest unit tests with coverage
7. **Build** - Builds Next.js application
8. **E2E Tests** - Runs Playwright end-to-end tests
9. **Security Scan** - Runs npm audit for security vulnerabilities

## Prerequisites

### Jenkins Setup

1. Install required Jenkins plugins:
   - Pipeline
   - HTML Publisher Plugin
   - JUnit Plugin
   - Coverage Plugin (for test coverage reports)
   - Email Extension Plugin (for notifications)

2. Ensure Node.js is available on Jenkins agent:
   ```bash
   # Install nvm if not available
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 20
   nvm use 20
   ```

3. Install Playwright browsers on Jenkins agent:
   ```bash
   npm install
   npx playwright install --with-deps
   ```

## Running Tests Locally

### Unit Tests
```bash
npm run test:unit
```

### Unit Tests with Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

### End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

## Test Structure

### Unit Tests
- Location: `src/**/__tests__/**/*.test.tsx`
- Framework: Jest + React Testing Library
- Configuration: `jest.config.js`

### E2E Tests
- Location: `e2e/**/*.spec.ts`
- Framework: Playwright
- Configuration: `playwright.config.ts`
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## Pipeline Artifacts

The pipeline generates the following artifacts:

- **Build artifacts**: `.next/` directory
- **Test results**: JUnit XML reports
- **Coverage reports**: HTML and LCOV coverage reports
- **E2E reports**: Playwright HTML reports
- **Screenshots/Videos**: Failed E2E test artifacts

## Environment Variables

The pipeline uses the following environment variables:

- `NODE_VERSION`: Node.js version (default: 20)
- `CI`: Set to 'true' for CI environment
- `NODE_ENV`: Set to 'test' during testing

## Troubleshooting

### Build Failures

1. **Node.js version mismatch**: Ensure Jenkins agent has Node.js 20 installed
2. **Missing dependencies**: Run `npm ci` to ensure clean install
3. **TypeScript errors**: Check `tsconfig.json` and fix type errors

### Test Failures

1. **Unit tests failing**: Check Jest configuration and test files
2. **E2E tests failing**: 
   - Ensure application starts successfully
   - Check Playwright browser installation
   - Verify test selectors match current UI

### Pipeline Timeouts

- Default timeout: 30 minutes
- Increase if needed in Jenkinsfile `options` section

## Continuous Deployment

To enable automatic deployment after successful builds:

1. Add deployment stage to Jenkinsfile
2. Configure deployment credentials in Jenkins
3. Add deployment scripts to project

Example deployment stage:
```groovy
stage('Deploy') {
    when {
        branch 'main'
    }
    steps {
        sh 'npm run deploy'
    }
}
```

## Monitoring

- Pipeline status: Check Jenkins dashboard
- Test results: View HTML reports in Jenkins
- Coverage: Check coverage reports for code coverage metrics
- Notifications: Email notifications sent on pipeline failures

## Best Practices

1. **Always run tests locally** before pushing code
2. **Keep test coverage above 80%** for critical paths
3. **Update tests** when adding new features
4. **Review test failures** before merging PRs
5. **Monitor pipeline performance** and optimize slow stages

## Support

For issues or questions about the CI/CD pipeline:
- Check Jenkins logs for detailed error messages
- Review test output in Jenkins console
- Contact DevOps team for Jenkins configuration issues


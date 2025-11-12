pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20'
        CI = 'true'
        NODE_ENV = 'test'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.GIT_BRANCH_NAME = sh(
                        script: 'git rev-parse --abbrev-ref HEAD',
                        returnStdout: true
                    ).trim()
                }
                echo "Building commit: ${env.GIT_COMMIT_SHORT} on branch: ${env.GIT_BRANCH_NAME}"
            }
        }
        
        stage('Setup Node.js') {
            steps {
                echo 'Setting up Node.js environment...'
                sh '''
                    # Check if Node.js is already available
                    if command -v node &> /dev/null; then
                        echo "Node.js is already installed:"
                        node --version
                        npm --version
                    else
                        echo "Node.js not found. Attempting to use nvm..."
                        
                        # Try to source nvm if it exists
                        export NVM_DIR="${HOME}/.nvm"
                        if [ -s "$NVM_DIR/nvm.sh" ]; then
                            . "$NVM_DIR/nvm.sh"
                            NODE_VERSION="${NODE_VERSION:-20}"
                            nvm use ${NODE_VERSION} || nvm install ${NODE_VERSION}
                            node --version
                            npm --version
                        else
                            echo "ERROR: Node.js is not installed and nvm is not available."
                            echo "Please install Node.js ${NODE_VERSION:-20} on the Jenkins agent."
                            exit 1
                        fi
                    fi
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing project dependencies...'
                sh '''
                    npm ci --prefer-offline --no-audit
                '''
            }
        }
        
        stage('Lint') {
            steps {
                echo 'Running ESLint...'
                sh '''
                    npm run lint || true
                '''
            }
            post {
                always {
                    script {
                        try {
                            if (fileExists('eslint-report.html')) {
                                publishHTML([
                                    reportDir: '.',
                                    reportFiles: 'eslint-report.html',
                                    reportName: 'ESLint Report',
                                    allowMissing: true
                                ])
                            }
                        } catch (Exception e) {
                            echo "HTML Publisher plugin not available: ${e.message}"
                            echo "ESLint report available at: eslint-report.html"
                        }
                    }
                }
            }
        }
        
        stage('Type Check') {
            steps {
                echo 'Running TypeScript type checking...'
                sh '''
                    npx tsc --noEmit || {
                        echo "TypeScript errors found"
                        exit 1
                    }
                '''
            }
        }
        
        stage('Unit Tests') {
            steps {
                echo 'Running unit tests...'
                sh '''
                    npm run test:unit -- --coverage --watchAll=false
                '''
            }
            post {
                always {
                    // Publish JUnit test results
                    junit(
                        testResults: 'test-results/jest/**/*.xml',
                        allowEmptyResults: true
                    )
                    // Publish coverage HTML report
                    script {
                        try {
                            if (fileExists('coverage/index.html')) {
                                publishHTML([
                                    reportDir: 'coverage',
                                    reportFiles: 'index.html',
                                    reportName: 'Jest Coverage Report',
                                    allowMissing: true
                                ])
                            }
                        } catch (Exception e) {
                            echo "HTML Publisher plugin not available: ${e.message}"
                            echo "Coverage report available at: coverage/index.html"
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building Next.js application...'
                sh '''
                    npm run build
                '''
            }
            post {
                success {
                    echo 'Build completed successfully'
                    archiveArtifacts artifacts: '.next/**/*', allowEmptyArchive: true
                }
                failure {
                    echo 'Build failed'
                }
            }
        }
        
        stage('E2E Tests') {
            steps {
                echo 'Setting up PostgreSQL database for E2E tests...'
                script {
                    // Check if Docker is available and start PostgreSQL
                    def dockerAvailable = sh(
                        script: 'command -v docker &> /dev/null && echo "yes" || echo "no"',
                        returnStdout: true
                    ).trim() == 'yes'
                    
                    if (!dockerAvailable) {
                        echo 'ERROR: Docker is not available. E2E tests require PostgreSQL container.'
                        echo 'To run E2E tests, install Docker on the Jenkins agent.'
                        error('Docker is required for E2E tests. Please install Docker on the Jenkins agent.')
                    }
                    
                    echo 'Docker is available. Starting PostgreSQL container...'
                    
                    // Stop and remove any existing test database container
                    sh '''
                        docker stop postgres-e2e-test 2>/dev/null || true
                        docker rm postgres-e2e-test 2>/dev/null || true
                    '''
                    
                    // Start PostgreSQL container
                    sh '''
                        docker run -d \\
                            --name postgres-e2e-test \\
                            -e POSTGRES_USER=testuser \\
                            -e POSTGRES_PASSWORD=testpass \\
                            -e POSTGRES_DB=softdev_solutions_test \\
                            -p 5432:5432 \\
                            --health-cmd="pg_isready -U testuser" \\
                            --health-interval=5s \\
                            --health-timeout=5s \\
                            --health-retries=10 \\
                            postgres:15-alpine
                    '''
                    
                    // Wait for PostgreSQL to be ready
                    echo 'Waiting for PostgreSQL to be ready...'
                    def pgReady = sh(
                        script: '''
                            timeout 60 bash -c 'until docker exec postgres-e2e-test pg_isready -U testuser; do sleep 2; done' && echo "ready" || echo "not_ready"
                        ''',
                        returnStdout: true
                    ).trim()
                    
                    if (pgReady != 'ready') {
                        echo 'ERROR: PostgreSQL failed to start within timeout'
                        sh 'docker logs postgres-e2e-test'
                        error('PostgreSQL container failed to start. E2E tests cannot proceed without database.')
                    }
                    
                    // Additional verification: Try to connect to the database
                    echo 'Verifying database connection...'
                    def connectionVerified = sh(
                        script: '''
                            timeout 30 bash -c 'until docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "SELECT 1;" > /dev/null 2>&1; do sleep 1; done' && echo "verified" || echo "not_verified"
                        ''',
                        returnStdout: true
                    ).trim()
                    
                    if (connectionVerified != 'verified') {
                        echo 'ERROR: Cannot connect to PostgreSQL database'
                        sh 'docker logs postgres-e2e-test --tail 50'
                        error('PostgreSQL database connection failed. E2E tests cannot proceed.')
                    }
                    
                    echo 'PostgreSQL is ready and accepting connections!'
                    
                    // Verify database is working
                    echo '=== Verifying PostgreSQL Database ==='
                    def dbVerification = sh(
                        script: '''
                            docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "SELECT version();" > /dev/null 2>&1 && echo "success" || echo "failed"
                        ''',
                        returnStdout: true
                    ).trim()
                    
                    if (dbVerification != 'success') {
                        echo 'ERROR: Failed to query database'
                        sh 'docker logs postgres-e2e-test --tail 50'
                        error('PostgreSQL database verification failed. E2E tests cannot proceed.')
                    }
                    
                    sh '''
                        # Check container health
                        docker inspect postgres-e2e-test --format='{{.State.Health.Status}}' || echo "Health check not available"
                        echo "✓ PostgreSQL database is working correctly"
                    '''
                    
                    env.DATABASE_URL = 'postgresql://testuser:testpass@localhost:5432/softdev_solutions_test'
                    env.DATABASE_AVAILABLE = 'true'
                    
                    // Give PostgreSQL a moment to fully initialize
                    sleep(time: 2, unit: 'SECONDS')
                    
                    echo '✓ PostgreSQL is running. Proceeding with E2E tests...'
                }
                
                echo 'Installing Playwright browsers...'
                sh '''
                    # Install Playwright browsers (required for E2E tests)
                    # Install chromium browser (used by default in Playwright)
                    npx playwright install chromium
                    
                    # Also install chromium headless shell if needed
                    npx playwright install chromium-headless-shell || true
                    
                    # Install additional browsers for cross-browser testing
                    npx playwright install firefox
                    npx playwright install webkit
                    
                    # Install mobile browsers (mobile Chrome and mobile Safari)
                    # Mobile Safari is included with webkit, mobile Chrome with chromium
                    # But we can also install all mobile browsers explicitly
                    npx playwright install || true
                    
                    echo "Playwright browsers installation completed"
                '''
                
                echo 'Running end-to-end tests...'
                script {
                    // PostgreSQL is guaranteed to be running at this point (stage would have failed otherwise)
                    echo "Running E2E tests with PostgreSQL database..."
                    echo "DATABASE_URL: ${env.DATABASE_URL}"
                    
                    // Final verification before tests (safety check)
                    echo '=== Pre-Test Database Verification ==='
                    def preTestCheck = sh(
                        script: '''
                            # Verify container is still running
                            if ! docker ps | grep -q postgres-e2e-test; then
                                echo "not_running"
                                exit 0
                            fi
                            
                            # Test connection one more time
                            docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "SELECT 1;" > /dev/null 2>&1 && echo "ready" || echo "not_ready"
                        ''',
                        returnStdout: true
                    ).trim()
                    
                    if (preTestCheck != 'ready') {
                        echo "ERROR: PostgreSQL container check failed: ${preTestCheck}"
                        sh 'docker ps -a | grep postgres-e2e-test || echo "Container not found"'
                        sh 'docker logs postgres-e2e-test --tail 50 2>/dev/null || echo "Cannot get logs"'
                        error('PostgreSQL container is not ready for E2E tests. Tests cannot proceed.')
                    }
                    
                    echo "✓ Database verified and ready for tests"
                    
                    sh '''
                        # Playwright will automatically start the server using webServer config
                        # Set base URL for tests
                        export PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
                        
                        # DATABASE_URL is guaranteed to be set (stage would have failed otherwise)
                        export DATABASE_URL="${DATABASE_URL}"
                        echo "DATABASE_URL exported for Playwright: ${DATABASE_URL}"
                        
                        # Run E2E tests (Playwright handles server lifecycle)
                        # DATABASE_URL will be available to the webServer process via playwright.config.ts
                        npm run test:e2e
                    '''
                }
            }
            post {
                always {
                    // Cleanup PostgreSQL container
                    script {
                        sh '''
                            # Stop and remove PostgreSQL test container
                            if docker ps -a --format "{{.Names}}" | grep -q "^postgres-e2e-test$"; then
                                echo "Cleaning up PostgreSQL test container..."
                                docker stop postgres-e2e-test 2>/dev/null || true
                                docker rm postgres-e2e-test 2>/dev/null || true
                                echo "PostgreSQL container cleaned up"
                            fi
                        '''
                    }
                    
                    // Publish JUnit test results
                    junit(
                        testResults: 'test-results/e2e/**/*.xml',
                        allowEmptyResults: true
                    )
                    script {
                        try {
                            if (fileExists('playwright-report/index.html')) {
                                publishHTML([
                                    reportDir: 'playwright-report',
                                    reportFiles: 'index.html',
                                    reportName: 'Playwright E2E Test Report',
                                    allowMissing: true
                                ])
                            }
                        } catch (Exception e) {
                            echo "HTML Publisher plugin not available: ${e.message}"
                            echo "Playwright report available at: playwright-report/index.html"
                        }
                    }
                    // Archive screenshots and videos from failed tests
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo 'Running security audit...'
                sh '''
                    npm audit --audit-level=moderate || true
                '''
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution completed'
            // Clean workspace but preserve important artifacts
            script {
                // Keep artifacts, clean temporary files
                sh '''
                    # Clean temporary files but keep build artifacts
                    find . -type f -name "*.log" -delete 2>/dev/null || true
                    find . -type d -name ".cache" -exec rm -rf {} + 2>/dev/null || true
                '''
            }
        }
        success {
            echo 'Pipeline succeeded! ✅'
            script {
                if (env.GIT_BRANCH_NAME == 'main' || env.GIT_BRANCH_NAME == 'master') {
                    echo 'Main branch build succeeded - ready for deployment'
                }
            }
        }
        failure {
            echo 'Pipeline failed! ❌'
            echo "Pipeline failed details:"
            echo "  - Branch: ${env.GIT_BRANCH_NAME}"
            echo "  - Commit: ${env.GIT_COMMIT_SHORT}"
            echo "  - Build: ${env.BUILD_URL}"
            echo "  - Job: ${env.JOB_NAME}"
            echo "  - Build Number: ${env.BUILD_NUMBER}"
            // Email notifications can be configured via Jenkins notification plugins if needed
        }
        unstable {
            echo 'Pipeline is unstable ⚠️'
        }
    }
}


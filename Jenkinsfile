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
                    // Check if PostgreSQL is available
                    def pgAvailable = sh(
                        script: 'command -v psql &> /dev/null && echo "yes" || echo "no"',
                        returnStdout: true
                    ).trim() == 'yes'
                    
                    if (!pgAvailable) {
                        echo 'WARNING: PostgreSQL client (psql) not found. Attempting to use local PostgreSQL...'
                    }
                    
                    // Test PostgreSQL connection
                    echo 'Testing PostgreSQL connection...'
                    def connectionTest = sh(
                        script: '''
                            PGPASSWORD=Sylaw1970 psql -h localhost -U postgres -d postgres -c "SELECT version();" > /dev/null 2>&1 && echo "connected" || echo "not_connected"
                        ''',
                        returnStdout: true
                    ).trim()
                    
                    if (connectionTest != 'connected') {
                        echo 'WARNING: Cannot connect to local PostgreSQL database'
                        echo 'Please ensure PostgreSQL is running with:'
                        echo '  - Database: postgres'
                        echo '  - User: postgres'
                        echo '  - Password: Sylaw1970'
                        echo '  - Host: localhost'
                        echo '  - Port: 5432'
                    } else {
                        echo '✓ PostgreSQL connection verified'
                    }
                    
                    // Set DATABASE_URL for E2E tests
                    // Note: Port may be 5432 or 5433 depending on PostgreSQL installation
                    env.DATABASE_URL = 'postgresql://postgres:Sylaw1970@localhost:5433/postgres'
                    echo "DATABASE_URL set to: ${env.DATABASE_URL}"
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
                    echo "Running E2E tests with PostgreSQL database..."
                    echo "Database: postgres"
                    echo "User: postgres"
                    echo "Host: localhost:5432"
                    
                    sh '''
                        # Playwright will automatically start the server using webServer config
                        # Set base URL for tests
                        export PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
                        
                        # Export DATABASE_URL for the application
                        export DATABASE_URL="${DATABASE_URL}"
                        echo "DATABASE_URL exported: ${DATABASE_URL}"
                        
                        # Run E2E tests (Playwright handles server lifecycle)
                        # DATABASE_URL will be available to the webServer process
                        npm run test:e2e
                    '''
                }
            }
            post {
                always {
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
            // Send success email notification
            echo 'Sending success email notification...'
            mail (
                to: "groklord2@gmail.com",
                subject: "✅ Build Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Build Successful! ✅

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Commit: ${env.GIT_COMMIT_SHORT}
Duration: ${currentBuild.durationString}
Status: SUCCESS

Build Stages Completed:
  ✓ Checkout
  ✓ Setup Node.js
  ✓ Install Dependencies
  ✓ Lint
  ✓ Unit Tests
  ✓ Build
  ✓ E2E Tests
  ✓ Security Scan

View Build Details: ${env.BUILD_URL}
View Console Output: ${env.BUILD_URL}console
                """
            )
            echo 'Success email notification sent'
        }
        failure {
            echo 'Pipeline failed! ❌'
            echo "Pipeline failed details:"
            echo "  - Branch: ${env.GIT_BRANCH_NAME}"
            echo "  - Commit: ${env.GIT_COMMIT_SHORT}"
            echo "  - Build: ${env.BUILD_URL}"
            echo "  - Job: ${env.JOB_NAME}"
            echo "  - Build Number: ${env.BUILD_NUMBER}"
            // Send failure email notification
            echo 'Sending failure email notification...'
            mail (
                to: "groklord2@gmail.com",
                subject: "❌ Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Build Failed! ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Commit: ${env.GIT_COMMIT_SHORT}
Duration: ${currentBuild.durationString}
Status: FAILED

Failed Stage:
Check console output for detailed error information.

View Build Details: ${env.BUILD_URL}
View Console Output: ${env.BUILD_URL}console
View Test Results: ${env.BUILD_URL}testReport
                """
            )
            echo 'Failure email notification sent'
        }
        unstable {
            echo 'Pipeline is unstable ⚠️'
            // Send unstable email notification
            echo 'Sending unstable email notification...'
            mail (
                to: "groklord2@gmail.com",
                subject: "⚠️ Build Unstable: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Build Unstable ⚠️

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Commit: ${env.GIT_COMMIT_SHORT}
Duration: ${currentBuild.durationString}
Status: UNSTABLE

Build completed but some tests failed or warnings were generated.

View Build Details: ${env.BUILD_URL}
View Test Results: ${env.BUILD_URL}testReport
                """
            )
            echo 'Unstable email notification sent'
        }
    }
}


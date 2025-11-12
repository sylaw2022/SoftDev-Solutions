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
                        if (fileExists('eslint-report.html')) {
                            publishHTML([
                                reportDir: '.',
                                reportFiles: 'eslint-report.html',
                                reportName: 'ESLint Report',
                                allowMissing: true
                            ])
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
                        testResultsPattern: 'test-results/jest/**/*.xml',
                        allowEmptyResults: true
                    )
                    // Publish coverage HTML report
                    script {
                        if (fileExists('coverage/index.html')) {
                            publishHTML([
                                reportDir: 'coverage',
                                reportFiles: 'index.html',
                                reportName: 'Jest Coverage Report',
                                allowMissing: true
                            ])
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
                echo 'Running end-to-end tests...'
                sh '''
                    # Playwright will automatically start the server using webServer config
                    # Set base URL for tests
                    export PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
                    
                    # Run E2E tests (Playwright handles server lifecycle)
                    npm run test:e2e
                '''
            }
            post {
                always {
                    // Publish JUnit test results
                    junit(
                        testResultsPattern: 'test-results/e2e/**/*.xml',
                        allowEmptyResults: true
                    )
                    script {
                        if (fileExists('playwright-report/index.html')) {
                            publishHTML([
                                reportDir: 'playwright-report',
                                reportFiles: 'index.html',
                                reportName: 'Playwright E2E Test Report',
                                allowMissing: true
                            ])
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
            script {
                try {
                    // Try to send email notification if mail plugin is available
                    def recipient = env.CHANGE_AUTHOR_EMAIL ?: 'devops@softdev-solutions.com'
                    mail(
                        to: recipient,
                        subject: "Pipeline Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                        body: """
                            Pipeline execution failed for:
                            - Branch: ${env.GIT_BRANCH_NAME}
                            - Commit: ${env.GIT_COMMIT_SHORT}
                            - Build: ${env.BUILD_URL}
                        """
                    )
                } catch (Exception e) {
                    echo "Email notification not available: ${e.message}"
                    echo "Pipeline failed details:"
                    echo "  - Branch: ${env.GIT_BRANCH_NAME}"
                    echo "  - Commit: ${env.GIT_COMMIT_SHORT}"
                    echo "  - Build: ${env.BUILD_URL}"
                }
            }
        }
        unstable {
            echo 'Pipeline is unstable ⚠️'
        }
    }
}


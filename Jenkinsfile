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
        ansiColor('xterm')
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
                    node --version || echo "Node.js not found, installing..."
                    npm --version || echo "npm not found, installing..."
                '''
                script {
                    // Use Node.js version from environment or default
                    def nodeVersion = env.NODE_VERSION ?: '20'
                    sh """
                        if ! command -v nvm &> /dev/null; then
                            export NVM_DIR="\${HOME}/.nvm"
                            [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
                        fi
                        nvm use ${nodeVersion} || nvm install ${nodeVersion}
                        node --version
                        npm --version
                    """
                }
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
                    publishHTML([
                        reportDir: '.',
                        reportFiles: 'eslint-report.html',
                        reportName: 'ESLint Report',
                        allowMissing: true
                    ])
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
                    publishTestResults(
                        testResultsPattern: 'test-results/jest/**/*.xml',
                        allowEmptyResults: true
                    )
                    publishCoverage(
                        adapters: [
                            jestCoverageAdapter(
                                path: 'coverage/coverage-final.json'
                            )
                        ],
                        sourceFileResolver: sourceFiles('STORE_ALL_BUILD')
                    )
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
                    publishTestResults(
                        testResultsPattern: 'test-results/e2e/**/*.xml',
                        allowEmptyResults: true
                    )
                    publishHTML([
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright E2E Test Report',
                        allowMissing: true
                    ])
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
            cleanWs(
                deleteDirs: true,
                patterns: [
                    [pattern: '.next/**', type: 'EXCLUDE'],
                    [pattern: 'node_modules/**', type: 'EXCLUDE'],
                    [pattern: 'coverage/**', type: 'EXCLUDE'],
                    [pattern: 'test-results/**', type: 'EXCLUDE']
                ]
            )
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
            emailext(
                subject: "Pipeline Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
                    Pipeline execution failed for:
                    - Branch: ${env.GIT_BRANCH_NAME}
                    - Commit: ${env.GIT_COMMIT_SHORT}
                    - Build: ${env.BUILD_URL}
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL ?: 'devops@softdev-solutions.com'}"
            )
        }
        unstable {
            echo 'Pipeline is unstable ⚠️'
        }
    }
}


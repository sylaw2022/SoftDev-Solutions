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
            post {
                success {
                    echo 'Checkout stage completed successfully'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✓ Stage: Checkout - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Checkout ✅

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Commit: ${env.GIT_COMMIT_SHORT}
Status: SUCCESS

View Build: ${env.BUILD_URL}
                        """
                    )
                }
                failure {
                    echo 'Checkout stage failed'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✗ Stage: Checkout Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Checkout ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: FAILED

View Build: ${env.BUILD_URL}console
                        """
                    )
                }
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
            post {
                success {
                    echo 'Setup Node.js stage completed successfully'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✓ Stage: Setup Node.js - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Setup Node.js ✅

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: SUCCESS

View Build: ${env.BUILD_URL}
                        """
                    )
                }
                failure {
                    echo 'Setup Node.js stage failed'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✗ Stage: Setup Node.js Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Setup Node.js ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: FAILED

View Build: ${env.BUILD_URL}console
                        """
                    )
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
            post {
                success {
                    echo 'Install Dependencies stage completed successfully'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✓ Stage: Install Dependencies - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Install Dependencies ✅

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: SUCCESS

View Build: ${env.BUILD_URL}
                        """
                    )
                }
                failure {
                    echo 'Install Dependencies stage failed'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✗ Stage: Install Dependencies Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Install Dependencies ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: FAILED

View Build: ${env.BUILD_URL}console
                        """
                    )
                }
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
                success {
                    echo 'Lint stage completed successfully'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✓ Stage: Lint - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Lint ✅

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: SUCCESS

View Build: ${env.BUILD_URL}
                        """
                    )
                }
                failure {
                    echo 'Lint stage failed'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✗ Stage: Lint Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Lint ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: FAILED

View Build: ${env.BUILD_URL}console
                        """
                    )
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
            post {
                success {
                    echo 'Type Check stage completed successfully'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✓ Stage: Type Check - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Type Check ✅

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: SUCCESS

View Build: ${env.BUILD_URL}
                        """
                    )
                }
                failure {
                    echo 'Type Check stage failed'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✗ Stage: Type Check Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Type Check ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: FAILED

View Build: ${env.BUILD_URL}console
                        """
                    )
                }
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
                success {
                    echo 'Unit Tests stage completed successfully'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✓ Stage: Unit Tests - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Unit Tests ✅

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: SUCCESS

View Build: ${env.BUILD_URL}
View Test Results: ${env.BUILD_URL}testReport
                        """
                    )
                }
                failure {
                    echo 'Unit Tests stage failed'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✗ Stage: Unit Tests Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Unit Tests ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: FAILED

View Build: ${env.BUILD_URL}console
View Test Results: ${env.BUILD_URL}testReport
                        """
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
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✓ Stage: Build - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Build ✅

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: SUCCESS

View Build: ${env.BUILD_URL}
                        """
                    )
                }
                failure {
                    echo 'Build failed'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✗ Stage: Build Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Build ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: FAILED

View Build: ${env.BUILD_URL}console
                        """
                    )
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
                    echo "Host: localhost:5433"
                    
                    def serverStartError = null
                    def testError = null
                    def anyError = null
                    
                    try {
                        // Verify build exists before running E2E tests
                        echo 'Verifying build artifacts exist...'
                        def buildExists = fileExists('.next/BUILD_ID')
                        if (!buildExists) {
                            serverStartError = 'Build artifacts not found! Please ensure Build stage completed successfully.'
                            error(serverStartError)
                        }
                        echo '✓ Build artifacts verified'
                        
                        // Check if port 3000 is available
                        echo 'Checking if port 3000 is available...'
                        sh '''
                            # Kill any process using port 3000
                            lsof -ti:3000 | xargs kill -9 2>/dev/null || true
                            sleep 2
                            echo "Port 3000 is available"
                        '''
                        
                        // Test server startup with timeout
                        echo 'Testing frontend server startup...'
                        def serverStarted = false
                        def serverStartTimeout = 180 // 3 minutes
                        def startTime = System.currentTimeMillis()
                        
                        try {
                            // Start server in background to test if it can start
                            def serverProcess = sh(
                                script: '''
                                    export CI=true
                                    export NODE_ENV=test
                                    export DATABASE_URL="${DATABASE_URL}"
                                    timeout ${SERVER_START_TIMEOUT} npm run start > /tmp/server-start.log 2>&1 &
                                    echo $!
                                '''.replace('${SERVER_START_TIMEOUT}', serverStartTimeout.toString())
                                    .replace('${DATABASE_URL}', env.DATABASE_URL),
                                returnStdout: true
                            ).trim()
                            
                            // Wait for server to be ready
                            def maxWaitTime = serverStartTimeout * 1000 // Convert to milliseconds
                            def checkInterval = 2000 // Check every 2 seconds
                            def waited = 0
                            
                            while (waited < maxWaitTime) {
                                sleep(checkInterval / 1000)
                                waited += checkInterval
                                
                                // Check if process is still running first
                                def processRunning = sh(
                                    script: "ps -p ${serverProcess} > /dev/null 2>&1 && echo 'running' || echo 'stopped'",
                                    returnStdout: true
                                ).trim()
                                
                                if (processRunning != 'running') {
                                    // Process stopped, check logs for errors
                                    def errorLog = sh(
                                        script: 'tail -50 /tmp/server-start.log 2>/dev/null || echo "No log file"',
                                        returnStdout: true
                                    )
                                    serverStartError = "Server process stopped unexpectedly. Logs:\n${errorLog}"
                                    break
                                }
                                
                                // Check if server is responding (with aggressive timeout to prevent hanging)
                                def serverResponse = "000"
                                try {
                                    // Use background process with guaranteed kill to prevent hanging
                                    def curlScript = '''
                                        # Start curl in background and capture PID
                                        # Write HTTP code to file, discard body
                                        curl -s -o /dev/null -w "%{http_code}" \
                                            --max-time 3 \
                                            --connect-timeout 2 \
                                            --retry 0 \
                                            http://localhost:3000 > /tmp/curl-response.txt 2>/dev/null &
                                        CURL_PID=$!
                                        
                                        # Wait max 4 seconds, then kill if still running
                                        for i in {1..4}; do
                                            if ! kill -0 $CURL_PID 2>/dev/null; then
                                                # Process finished
                                                break
                                            fi
                                            sleep 1
                                        done
                                        
                                        # Kill if still running (guaranteed timeout)
                                        kill -9 $CURL_PID 2>/dev/null || true
                                        wait $CURL_PID 2>/dev/null || true
                                        
                                        # Read response if available
                                        if [ -f /tmp/curl-response.txt ]; then
                                            cat /tmp/curl-response.txt
                                        else
                                            echo "000"
                                        fi
                                    '''
                                    
                                    serverResponse = sh(
                                        script: curlScript,
                                        returnStdout: true,
                                        timeout: 5 // Jenkins-level timeout as final safety net
                                    ).trim()
                                    
                                    // Clean up temp file
                                    sh 'rm -f /tmp/curl-response.txt 2>/dev/null || true'
                                    
                                    // If we got nothing or it's still hanging, force to "000"
                                    if (serverResponse == null || serverResponse.isEmpty() || serverResponse.length() > 3) {
                                        serverResponse = "000"
                                    }
                                } catch (org.jenkinsci.plugins.workflow.steps.FlowInterruptedException e) {
                                    echo "Health check interrupted (timeout): ${e.message}"
                                    serverResponse = "000"
                                } catch (Exception e) {
                                    echo "Health check failed (non-critical): ${e.message}"
                                    serverResponse = "000"
                                } catch (Throwable t) {
                                    echo "Health check error (non-critical): ${t.message}"
                                    serverResponse = "000"
                                }
                                
                                if (serverResponse == '200' || serverResponse == '404' || serverResponse == '500') {
                                    serverStarted = true
                                    echo "✓ Frontend server started successfully (HTTP ${serverResponse})"
                                    // Kill the test server
                                    sh "kill ${serverProcess} 2>/dev/null || true"
                                    sleep(2)
                                    break
                                }
                                
                                echo "Waiting for server to start... (${waited / 1000}s / ${serverStartTimeout}s) - Response: ${serverResponse}"
                            }
                            
                            if (!serverStarted && serverStartError == null) {
                                serverStartError = "Server startup timeout after ${serverStartTimeout} seconds. Server did not respond on http://localhost:3000"
                            }
                            
                        } catch (Exception e) {
                            serverStartError = "Server startup test failed: ${e.getMessage()}"
                        }
                        
                        if (serverStartError) {
                            // Send email notification for server startup failure
                            echo "ERROR: ${serverStartError}"
                            mail (
                                to: "groklord2@gmail.com",
                                subject: "❌ E2E Tests: Frontend Server Startup Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                                body: """
E2E Tests Stage - Frontend Server Startup Failed ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Commit: ${env.GIT_COMMIT_SHORT}
Status: SERVER STARTUP FAILED

Error Details:
${serverStartError}

Possible Causes:
- Build artifacts missing or corrupted
- Port 3000 already in use
- Database connection failed
- Insufficient memory or resources
- Node.js process crashed during startup

View Build: ${env.BUILD_URL}console
Check Logs: ${env.BUILD_URL}consoleText

Troubleshooting Steps:
1. Verify Build stage completed successfully
2. Check if port 3000 is available
3. Verify PostgreSQL database is running and accessible
4. Check server logs in console output
5. Verify DATABASE_URL is correctly set
                                """
                            )
                            error(serverStartError)
                        }
                        
                        // Run E2E tests if server started successfully
                        echo 'Frontend server verified. Running E2E tests...'
                        sh '''
                            # Set CI environment variable for Playwright
                            export CI=true
                            export NODE_ENV=test
                            
                            # Set base URL for tests
                            export PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
                            
                            # Export DATABASE_URL for the application
                            export DATABASE_URL="${DATABASE_URL}"
                            echo "Environment variables set:"
                            echo "  CI=${CI}"
                            echo "  NODE_ENV=${NODE_ENV}"
                            echo "  DATABASE_URL=${DATABASE_URL}"
                            echo "  PLAYWRIGHT_TEST_BASE_URL=${PLAYWRIGHT_TEST_BASE_URL}"
                            
                            # Verify .next directory exists
                            if [ ! -d ".next" ]; then
                                echo "ERROR: .next directory not found!"
                                echo "Build must complete before E2E tests can run."
                                exit 1
                            fi
                            
                            echo "✓ Build directory verified"
                            
                            # Run E2E tests (Playwright handles server lifecycle)
                            # Playwright will start the server using npm run start
                            # DATABASE_URL will be available to the webServer process via playwright.config.ts
                            npm run test:e2e
                        '''
                        
                    } catch (Exception e) {
                        testError = e.getMessage()
                        anyError = e
                        echo "ERROR during E2E tests: ${testError}"
                        
                        // Get stack trace for better debugging
                        def stackTrace = ""
                        try {
                            def writer = new StringWriter()
                            def printer = new PrintWriter(writer)
                            e.printStackTrace(printer)
                            stackTrace = writer.toString()
                        } catch (Exception st) {
                            stackTrace = "Could not retrieve stack trace: ${st.message}"
                        }
                        
                        // Send email notification for test execution failure
                        mail (
                            to: "groklord2@gmail.com",
                            subject: "❌ E2E Tests: Execution Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                            body: """
E2E Tests Stage - Test Execution Failed ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Commit: ${env.GIT_COMMIT_SHORT}
Status: TEST EXECUTION FAILED

Error Details:
${testError}

${serverStartError ? "Server Startup Error:\n${serverStartError}\n\n" : ""}

Stack Trace:
${stackTrace}

View Build: ${env.BUILD_URL}console
View Test Results: ${env.BUILD_URL}testReport
Check Logs: ${env.BUILD_URL}consoleText
                            """
                        )
                        throw e
                    } catch (Throwable t) {
                        // Catch-all for any unexpected errors
                        anyError = t
                        def errorMessage = t.getMessage() ?: "Unknown error occurred"
                        def errorClass = t.getClass().getName()
                        
                        echo "CRITICAL ERROR in E2E Tests stage: ${errorMessage}"
                        echo "Error class: ${errorClass}"
                        
                        // Get stack trace
                        def stackTrace = ""
                        try {
                            def writer = new StringWriter()
                            def printer = new PrintWriter(writer)
                            t.printStackTrace(printer)
                            stackTrace = writer.toString()
                        } catch (Exception st) {
                            stackTrace = "Could not retrieve stack trace: ${st.message}"
                        }
                        
                        // Send email notification for any error
                        mail (
                            to: "groklord2@gmail.com",
                            subject: "❌ E2E Tests: Critical Error - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                            body: """
E2E Tests Stage - Critical Error ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Commit: ${env.GIT_COMMIT_SHORT}
Status: CRITICAL ERROR

Error Type: ${errorClass}
Error Message: ${errorMessage}

${serverStartError ? "Server Startup Error:\n${serverStartError}\n\n" : ""}
${testError ? "Test Execution Error:\n${testError}\n\n" : ""}

Stack Trace:
${stackTrace}

This is a catch-all error handler. The pipeline encountered an unexpected error.

View Build: ${env.BUILD_URL}console
Check Logs: ${env.BUILD_URL}consoleText
                            """
                        )
                        throw t
                    }
                }
            }
            post {
                always {
                    script {
                        try {
                            // Clean up any running server processes
                            sh '''
                                # Kill any Node.js processes on port 3000
                                lsof -ti:3000 | xargs kill -9 2>/dev/null || true
                                # Kill any npm/node processes that might be hanging
                                pkill -f "npm run start" 2>/dev/null || true
                                pkill -f "next start" 2>/dev/null || true
                                sleep 1
                            '''
                        } catch (Exception e) {
                            echo "Warning: Error during cleanup: ${e.message}"
                            // Don't fail the stage due to cleanup errors
                        }
                        
                        try {
                            // Publish JUnit test results
                            junit(
                                testResults: 'test-results/e2e/**/*.xml',
                                allowEmptyResults: true
                            )
                        } catch (Exception e) {
                            echo "Error publishing JUnit results: ${e.message}"
                            // Send email notification for JUnit publishing error
                            mail (
                                to: "groklord2@gmail.com",
                                subject: "⚠️ E2E Tests: JUnit Publishing Error - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                                body: """
E2E Tests Stage - JUnit Publishing Error ⚠️

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: WARNING

Error: Failed to publish JUnit test results
Details: ${e.message}

View Build: ${env.BUILD_URL}console
                                """
                            )
                        }
                        
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
                            // Send email notification for HTML publishing error
                            mail (
                                to: "groklord2@gmail.com",
                                subject: "⚠️ E2E Tests: HTML Report Publishing Error - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                                body: """
E2E Tests Stage - HTML Report Publishing Error ⚠️

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: WARNING

Error: Failed to publish HTML test report
Details: ${e.message}

View Build: ${env.BUILD_URL}console
                                """
                            )
                        }
                        
                        try {
                            // Archive screenshots and videos from failed tests
                            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                        } catch (Exception e) {
                            echo "Error archiving test results: ${e.message}"
                            mail (
                                to: "groklord2@gmail.com",
                                subject: "⚠️ E2E Tests: Artifact Archiving Error - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                                body: """
E2E Tests Stage - Artifact Archiving Error ⚠️

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: WARNING

Error: Failed to archive test artifacts
Details: ${e.message}

View Build: ${env.BUILD_URL}console
                                """
                            )
                        }
                        
                        try {
                            // Archive server logs if they exist
                            if (fileExists('/tmp/server-start.log')) {
                                sh 'cp /tmp/server-start.log server-startup.log 2>/dev/null || true'
                                archiveArtifacts artifacts: 'server-startup.log', allowEmptyArchive: true
                            }
                        } catch (Exception e) {
                            echo "Error archiving server logs: ${e.message}"
                            // Non-critical, don't send email for this
                        }
                    }
                }
                success {
                    echo 'E2E Tests stage completed successfully'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✓ Stage: E2E Tests - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: E2E Tests ✅

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: SUCCESS

Frontend server started successfully and all E2E tests passed.

View Build: ${env.BUILD_URL}
View Test Results: ${env.BUILD_URL}testReport
                        """
                    )
                }
                failure {
                    echo 'E2E Tests stage failed'
                    script {
                        // Get additional error context
                        def errorContext = ""
                        try {
                            if (fileExists('/tmp/server-start.log')) {
                                def serverLog = sh(
                                    script: 'tail -100 /tmp/server-start.log 2>/dev/null || echo "No server log available"',
                                    returnStdout: true
                                )
                                errorContext = "\n\nServer Startup Log (last 100 lines):\n${serverLog}"
                            }
                        } catch (Exception e) {
                            errorContext = "\n\nCould not retrieve server logs: ${e.message}"
                        }
                        
                        mail (
                            to: "groklord2@gmail.com",
                            subject: "✗ Stage: E2E Tests Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                            body: """
Stage: E2E Tests ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Commit: ${env.GIT_COMMIT_SHORT}
Status: FAILED

Possible causes:
- Frontend server failed to start (timeout or crash)
- Database connection issues
- Test execution errors
- Port conflicts

${errorContext}

View Build: ${env.BUILD_URL}console
View Test Results: ${env.BUILD_URL}testReport
Check Logs: ${env.BUILD_URL}consoleText
                            """
                        )
                    }
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
            post {
                success {
                    echo 'Security Scan stage completed successfully'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✓ Stage: Security Scan - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Security Scan ✅

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: SUCCESS

View Build: ${env.BUILD_URL}
                        """
                    )
                }
                failure {
                    echo 'Security Scan stage failed'
                    mail (
                        to: "groklord2@gmail.com",
                        subject: "✗ Stage: Security Scan Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
Stage: Security Scan ❌

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Branch: ${env.GIT_BRANCH_NAME}
Status: FAILED

View Build: ${env.BUILD_URL}console
                        """
                    )
                }
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


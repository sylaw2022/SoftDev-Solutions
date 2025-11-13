# SonarQube Local Server Setup and Jenkins Configuration

This guide explains how to set up a local SonarQube server and configure Jenkins to perform code quality analysis.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installing SonarQube Server](#installing-sonarqube-server)
3. [Starting SonarQube Server](#starting-sonarqube-server)
4. [Initial SonarQube Configuration](#initial-sonarqube-configuration)
5. [Creating a SonarQube Project and Token](#creating-a-sonarqube-project-and-token)
6. [Jenkins Configuration](#jenkins-configuration)
7. [Jenkinsfile Configuration](#jenkinsfile-configuration)
8. [Running SonarQube Analysis](#running-sonarqube-analysis)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Java 11 or higher (required for SonarQube server)
- Docker (optional, for containerized installation)
- Jenkins with appropriate permissions
- Node.js and npm (for running the scanner)

### Check Java Version

```bash
java -version
```

If Java is not installed:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk

# Verify installation
java -version
```

## Installing SonarQube Server

### Option 1: Using Docker (Recommended)

```bash
# Pull SonarQube Docker image
docker pull sonarqube:community

# Run SonarQube container
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  -p 9092:9092 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community
```

**Note:** The `SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true` environment variable is required for systems with limited resources or when running in Docker.

### Option 2: Manual Installation

1. **Download SonarQube Community Edition:**
   ```bash
   cd /opt
   sudo wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.3.0.82913.zip
   sudo unzip sonarqube-10.3.0.82913.zip
   sudo mv sonarqube-10.3.0.82913 sonarqube
   sudo chown -R $USER:$USER /opt/sonarqube
   ```

2. **Configure System Limits (if needed):**
   ```bash
   # Edit /etc/security/limits.conf
   sudo nano /etc/security/limits.conf
   
   # Add these lines:
   sonarqube   -   nofile   65536
   sonarqube   -   nproc    4096
   ```

3. **Configure vm.max_map_count:**
   ```bash
   # Check current value
   sysctl vm.max_map_count
   
   # Set to required value (if needed)
   sudo sysctl -w vm.max_map_count=262144
   
   # Make permanent
   echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
   ```

## Starting SonarQube Server

### Docker Method

```bash
# Start container
docker start sonarqube

# Check status
docker ps | grep sonarqube

# View logs
docker logs sonarqube

# Stop container
docker stop sonarqube
```

### Manual Method

```bash
# Start SonarQube
cd /opt/sonarqube
./bin/linux-x86-64/sonar.sh start

# Check status
./bin/linux-x86-64/sonar.sh status

# View logs
tail -f logs/sonar.log

# Stop SonarQube
./bin/linux-x86-64/sonar.sh stop
```

### Verify SonarQube is Running

1. **Check if server is accessible:**
   ```bash
   curl http://localhost:9000
   ```

2. **Open in browser:**
   Navigate to: `http://localhost:9000`

3. **Check server status:**
   ```bash
   # Using API
   curl http://localhost:9000/api/system/status
   ```

   Expected response:
   ```json
   {
     "id": "20231109123456",
     "version": "10.3.0",
     "status": "UP"
   }
   ```

## Initial SonarQube Configuration

### First Login

1. Open `http://localhost:9000` in your browser
2. Default credentials:
   - **Username:** `admin`
   - **Password:** `admin`
3. You'll be prompted to change the password (recommended)

### Configure SonarQube Settings

1. **Navigate to Administration → Configuration**
2. **Set Base URL** (if needed):
   - Go to: Administration → Configuration → General Settings → Server base URL
   - Set to: `http://localhost:9000` (or your server URL)

3. **Configure Analysis Settings** (optional):
   - Go to: Administration → Configuration → Analysis → General
   - Adjust settings as needed

## Creating a SonarQube Project and Token

### Create a Project

1. **Log in to SonarQube** at `http://localhost:9000`
2. **Navigate to:** Projects → Create Project
3. **Select:** "Manually"
4. **Enter Project Details:**
   - **Project Key:** `software-services-website`
   - **Display Name:** `Software Services Website`
5. **Click:** "Set Up"

### Generate an Authentication Token

1. **Navigate to:** My Account → Security
2. **Enter Token Name:** `jenkins-token` (or any descriptive name)
3. **Select Expiration:** Choose expiration date (or leave blank for no expiration)
4. **Click:** "Generate"
5. **Copy the token immediately** (you won't be able to see it again!)

   Example token format: `sqa_f83946ac33801801b6e07535650cd1148e9e9317`

6. **Save the token securely** - you'll need it for Jenkins configuration

## Jenkins Configuration

### 1. Install SonarQube Scanner (Optional)

If you want to use an installed scanner instead of `npx`:

```bash
# On Jenkins agent
cd /opt
sudo wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
sudo unzip sonar-scanner-cli-5.0.1.3006-linux.zip
sudo mv sonar-scanner-5.0.1.3006-linux sonar-scanner
sudo chown -R jenkins:jenkins /opt/sonar-scanner

# Add to PATH (in Jenkins agent environment)
export PATH=$PATH:/opt/sonar-scanner/bin
```

**Note:** The Jenkinsfile is configured to use `npx sonarqube-scanner` by default, so this step is optional.

### 2. Configure Jenkins Credentials

1. **Open Jenkins Dashboard**
2. **Navigate to:** Manage Jenkins → Credentials
3. **Select:** System → Global credentials
4. **Click:** "Add Credentials"
5. **Configure:**
   - **Kind:** Secret text
   - **Secret:** Paste your SonarQube token (e.g., `sqa_f83946ac33801801b6e07535650cd1148e9e9317`)
   - **ID:** `sonar-token` (must match exactly)
   - **Description:** `SonarQube Authentication Token`
6. **Click:** "Create"

### 3. Configure Jenkins Environment Variables (Optional)

1. **Navigate to:** Manage Jenkins → Configure System
2. **Find:** Global properties → Environment variables
3. **Add:**
   - **Name:** `SONAR_HOST_URL`
   - **Value:** `http://localhost:9000` (or your SonarQube server URL)
4. **Save**

**Note:** The Jenkinsfile has a default value, so this is optional.

## Jenkinsfile Configuration

The Jenkinsfile is already configured with SonarQube integration. Here's what it does:

### SonarQube Analysis Stage

Located in the `SonarQube Analysis` stage (after Build stage):

```groovy
stage('SonarQube Analysis') {
    steps {
        script {
            // 1. Checks for coverage report
            // 2. Checks for JUnit test results
            // 3. Verifies credentials exist
            // 4. Runs SonarQube analysis using npx sonarqube-scanner
            // 5. Falls back to installed sonar-scanner if npx fails
        }
    }
}
```

### Key Features

1. **Automatic Scanner Detection:**
   - Uses `npx sonarqube-scanner` first (most reliable)
   - Falls back to installed `sonar-scanner` if available

2. **Coverage Report Handling:**
   - Automatically generates coverage if missing
   - Uses `coverage/lcov.info` for analysis

3. **JUnit Test Results:**
   - Conditionally includes test execution reports
   - Automatically enables/disables based on file existence

4. **Error Handling:**
   - Gracefully skips if credentials not configured
   - Sends email notifications on failure
   - Non-blocking (pipeline continues on failure)

### Configuration Files

#### sonar-project.properties

Located in project root. Key settings:

```properties
sonar.projectKey=software-services-website
sonar.projectName=Software Services Website
sonar.projectVersion=0.1.0

# Source code location
sonar.sources=src
sonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**,**/test-results/**

# Test files location
sonar.tests=src
sonar.test.inclusions=**/*.test.tsx,**/*.test.ts,**/__tests__/**

# Coverage reports
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# Language
sonar.language=ts
sonar.typescript.tsconfigPath=tsconfig.json
```

## Running SonarQube Analysis

### From Jenkins Pipeline

1. **Ensure SonarQube server is running:**
   ```bash
   # Docker
   docker ps | grep sonarqube
   
   # Manual
   curl http://localhost:9000/api/system/status
   ```

2. **Verify Jenkins credential exists:**
   - Check: Manage Jenkins → Credentials → System → Global
   - Ensure `sonar-token` credential exists

3. **Run Jenkins pipeline:**
   - The SonarQube Analysis stage will run automatically
   - Check console output for analysis results

### Running Locally

```bash
# Set environment variables
export SONAR_HOST_URL=http://localhost:9000
export SONAR_TOKEN=your_token_here

# Run analysis
npx sonarqube-scanner \
  -Dsonar.host.url="${SONAR_HOST_URL}" \
  -Dsonar.token="${SONAR_TOKEN}"

# Or using installed scanner
sonar-scanner \
  -Dsonar.host.url="${SONAR_HOST_URL}" \
  -Dsonar.token="${SONAR_TOKEN}"
```

### Viewing Results

1. **Open SonarQube Dashboard:**
   - Navigate to: `http://localhost:9000`
   - Go to: Projects → Software Services Website

2. **View Analysis Results:**
   - Code quality metrics
   - Security vulnerabilities
   - Code smells
   - Coverage reports
   - Test execution results

## Troubleshooting

### SonarQube Server Not Starting

**Issue:** Server fails to start or crashes

**Solutions:**
1. **Check Java version:**
   ```bash
   java -version  # Should be 11 or higher
   ```

2. **Check system limits:**
   ```bash
   ulimit -n  # Should be at least 65536
   sysctl vm.max_map_count  # Should be at least 262144
   ```

3. **Check disk space:**
   ```bash
   df -h  # Ensure sufficient disk space
   ```

4. **Check logs:**
   ```bash
   # Docker
   docker logs sonarqube
   
   # Manual
   tail -f /opt/sonarqube/logs/sonar.log
   ```

### Connection Refused Errors

**Issue:** `ECONNREFUSED` or `Connection refused` errors

**Solutions:**
1. **Verify SonarQube is running:**
   ```bash
   curl http://localhost:9000/api/system/status
   ```

2. **Check firewall:**
   ```bash
   sudo ufw status
   # If needed, allow port 9000
   sudo ufw allow 9000
   ```

3. **Verify port is not in use:**
   ```bash
   lsof -i :9000
   ```

### Authentication Errors

**Issue:** `401 Unauthorized` or authentication failures

**Solutions:**
1. **Verify token is correct:**
   - Check Jenkins credential `sonar-token`
   - Ensure token hasn't expired
   - Regenerate token if needed

2. **Test token manually:**
   ```bash
   curl -u your_token: http://localhost:9000/api/authentication/validate
   ```

3. **Check token permissions:**
   - Ensure token has "Execute Analysis" permission
   - Verify token is associated with correct project

### Scanner Not Found

**Issue:** `sonar-scanner: not found`

**Solutions:**
1. **The Jenkinsfile uses `npx` by default** - this should work automatically
2. **If using installed scanner:**
   ```bash
   # Verify installation
   which sonar-scanner
   
   # Add to PATH if needed
   export PATH=$PATH:/opt/sonar-scanner/bin
   ```

### Coverage Report Not Found

**Issue:** Coverage report missing or not generated

**Solutions:**
1. **Generate coverage:**
   ```bash
   npm run test:coverage
   ```

2. **Verify file exists:**
   ```bash
   ls -la coverage/lcov.info
   ```

3. **Check sonar-project.properties:**
   - Verify `sonar.javascript.lcov.reportPaths=coverage/lcov.info`

### JUnit XML Parsing Errors

**Issue:** `Error during parsing of generic test execution report`

**Solutions:**
1. **The Jenkinsfile automatically handles this** by conditionally enabling/disabling test reports
2. **If issue persists:**
   - Comment out `sonar.testExecutionReportPaths` in `sonar-project.properties`
   - Or ensure JUnit XML is valid:
     ```bash
     xmllint --noout test-results/jest/junit.xml
     ```

### Analysis Takes Too Long

**Issue:** SonarQube analysis is slow

**Solutions:**
1. **Exclude unnecessary files:**
   - Update `sonar.exclusions` in `sonar-project.properties`
   - Exclude large directories like `node_modules`, `.next`, etc.

2. **Increase SonarQube resources:**
   - Allocate more memory to SonarQube
   - Use a more powerful server

3. **Run analysis only on changed files:**
   - Use SonarQube's incremental analysis feature

### Email Notifications Not Working

**Issue:** No email notifications for SonarQube failures

**Solutions:**
1. **Check Jenkins email configuration:**
   - Verify SMTP settings in Jenkins
   - Test email functionality

2. **Check Jenkinsfile:**
   - Ensure `mail` steps are present in SonarQube stage
   - Verify email addresses are correct

## Best Practices

1. **Keep SonarQube Updated:**
   - Regularly update SonarQube server
   - Update scanner tools

2. **Secure Your Token:**
   - Never commit tokens to version control
   - Use Jenkins credentials management
   - Rotate tokens periodically

3. **Monitor Disk Space:**
   - SonarQube stores analysis history
   - Clean up old projects if needed

4. **Set Quality Gates:**
   - Configure quality gates in SonarQube
   - Fail builds on critical issues

5. **Review Analysis Results:**
   - Regularly review code quality metrics
   - Address security vulnerabilities promptly

## Additional Resources

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [SonarQube Scanner Documentation](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)
- [SonarQube Docker Hub](https://hub.docker.com/_/sonarqube)
- [Jenkins SonarQube Plugin](https://plugins.jenkins.io/sonar/)

## Quick Reference

### Start SonarQube (Docker)
```bash
docker start sonarqube
```

### Check SonarQube Status
```bash
curl http://localhost:9000/api/system/status
```

### Run Analysis Locally
```bash
export SONAR_TOKEN=your_token
npx sonarqube-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token="${SONAR_TOKEN}"
```

### View SonarQube Dashboard
```
http://localhost:9000
```

### Jenkins Credential ID
```
sonar-token
```

### Project Key
```
software-services-website
```


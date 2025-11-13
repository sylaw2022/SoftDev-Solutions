# Complete Setup Guide - SoftDev Solutions Website

This comprehensive guide covers the setup and configuration of all services and tools used in this project: Jenkins, PostgreSQL, Render.com, SonarQube, and ngrok.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [PostgreSQL Setup](#postgresql-setup)
4. [Jenkins Setup](#jenkins-setup)
5. [Render.com Deployment](#rendercom-deployment)
6. [SonarQube Setup](#sonarqube-setup)
7. [ngrok Setup](#ngrok-setup)
8. [Local Development](#local-development)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

**SoftDev Solutions** is a modern Next.js website for a software development company offering comprehensive technology services.

### Tech Stack
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL
- **Testing:** Jest (unit), Playwright (E2E)
- **CI/CD:** Jenkins
- **Code Quality:** SonarQube
- **Deployment:** Render.com

### Key Features
- User registration system
- Contact form
- Admin dashboard
- Database health monitoring
- Comprehensive testing suite

---

## Prerequisites

### Required Software
- **Node.js** 20+ and npm 10+
- **PostgreSQL** 12+ (for local development)
- **Git** for version control
- **Java** 11+ (for SonarQube server)

### Optional Tools
- **Docker** (for containerized services)
- **Jenkins** (for CI/CD)
- **ngrok** (for exposing local server)

---

## PostgreSQL Setup

### Local PostgreSQL Installation

#### Option 1: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run -d \
  --name postgres-softdev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=Sylaw1970 \
  -e POSTGRES_DB=postgres \
  -p 5433:5432 \
  postgres:15-alpine

# Verify it's running
docker ps | grep postgres-softdev

# Test connection
docker exec postgres-softdev psql -U postgres -d postgres -c "SELECT version();"
```

#### Option 2: Manual Installation (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check PostgreSQL status
sudo systemctl status postgresql

# Check which port PostgreSQL is using
sudo pg_lsclusters
```

#### Configure Database User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE USER postgres WITH PASSWORD 'Sylaw1970';
ALTER USER postgres WITH SUPERUSER;
\q
```

### Database Connection Configuration

The application uses the following connection string format:
```
postgresql://user:password@host:port/database
```

**Default Local Connection:**
```bash
export DATABASE_URL="postgresql://postgres:Sylaw1970@localhost:5433/postgres"
```

**Note:** Port may be `5432` or `5433` depending on your PostgreSQL installation. Check with:
```bash
sudo pg_lsclusters
```

### Database Schema

The schema is automatically created on first connection. The `users` table includes:
- User registration information (name, email, company, phone)
- Timestamps (created_at, updated_at)
- Email tracking fields

### Testing Database Connection

```bash
# Test connection directly
psql -h localhost -U postgres -d postgres -c "SELECT version();"

# Or using the application
npm run dev
curl http://localhost:3000/api/admin/database
```

### Reading Database Users

```bash
# Show all users
npm run db:read

# Show recent users (last 30 days)
npm run db:read:recent

# Search users
node scripts/read-users.js --search "john"

# Output as JSON
npm run db:read:json
```

---

## Jenkins Setup

### Jenkins Installation

#### Option 1: Using Docker

```bash
# Run Jenkins container
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

#### Option 2: Manual Installation (Ubuntu/Debian)

```bash
# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt-get update
sudo apt-get install jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check status
sudo systemctl status jenkins
```

### Initial Jenkins Configuration

1. **Access Jenkins:**
   - Open `http://localhost:8080` in browser
   - Enter initial admin password (from installation logs)

2. **Install Recommended Plugins:**
   - Select "Install suggested plugins"

3. **Create Admin User:**
   - Set up your admin account

### Jenkins Pipeline Configuration

#### 1. Create Jenkins Job

1. **New Item** → **Pipeline**
2. **Name:** `SoftDev-Solutions`
3. **Pipeline Definition:** Pipeline script from SCM
4. **SCM:** Git
5. **Repository URL:** Your Git repository URL
6. **Branch:** `*/main`
7. **Script Path:** `Jenkinsfile`

#### 2. Configure Jenkins Credentials

**SonarQube Token:**
1. **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. **Add Credentials:**
   - **Kind:** Secret text
   - **Secret:** Your SonarQube token (see SonarQube section)
   - **ID:** `sonar-token` (must match exactly)
   - **Description:** `SonarQube Authentication Token`

**GitHub SSH Key (if needed):**
1. **Add Credentials:**
   - **Kind:** SSH Username with private key
   - **ID:** `github-ssh`
   - **Private Key:** Your GitHub SSH private key

#### 3. Configure Environment Variables

1. **Manage Jenkins** → **Configure System**
2. **Global properties** → **Environment variables:**
   - **Name:** `SONAR_HOST_URL`
   - **Value:** `http://localhost:9000` (or your SonarQube URL)

#### 4. Configure Email Notifications

1. **Manage Jenkins** → **Configure System**
2. **Extended E-mail Notification** (or use default `mail` step):
   - **SMTP server:** `smtp.gmail.com`
   - **SMTP Port:** `587`
   - **Use SSL:** Yes
   - **User Name:** Your Gmail address
   - **Password:** Gmail App Password
   - **Default user e-mail suffix:** `@gmail.com`

### Jenkins Pipeline Stages

The Jenkinsfile includes the following stages:

1. **Checkout** - Git repository checkout
2. **Setup Node.js** - Node.js environment setup using nvm
3. **Install Dependencies** - `npm ci`
4. **Lint** - ESLint code linting
5. **Type Check** - TypeScript type checking
6. **Unit Tests** - Jest unit tests with coverage
7. **Build** - Next.js production build
8. **SonarQube Analysis** - Code quality analysis
9. **E2E Tests** - Playwright end-to-end tests
10. **Security Scan** - npm audit

### Jenkins PostgreSQL Configuration

The Jenkinsfile is configured to use local PostgreSQL for E2E tests:

```groovy
env.DATABASE_URL = 'postgresql://postgres:Sylaw1970@localhost:5433/postgres'
```

**Ensure PostgreSQL is running before E2E tests:**
```bash
# On Jenkins agent
sudo systemctl status postgresql
# or
docker ps | grep postgres
```

### Jenkins Email Configuration

Email notifications are sent to `groklord2@gmail.com` for:
- Each stage success/failure
- Build completion (success/failure/unstable)
- Critical errors

---

## Render.com Deployment

### Render.com Account Setup

1. **Sign up** at [render.com](https://render.com)
2. **Create account** (free tier available)

### Deployment Configuration

The project includes `render.yaml` for automatic deployment:

```yaml
services:
  - type: web
    name: softdev-solutions-website
    env: node
    plan: free
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_VERSION
        value: 20
```

### Deploy to Render.com

#### Option 1: Using render.yaml (Recommended)

1. **Connect Repository:**
   - Go to Render Dashboard
   - **New** → **Blueprint**
   - Connect your GitHub repository
   - Render will detect `render.yaml` automatically

2. **Manual Service Creation:**
   - **New** → **Web Service**
   - Connect your repository
   - Render will use `render.yaml` configuration

#### Option 2: Manual Configuration

1. **New Web Service:**
   - **Name:** `softdev-solutions-website`
   - **Environment:** `Node`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

2. **Environment Variables:**
   - `NODE_ENV=production`
   - `NODE_VERSION=20`
   - `CI=false`

### Render.com PostgreSQL (Optional)

If you want to use Render.com's managed PostgreSQL:

1. **Create PostgreSQL Service:**
   - **New** → **PostgreSQL**
   - **Name:** `softdev-solutions-db`
   - **Plan:** Free
   - **Region:** Singapore (or your preferred region)

2. **Link to Web Service:**
   - In web service settings
   - **Environment** → **Link PostgreSQL**
   - `DATABASE_URL` will be automatically set

3. **Update render.yaml:**
   ```yaml
   services:
     - type: pspg
       name: softdev-solutions-db
       plan: free
     - type: web
       name: softdev-solutions-website
       # ... rest of config
   ```

### Render.com Deployment Notes

- **Auto-deploy:** Enabled on `main` branch push
- **Build:** Runs `npm ci && npm run build`
- **Start:** Runs `npm start` (production server)
- **Health Check:** `GET /` endpoint
- **Free Tier Limitations:**
  - Services spin down after 15 minutes of inactivity
  - First request after spin-down may be slow
  - Limited build minutes per month

---

## SonarQube Setup

### SonarQube Server Installation

#### Option 1: Using Docker (Recommended)

```bash
# Pull SonarQube image
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

# Check status
docker ps | grep sonarqube
docker logs sonarqube
```

#### Option 2: Manual Installation

```bash
# Download SonarQube
cd /opt
sudo wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.3.0.82913.zip
sudo unzip sonarqube-10.3.0.82913.zip
sudo mv sonarqube-10.3.0.82913 sonarqube
sudo chown -R $USER:$USER /opt/sonarqube

# Configure system limits
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf

# Start SonarQube
cd /opt/sonarqube
./bin/linux-x86-64/sonar.sh start
```

### SonarQube Initial Configuration

1. **Access SonarQube:**
   - Open `http://localhost:9000`
   - Default credentials: `admin` / `admin`
   - Change password on first login

2. **Create Project:**
   - **Projects** → **Create Project** → **Manually**
   - **Project Key:** `software-services-website`
   - **Display Name:** `Software Services Website`

3. **Generate Token:**
   - **My Account** → **Security**
   - **Generate Token:** `jenkins-token`
   - **Copy token immediately** (e.g., `sqa_f83946ac33801801b6e07535650cd1148e9e9317`)

### SonarQube Project Configuration

The project includes `sonar-project.properties`:

```properties
sonar.projectKey=software-services-website
sonar.projectName=Software Services Website
sonar.sources=src
sonar.tests=src
sonar.language=ts
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### Running SonarQube Analysis

#### From Jenkins Pipeline

The Jenkinsfile automatically runs SonarQube analysis after the Build stage. Ensure:
1. SonarQube server is running
2. Jenkins credential `sonar-token` is configured
3. `SONAR_HOST_URL` environment variable is set (defaults to `http://localhost:9000`)

#### Locally

```bash
# Set environment variables
export SONAR_HOST_URL=http://localhost:9000
export SONAR_TOKEN=your_token_here

# Run analysis
npx sonarqube-scanner \
  -Dsonar.host.url="${SONAR_HOST_URL}" \
  -Dsonar.token="${SONAR_TOKEN}"
```

### Viewing SonarQube Results

1. Open `http://localhost:9000`
2. Navigate to **Projects** → **Software Services Website**
3. View:
   - Code quality metrics
   - Security vulnerabilities
   - Code smells
   - Coverage reports

---

## ngrok Setup

### ngrok Installation

ngrok is already installed at `/home/sylaw/bin/ngrok`. If you need to install it:

```bash
# Download ngrok
wget https://binaries.ngrok.com/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Verify installation
ngrok version
```

### ngrok Configuration (Optional)

1. **Sign up** at [ngrok.com](https://ngrok.com) (free account)
2. **Get authtoken** from [dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
3. **Configure:**
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### Using ngrok

#### Quick Start

1. **Start Next.js server:**
   ```bash
   npm run dev
   ```

2. **Start ngrok tunnel:**
   ```bash
   ./start-ngrok.sh
   # or
   npm run ngrok
   # or
   ngrok http 3000
   ```

3. **Copy the public URL:**
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3000
   ```

#### Advanced Usage

```bash
# Custom port
./start-ngrok.sh 3000

# Using ngrok directly
ngrok http 3000

# With custom domain (paid plan)
ngrok http 3000 --domain=your-domain.ngrok.io
```

### ngrok Web Interface

While ngrok is running, access the web interface at:
```
http://localhost:4040
```

Features:
- View all HTTP requests/responses
- Replay requests
- Inspect headers and payloads
- Request history

### Use Cases

- **Testing Webhooks:** Use ngrok URL as webhook endpoint
- **Mobile Testing:** Access local dev server from mobile devices
- **Team Sharing:** Share local development with team members
- **Demo:** Quick demos without deployment

---

## Local Development

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd software-services-website

# Install dependencies
npm install

# Set up environment variables
export DATABASE_URL="postgresql://postgres:Sylaw1970@localhost:5433/postgres"
export NODE_ENV=development

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                 # Start production server

# Testing
npm test                 # Run unit tests
npm run test:coverage     # Run tests with coverage
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run E2E tests with UI

# Code Quality
npm run lint              # Run ESLint
npm run ngrok             # Start ngrok tunnel

# Database
npm run db:read           # Read all users
npm run db:read:recent    # Read recent users
npm run db:read:json      # Read users as JSON
```

### Environment Variables

Create `.env.local` for local development:

```env
DATABASE_URL=postgresql://postgres:Sylaw1970@localhost:5433/postgres
NODE_ENV=development
SONAR_HOST_URL=http://localhost:9000
SONAR_TOKEN=your_sonar_token_here
```

### Database Operations

```bash
# Read all users
npm run db:read

# Search users
node scripts/read-users.js --search "john"

# Filter by company
node scripts/read-users.js --company "Test Company"

# Recent users (last 7 days)
node scripts/read-users.js --recent 7

# Limit results
node scripts/read-users.js --limit 10

# JSON output
node scripts/read-users.js --format json > users.json
```

---

## Troubleshooting

### PostgreSQL Issues

**Connection Refused:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql
# or
docker ps | grep postgres

# Check port
sudo pg_lsclusters

# Test connection
psql -h localhost -U postgres -d postgres -c "SELECT 1;"
```

**Authentication Failed:**
```bash
# Reset password
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'Sylaw1970';
\q
```

**Port Already in Use:**
```bash
# Find process using port
lsof -i :5432
# or
lsof -i :5433

# Kill process if needed
kill -9 <PID>
```

### Jenkins Issues

**Pipeline Fails:**
- Check Jenkins console output
- Verify all credentials are configured
- Ensure PostgreSQL is running for E2E tests
- Check email configuration for notifications

**SonarQube Stage Fails:**
- Verify SonarQube server is running
- Check `sonar-token` credential exists
- Verify `SONAR_HOST_URL` is set correctly

**E2E Tests Fail:**
- Ensure PostgreSQL is running and accessible
- Check `DATABASE_URL` environment variable
- Verify port 3000 is available

### Render.com Issues

**Deployment Fails:**
- Check build logs in Render dashboard
- Verify `package.json` dependencies
- Check environment variables
- Ensure Node.js version is correct

**Database Connection Issues:**
- Verify PostgreSQL service is linked
- Check `DATABASE_URL` is set automatically
- Review connection retry logic in code

**Service Spins Down:**
- Free tier limitation
- First request after spin-down may be slow
- Consider upgrading for always-on service

### SonarQube Issues

**Server Won't Start:**
```bash
# Check Java version
java -version  # Should be 11+

# Check system limits
ulimit -n  # Should be 65536+
sysctl vm.max_map_count  # Should be 262144+

# Check disk space
df -h

# View logs
docker logs sonarqube
# or
tail -f /opt/sonarqube/logs/sonar.log
```

**Analysis Fails:**
- Verify token is correct
- Check SonarQube server is accessible
- Ensure coverage report exists
- Review `sonar-project.properties` configuration

### ngrok Issues

**Connection Refused:**
- Ensure Next.js server is running first
- Check port matches (default: 3000)
- Verify firewall settings

**Session Expired:**
- Free ngrok sessions expire after 2 hours
- Restart ngrok to get new session
- Consider upgrading for longer sessions

---

## Quick Reference

### Service URLs

- **Local Development:** `http://localhost:3000`
- **Jenkins:** `http://localhost:8080`
- **SonarQube:** `http://localhost:9000`
- **ngrok Web Interface:** `http://localhost:4040`

### Default Credentials

- **PostgreSQL:** `postgres` / `Sylaw1970` (port 5433)
- **SonarQube:** `admin` / `admin` (change on first login)
- **Jenkins:** Check installation logs for initial password

### Important IDs

- **Jenkins Credential ID:** `sonar-token`
- **SonarQube Project Key:** `software-services-website`
- **Database Name:** `postgres`

### Common Commands

```bash
# Start services
docker start postgres-softdev
docker start sonarqube
docker start jenkins

# Check services
docker ps

# View logs
docker logs sonarqube
docker logs jenkins

# Stop services
docker stop sonarqube
docker stop jenkins
docker stop postgres-softdev
```

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Render.com Documentation](https://render.com/docs)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [ngrok Documentation](https://ngrok.com/docs)

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review service-specific documentation files
3. Check Jenkins console logs
4. Review application logs

---

**Last Updated:** November 2025


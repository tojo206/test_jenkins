# Simple Full-Stack Application

A simple full-stack web application with separate frontend and backend, ready for Jenkins CI/CD deployment to cPanel.

## Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Local Development](#local-development)
- [API Endpoints](#api-endpoints)
- [Jenkins CI/CD Pipeline](#jenkins-cicd-pipeline)
  - [Pipeline Overview](#pipeline-overview)
  - [Pipeline Stages Explained](#pipeline-stages-explained)
  - [Configuration](#configuration)
  - [Setup Instructions](#setup-instructions)
- [Deployment to cPanel](#deployment-to-cpanel)
- [Troubleshooting](#troubleshooting)

---

## Project Structure

```
Jenkins_node_project/
├── frontend/           # HTML, CSS, JavaScript frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/           # Node.js/Express backend
│   ├── server.js
│   ├── package.json
│   └── .htaccess
├── Jenkinsfile        # Jenkins CI/CD pipeline configuration
└── README.md          # This file
```

---

## Features

- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js with Express framework
- REST API endpoints
- CORS enabled for development
- Contact form with validation
- Health check endpoint
- Automated Jenkins CI/CD deployment

---

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The backend server will run on `http://localhost:3000`

### Setup Frontend

The frontend is served automatically by the backend. Just visit `http://localhost:3000` in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serve the frontend |
| GET | `/api/data` | Get sample data from backend |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/health` | Health check endpoint |

---

## Jenkins CI/CD Pipeline

### Pipeline Overview

The Jenkinsfile implements a complete CI/CD pipeline that:
- Builds and tests your application
- Deploys frontend/backend files via FTP to cPanel
- Automatically restarts the Node.js application (if SSH available)
- Provides detailed build summaries

### Pipeline Stages Explained

#### Stage 1: Code Checkout
```groovy
stage('Code Checkout')
```
- Pulls the latest code from the Git repository
- Verifies files are present in the workspace

#### Stage 2: Install Dependencies
```groovy
stage('Install Dependencies')
```
- Installs npm production dependencies for the backend
- Runs `npm install --production` in the backend directory

#### Stage 3: Build
```groovy
stage('Build')
```
- Placeholder for build steps (currently just logs)
- Can be extended for webpack, vite, or other build tools

#### Stage 4: Test
```groovy
stage('Test')
```
- Verifies frontend files exist (index.html, style.css, script.js)
- Fails the pipeline if required files are missing
- Can be extended with actual unit tests

#### Stage 5: Deploy to FTP
```groovy
stage('Deploy to FTP')
```
- Creates deployment package with frontend and backend files
- Tests FTP connection before uploading
- Creates remote directories if they don't exist
- Uploads files via FTP using PowerShell

**Files uploaded:**
```
/lecture.mvelow.co.za/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── backend/
    ├── server.js
    ├── package.json
    └── .htaccess
```

#### Stage 6: Post-Deploy
```groovy
stage('Post-Deploy')
```
- Restarts the Node.js application via SSH (if plink/PuTTY available)
- Falls back to manual restart if SSH tools not found
- Provides clear status messages

#### Post-Actions
- **Success**: Displays success message
- **Failure**: Displays failure message
- **Always**: Cleans up temporary files and shows build summary

### Configuration

#### Environment Variables

The pipeline uses these environment variables (configured in Jenkinsfile):

```groovy
environment {
    CPANEL_HOST = '31.22.4.46'           // FTP server IP/hostname
    CPANEL_DEPLOY_PATH = '/lecture.mvelow.co.za'  // Deployment path
    DEPLOYMENT_NAME = 'simple-app'
}
```

#### Required Credentials

Create these credentials in Jenkins (**Manage Jenkins → Manage Credentials**):

| Credential ID | Type | Description |
|---------------|------|-------------|
| `cpanel-password` | Username with password | FTP/SSH credentials |
| - Username: Your cPanel/FTP username |
| - Password: Your cPanel/FTP password |

**Note:** The same credential is used for both FTP upload and SSH restart.

### Setup Instructions

#### 1. Install Jenkins Plugins (Optional)

For optimal functionality, ensure these plugins are installed:
- **Pipeline** - Required for Declarative Pipeline syntax
- **Git** - For SCM checkout

#### 2. Create Jenkins Pipeline Job

1. Open Jenkins and click **New Item**
2. Enter a name (e.g., `lecture-deploy`)
3. Select **Pipeline** and click **OK**

#### 3. Configure Pipeline

Scroll to the **Pipeline** section:

| Setting | Value |
|---------|-------|
| **Definition** | Pipeline script from SCM |
| **SCM** | Git |
| **Repository URL** | `https://github.com/tojo206/test_jenkins.git` |
| **Script Path** | `Jenkinsfile` |
| **Branch** | `*/main` |

#### 4. Install PuTTY for SSH (Optional)

For automatic Node.js restart via SSH, install PuTTY on your Jenkins Windows server:

1. Download from: https://www.putty.org/
2. Install to default location (or update paths in Jenkinsfile)
3. The pipeline will automatically detect `plink.exe`

#### 5. Run the Pipeline

Click **Build Now** to deploy your application!

---

## Deployment to cPanel

### Manual Deployment (Alternative)

If you prefer manual deployment or Jenkins fails:

1. **Upload Files:**
   - Use FTP/SFTP or cPanel File Manager
   - Upload `frontend/` to `/lecture.mvelow.co.za/frontend/`
   - Upload `backend/` to `/lecture.mvelow.co.za/backend/`

2. **Setup Node.js App in cPanel:**
   - Go to **Software → Setup Node.js App**
   - Click **Create Application**
   - Configure:
     - **Node.js version**: 20.x
     - **Application mode**: Production
     - **Application root**: `lecture.mvelow.co.za/backend`
     - **Application URL**: `lecture.mvelow.co.za`
     - **Application startup file**: `server.js`

3. **Install Dependencies:**
   - Click **Run NPM Install** in the Node.js app section

4. **Restart Application:**
   - Click **Restart** button

---

## Troubleshooting

### Jenkins Pipeline Fails

**FTP Connection Failed:**
- Verify credentials are correct in Jenkins
- Check that FTP is enabled on your hosting account
- Ensure firewall allows FTP connections

**SSH Restart Failed:**
- Install PuTTY on Jenkins server for SSH support
- Verify SSH access is enabled on your hosting account
- Fallback: Restart manually via cPanel

**Deployment Path Issues:**
- ByetHost FTP root is typically your home directory
- Use relative paths from FTP root (e.g., `/lecture.mvelow.co.za`)

### Backend Issues

**Application Won't Start:**
- Check that all dependencies are installed (`npm install`)
- Verify the startup file is `server.js`
- Check cPanel Node.js error logs
- Ensure the port is not blocked by firewall

**API Returns 404:**
- Verify the Node.js app is running in cPanel
- Check the application URL in cPanel Node.js settings
- Restart the application via cPanel

### Frontend Issues

**Can't Connect to Backend:**
- Verify backend is running and accessible
- Check browser console for CORS errors
- Ensure API URLs in `script.js` are correct

---

## Pipeline Console Output Example

```
[Pipeline] start
[Code Checkout] Checking out code from repository...
[Code Checkout] Checkout completed successfully!
[Install Dependencies] Installing backend dependencies...
[Install Dependencies] Dependencies installed successfully!
[Build] Building application...
[Test] Running tests...
[Test] All tests passed!
[Deploy to FTP] Deploying to: 31.22.4.46/lecture.mvelow.co.za
[Deploy to FTP] FTP connection successful!
[Deploy to FTP] Uploading frontend: index.html
[Deploy to FTP] Uploading frontend: style.css
[Deploy to FTP] Uploading frontend: script.js
[Deploy to FTP] Uploading backend: package.json
[Deploy to FTP] Uploading backend: server.js
[Deploy to FTP] Uploading backend: .htaccess
[Deploy to FTP] Deployment completed successfully!
[Post-Deploy] Restarting Node.js application via SSH...
[Post-Deploy] Node.js application restarted successfully!
[Pipeline] completed successfully! ✓
```

---

## License

ISC

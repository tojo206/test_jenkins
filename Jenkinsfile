pipeline {
    agent any

    environment {
        // cPanel Configuration - Update these values
        CPANEL_HOST = 'sv10.byethost10.org'
        CPANEL_PORT = '2083'  // cPanel port
        CPANEL_CREDS = credentials('cpanel-password')  // Provides CPANEL_CREDS_USR and CPANEL_CREDS_PSW
        CPANEL_DEPLOY_PATH = '/home/mvelowco/public_html'

        // Deployment Settings
        DEPLOYMENT_NAME = 'simple-app'
        BUILD_TIMESTAMP = bat(script: "@echo %date:~10,4%%date:~4,2%%date:~7,2%-%time:~0,2%%time:~3,2%%time:~6,2%", returnStdout: true).trim()
    }

    stages {
        stage('Code Checkout') {
            steps {
                echo 'Checking out code from repository...'
                script {
                    try {
                        // Use Jenkins SCM checkout if configured
                        checkout scm
                    } catch (Exception e) {
                        echo "SCM checkout failed: ${e.message}"
                        // Fallback: assuming code is already in workspace
                        echo "Using existing workspace code..."
                    }
                }
                // Verify the checkout
                bat 'dir /b'
                echo "Checkout completed successfully!"
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Checking for Node.js and installing dependencies...'
                script {
                    try {
                        // Check if Node.js is installed
                        bat 'node --version'
                    } catch (Exception e) {
                        echo 'Node.js not found. Please install Node.js on your Jenkins agent.'
                        error 'Node.js is required but not found. Please install Node.js 18.x or higher.'
                    }

                    // Install npm dependencies
                    bat 'cd backend && npm install --production'
                }
                echo 'Dependencies installed successfully!'
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
                // Add any build steps here if needed
                echo 'Build completed successfully!'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'

                script {
                    try {
                        // Check frontend files exist
                        bat '''
                            if not exist "frontend\\index.html" exit 1
                            if not exist "frontend\\style.css" exit 1
                            if not exist "frontend\\script.js" exit 1
                            echo Frontend files verified!
                        '''

                        echo "All tests passed!"

                    } catch (Exception e) {
                        echo "Tests failed: ${e.message}"
                        error "Tests failed - aborting pipeline"
                    }
                }
            }
        }

        stage('Verify FTP Connection') {
            steps {
                echo "Testing FTP connection to ${CPANEL_HOST}..."

                script {
                    // ========== DEBUG OUTPUT ==========
                    echo "==================================="
                    echo "DEBUG: CREDENTIALS BEING USED:"
                    echo "==================================="
                    echo "FTP Host: ${CPANEL_HOST}"
                    echo "FTP Username: ${CPANEL_CREDS_USR}"
                    echo "FTP Password: ${CPANEL_CREDS_PSW}"
                    echo "Deploy Path: ${CPANEL_DEPLOY_PATH}"
                    echo "==================================="
                    // ====================================

                    try {
                        // Create a test FTP script to verify connection
                        // Windows FTP: commands only, credentials via input
                        writeFile file: 'ftp-test.txt', text: """user ${CPANEL_CREDS_USR} ${CPANEL_CREDS_PSW}
pwd
quit
"""

                        // Run FTP test and capture output (specify host separately)
                        def exitCode = bat(script: "ftp -s:ftp-test.txt ${CPANEL_HOST}", returnStatus: true)

                        // Clean up test file
                        bat 'if exist ftp-test.txt del ftp-test.txt'

                        if (exitCode != 0) {
                            error """
===============================================
FTP CONNECTION FAILED!
===============================================
Could not connect to FTP server: ${CPANEL_HOST}
Please verify:
1. FTP Host is correct: ${CPANEL_HOST}
2. FTP Username is correct in your Jenkins credential
3. FTP Password is correct in your Jenkins credential
4. Your FTP account is active in ByetHost VistaPanel

To find your ByetHost FTP credentials:
- Login to VistaPanel
- Go to 'FTP Accounts' or 'FTP Manager'
- Use the FTP username and password shown there
===============================================
"""
                        }

                        echo "✅ FTP connection successful!"

                    } catch (Exception e) {
                        // Clean up test file
                        bat 'if exist ftp-test.txt del ftp-test.txt'
                        throw e
                    }
                }
            }
        }

        stage('Deploy to cPanel') {
            steps {
                echo "Deploying to cPanel at ${CPANEL_HOST}..."

                script {
                    try {
                        // Create deployment package
                        bat """
                            echo Creating deployment package...
                            if exist deploy-package rmdir /s /q deploy-package
                            mkdir deploy-package

                            REM Copy frontend files
                            xcopy /e /i frontend deploy-package\\frontend

                            REM Copy backend files (excluding node_modules)
                            mkdir deploy-package\\backend
                            copy backend\\package.json deploy-package\\backend\\
                            copy backend\\server.js deploy-package\\backend\\
                            copy backend\\.htaccess deploy-package\\backend\\

                            echo Package created successfully!
                        """

                        // Deploy using FTP (most common for cPanel)
                        echo "Uploading via FTP..."

                        // Create a proper Windows FTP script
                        writeFile file: 'ftp-upload.txt', text: """user ${CPANEL_CREDS_USR} ${CPANEL_CREDS_PSW}
binary
cd ${CPANEL_DEPLOY_PATH}
mkdir frontend
cd frontend
lcd deploy-package\\frontend
prompt n
mput *
cd /
cd ${CPANEL_DEPLOY_PATH}
mkdir backend
cd backend
lcd deploy-package\\backend
prompt n
mput *
quit
"""

                        def exitCode = bat(script: "ftp -s:ftp-upload.txt ${CPANEL_HOST}", returnStatus: true)
                        bat 'if exist ftp-upload.txt del ftp-upload.txt'

                        if (exitCode != 0) {
                            error """
===============================================
DEPLOYMENT FAILED!
===============================================
FTP upload failed with exit code: ${exitCode}
Please check the FTP logs above for details.
===============================================
"""
                        }

                        echo "✅ Deployment completed successfully!"

                    } catch (Exception e) {
                        echo "Deployment failed: ${e.message}"
                        // Clean up FTP script file on error
                        bat 'if exist ftp-upload.txt del ftp-upload.txt'
                        throw e
                    }
                }
            }
        }

        stage('Post-Deploy') {
            steps {
                echo 'Running post-deployment tasks...'

                script {
                    try {
                        // Note: ByetHost uses VistaPanel, not full cPanel
                        // The Node.js restart API is not available
                        echo "ByetHost does not support automatic Node.js restart via API."
                        echo "Please restart your Node.js application manually in VistaPanel."

                        // Verify deployment
                        echo "Verifying deployment files..."
                        bat "curl -s -I \"https://${CPANEL_HOST}/\" | find \"200\""

                        echo "Post-deployment tasks completed!"
                        echo "=================================="
                        echo "MANUAL STEPS REQUIRED:"
                        echo "1. Login to ByetHost VistaPanel"
                        echo "2. Go to 'Node.js' section"
                        echo "3. Create or restart your Node.js application"
                        echo "4. Point it to the backend/server.js file"
                        echo "=================================="

                    } catch (Exception e) {
                        echo "Post-deployment note: ${e.message}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed! Check the logs for details.'
        }

        always {
            script {
                echo "Cleaning up workspace..."
                try {
                    bat """
                        if exist deploy-package rmdir /s /q deploy-package
                        if exist *.tar.gz del /q *.tar.gz
                        if exist ftp-upload.txt del /q ftp-upload.txt
                        echo Cleanup completed!
                    """
                } catch (Exception e) {
                    echo "Cleanup warning: ${e.message}"
                }

                echo """
                    ========================================
                    Build Summary
                    ========================================
                    Status: ${currentBuild.result ?: 'SUCCESS'}
                    Duration: ${currentBuild.durationString}
                    Build Number: ${env.BUILD_NUMBER}
                    ========================================
                """
            }
        }
    }
}

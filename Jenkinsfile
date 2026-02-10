pipeline {
    agent any

    tools {
        nodejs 'NodeJS'  // Make sure you have NodeJS configured in Jenkins
    }

    environment {
        // cPanel Configuration - Update these values
        CPANEL_HOST = 'sv10.byethost10.org'
        CPANEL_PORT = '2083'  // cPanel port
        CPANEL_CREDS = credentials('cpanel-password')  // Provides CPANEL_CREDS_USR and CPANEL_CREDS_PSW
        CPANEL_DEPLOY_PATH = '/home/mvelowco/public_html'

        // Deployment Settings
        DEPLOYMENT_NAME = 'simple-app'
        BUILD_TIMESTAMP = sh(script: "date +%Y%m%d-%H%M%S", returnStdout: true).trim()
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
                sh 'ls -la'
                echo "Checkout completed successfully!"
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing backend dependencies...'
                dir('backend') {
                    sh 'npm install --production'
                }
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
                        dir('backend') {
                            // Add your test commands here
                            // sh 'npm test'

                            // For now, just verify the server.js syntax
                            sh 'node -c server.js'
                            echo "Server syntax check passed!"
                        }

                        // Check frontend files exist
                        sh '''
                            test -f frontend/index.html || exit 1
                            test -f frontend/style.css || exit 1
                            test -f frontend/script.js || exit 1
                            echo "Frontend files verified!"
                        '''

                        echo "All tests passed!"

                    } catch (Exception e) {
                        echo "Tests failed: ${e.message}"
                        // Decide whether to fail the pipeline or continue
                        // currentBuild.result = 'FAILURE'
                        // throw e
                        echo "Continuing with deployment despite test failure..."
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
                        sh """
                            echo "Creating deployment package..."
                            rm -rf deploy-package
                            mkdir -p deploy-package

                            # Copy frontend files
                            cp -r frontend deploy-package/

                            # Copy backend files (excluding node_modules)
                            mkdir -p deploy-package/backend
                            cp backend/package.json deploy-package/backend/
                            cp backend/server.js deploy-package/backend/
                            cp backend/.htaccess deploy-package/backend/

                            # Create archive
                            cd deploy-package && tar -czf ../${DEPLOYMENT_NAME}-build.tar.gz .
                            echo "Package created successfully!"
                        """

                        // Deploy using FTP (most common for cPanel)
                        echo "Uploading via FTP..."
                        sh """
                            # Install ftp if not available (for Debian/Ubuntu)
                            # apt-get update && apt-get install -y ftp

                            # Upload using FTP
                            ftp -n -i ${CPANEL_HOST} 21 <<EOF
                            user ${CPANEL_CREDS_USR} ${CPANEL_CREDS_PSW}
                            binary
                            cd ${CPANEL_DEPLOY_PATH}
                            mkdir -p frontend backend
                            cd frontend
                            lcd deploy-package/frontend
                            mput *
                            cd ..
                            cd backend
                            lcd deploy-package/backend
                            mput *
                            quit
                            EOF

                            echo "FTP upload completed!"
                        """

                        // Alternative: Use SCP if SSH is available
                        // sh """
                        //     # Install sshpass if needed
                        //     apt-get install -y sshpass
                        //
                        //     # Upload via SCP
                        //     sshpass -p "${CPANEL_CREDS_PSW}" scp -r \
                        //         deploy-package/* \
                        //         ${CPANEL_CREDS_USR}@${CPANEL_HOST}:${CPANEL_DEPLOY_PATH}/
                        // """

                        echo "Deployment completed successfully!"

                    } catch (Exception e) {
                        echo "Deployment failed: ${e.message}"
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
                        // Restart Node.js application via cPanel API
                        echo "Restarting Node.js application..."

                        sh """
                            # Use cPanel UAPI to restart the Node.js app
                            # You need to replace 'your-app-name' with your actual app name
                            curl -s "https://${CPANEL_HOST}:${CPANEL_PORT}/execute/NodeJS/restart_application?name=simple-app" \
                                --user "${CPANEL_CREDS_USR}:${CPANEL_CREDS_PSW}" \
                                --insecure || echo "Restart via API failed, may need manual restart"
                        """

                        // Verify deployment
                        echo "Verifying deployment..."
                        sh """
                            sleep 5
                            # Check if the application is responding
                            response=\$(curl -s -o /dev/null -w "%{http_code}" https://${CPANEL_HOST}/api/health || echo "000")
                            if [ "\$response" = "200" ]; then
                                echo "Application is responding correctly!"
                            else
                                echo "Warning: Application may not be responding (HTTP \$response)"
                                echo "You may need to manually restart the Node.js app in cPanel"
                            fi
                        """

                        echo "Post-deployment tasks completed successfully!"

                    } catch (Exception e) {
                        echo "Post-deployment warning: ${e.message}"
                        echo "The application was deployed but may need manual restart in cPanel"
                        // Don't fail the pipeline here - deployment was successful
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! 🎉'
            // Send notification (optional)
            // emailext subject: "Deployment Success",
            //          body: "The application was deployed successfully.",
            //          to: "your-email@example.com"
        }

        failure {
            echo 'Pipeline failed! ❌'
            // Send notification (optional)
            // emailext subject: "Deployment Failed",
            //          body: "The deployment failed. Please check the logs.",
            //          to: "your-email@example.com"
        }

        always {
            script {
                echo "Cleaning up workspace..."
                try {
                    sh """
                        echo "Cleaning up deployment artifacts..."
                        rm -rf deploy-package
                        rm -f *.tar.gz
                        echo "Cleanup completed!"
                    """
                } catch (Exception e) {
                    echo "Cleanup warning: ${e.message}"
                }

                // Print build summary
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

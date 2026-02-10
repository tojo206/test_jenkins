pipeline {
    agent any

    environment {
        // cPanel Configuration - Update these values
        CPANEL_HOST = '31.22.4.46'  // Temporary FTP hostname (may work better)
        CPANEL_DEPLOY_PATH = '/home.mvelowco/lecture.mvelow.co.za'

        // Deployment Settings
        DEPLOYMENT_NAME = 'simple-app'
    }

    stages {
        stage('Code Checkout') {
            steps {
                echo 'Checking out code from repository...'
                checkout scm
                bat 'dir /b'
                echo "Checkout completed successfully!"
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing backend dependencies...'
                bat 'cd backend && npm install --production'
                echo 'Dependencies installed successfully!'
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
                echo 'Build completed successfully!'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                bat '''
                    if not exist "frontend\\index.html" exit 1
                    if not exist "frontend\\style.css" exit 1
                    if not exist "frontend\\script.js" exit 1
                    echo Frontend files verified!
                '''
                echo "All tests passed!"
            }
        }

        stage('Deploy to FTP') {
            steps {
                echo 'Deploying to FTP...'

                script {
                    // Create deployment package
                    bat """
                        echo Creating deployment package...
                        if exist deploy-package rmdir /s /q deploy-package
                        mkdir deploy-package
                        xcopy /e /i frontend deploy-package\\frontend
                        mkdir deploy-package\\backend
                        copy backend\\package.json deploy-package\\backend\\
                        copy backend\\server.js deploy-package\\backend\\
                        copy backend\\.htaccess deploy-package\\backend\\
                        echo Package created successfully!
                    """

                    // Deploy using PowerShell with credentials
                    withCredentials([usernamePassword(
                        credentialsId: 'cpanel-password',
                        usernameVariable: 'FTP_USER',
                        passwordVariable: 'FTP_PASS'
                    )]) {
                        powershell '''
                            $ftpHost = $env:CPANEL_HOST
                            $ftpUser = $env:FTP_USER
                            $ftpPass = $env:FTP_PASS
                            $ftpDir  = $env:CPANEL_DEPLOY_PATH

                            Write-Host "Deploying to FTP: $ftpHost$ftpDir"
                            Write-Host "FTP User: $ftpUser"

                            # Test FTP connection first
                            try {
                                Write-Host "Testing FTP connection..."
                                $testRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost/")
                                $testRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
                                $testRequest.Method = [System.Net.WebRequestMethods+Ftp]::PrintWorkingDirectory
                                $testResponse = $testRequest.GetResponse()
                                $status = $testResponse.StatusDescription
                                $testResponse.Close()
                                Write-Host "SUCCESS: FTP connection established! Server response: $status"

                                # List directories in FTP root
                                Write-Host "=========================================="
                                Write-Host "Listing FTP root directory (/):"
                                Write-Host "=========================================="
                                $listRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost/")
                                $listRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
                                $listRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
                                $listResponse = $listRequest.GetResponse()
                                $reader = New-Object System.IO.StreamReader($listResponse.GetResponseStream())
                                $listing = $reader.ReadToEnd()
                                $reader.Close()
                                $listResponse.Close()
                                Write-Host $listing
                                Write-Host "=========================================="
                            } catch {
                                Write-Host "ERROR: FTP connection failed!"
                                Write-Host $_.Exception.Message
                                Write-Host $_.Exception.InnerException.Message
                                exit 1
                            }

                            # Helper function to create FTP directory
                            function Create-FtpDirectory {
                                param($dirPath)
                                try {
                                    $uri = "ftp://$ftpHost$dirPath"
                                    $request = [System.Net.FtpWebRequest]::Create($uri)
                                    $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
                                    $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
                                    $request.GetResponse().Close()
                                    Write-Host "Created directory: $dirPath"
                                } catch {
                                    Write-Host "Directory may already exist: $dirPath"
                                }
                            }

                            # Create directories first
                            Create-FtpDirectory "$ftpDir/frontend"
                            Create-FtpDirectory "$ftpDir/backend"

                            # Upload frontend files
                            $localPath = "deploy-package\\frontend"
                            if (Test-Path $localPath) {
                                $files = Get-ChildItem $localPath -File
                                foreach ($file in $files) {
                                    $uri = "ftp://$ftpHost$ftpDir/frontend/" + $file.Name
                                    Write-Host "Uploading frontend:" $file.Name
                                    $request = [System.Net.FtpWebRequest]::Create($uri)
                                    $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
                                    $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
                                    $request.UseBinary = $true
                                    $content = [System.IO.File]::ReadAllBytes($file.FullName)
                                    $request.ContentLength = $content.Length
                                    $stream = $request.GetRequestStream()
                                    $stream.Write($content, 0, $content.Length)
                                    $stream.Close()
                                }
                            }

                            # Upload backend files
                            $localPath = "deploy-package\\backend"
                            if (Test-Path $localPath) {
                                $files = Get-ChildItem $localPath -File
                                foreach ($file in $files) {
                                    $uri = "ftp://$ftpHost$ftpDir/backend/" + $file.Name
                                    Write-Host "Uploading backend:" $file.Name
                                    $request = [System.Net.FtpWebRequest]::Create($uri)
                                    $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
                                    $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
                                    $request.UseBinary = $true
                                    $content = [System.IO.File]::ReadAllBytes($file.FullName)
                                    $request.ContentLength = $content.Length
                                    $stream = $request.GetRequestStream()
                                    $stream.Write($content, 0, $content.Length)
                                    $stream.Close()
                                }
                            }

                            Write-Host "Deployment completed successfully!"
                        '''
                    }
                }
            }
        }

        stage('Post-Deploy') {
            steps {
                echo 'Running post-deployment tasks...'
                echo "=================================="
                echo "MANUAL STEPS REQUIRED:"
                echo "1. Login to ByetHost VistaPanel"
                echo "2. Go to 'Node.js' section"
                echo "3. Create or restart your Node.js application"
                echo "4. Point it to the backend/server.js file"
                echo "=================================="
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
                bat """
                    if exist deploy-package rmdir /s /q deploy-package
                    echo Cleanup completed!
                """

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

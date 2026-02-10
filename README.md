# Simple Full-Stack Application

A simple full-stack web application with separate frontend and backend, ready for Jenkins CI/CD deployment to cPanel.

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

## Features

- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js with Express framework
- REST API endpoints
- CORS enabled for development
- Contact form with validation
- Health check endpoint
- Ready for Jenkins deployment to cPanel

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

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serve the frontend |
| GET | `/api/data` | Get sample data from backend |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/health` | Health check endpoint |

## Deployment to cPanel

### Manual Deployment

1. **Upload Files:**
   - Upload all files to your cPanel hosting
   - Place the `frontend` folder in `public_html`
   - Place the `backend` folder in a location outside `public_html`

2. **Setup Node.js App in cPanel:**
   - Go to "Setup Node.js App" in cPanel
   - Create a new application:
     - Node.js version: 18.x or higher
     - Application mode: Production
     - Application root: `backend`
     - Application URL: your domain
     - Application startup file: `server.js`

3. **Configure Environment Variables:**
   ```
   PORT=3000
   NODE_ENV=production
   ```

4. **Restart the Application:**
   - Click "Restart" in the Node.js app manager

### Jenkins CI/CD Deployment

#### 1. Configure Jenkins Credentials

Add the following credentials in Jenkins:
- `cpanel-username`: Your cPanel username
- `cpanel-password`: Your cPanel password
- `cpanel-api-key`: Your cPanel API key (recommended)

#### 2. Configure Jenkins Pipeline

1. Create a new Pipeline job in Jenkins
2. Configure the pipeline to use the `Jenkinsfile` from your repository
3. Add the following environment variables in job configuration:
   - `CPANEL_URL`: your-cpanel-domain.com
   - `CPANEL_DEPLOY_PATH`: /home/username/public_html

#### 3. Jenkins Pipeline Stages

The Jenkinsfile includes the following stages:
- **Code Checkout**: Pulls the latest code
- **Install Dependencies**: Installs npm packages
- **Build**: Builds the application
- **Test**: Runs tests (add your tests)
- **Deploy**: Deploys to cPanel
- **Post-Deploy**: Runs cleanup tasks

#### 4. Alternative Deployment Methods

For cPanel deployment, you can also use:

**FTP/SFTP:**
```groovy
sh '''
ncftp -u"$CPANEL_USERNAME" -p"$CPANEL_PASSWORD" "$CPANEL_URL" <<EOF
cd $CPANEL_DEPLOY_PATH
put -R *
quit
EOF
'''
```

**Git Deployment:**
```groovy
sh '''
ssh $CPANEL_USERNAME@$CPANEL_URL "cd $CPANEL_DEPLOY_PATH && git pull"
'''
```

## Troubleshooting

### Backend won't start
- Check if port 3000 is already in use
- Ensure all dependencies are installed (`npm install`)
- Check the error logs in cPanel

### Frontend can't connect to backend
- Ensure the backend is running
- Check CORS settings in `server.js`
- Verify the API_BASE_URL in `script.js`

### Jenkins deployment fails
- Verify all credentials are correctly configured
- Check Jenkins logs for specific errors
- Ensure FTP/SFTP access is enabled on your cPanel account

## Development Tips

- For local development, the API_BASE_URL automatically detects localhost
- Modify `backend/server.js` to add more API endpoints
- Update `frontend/script.js` to consume your new endpoints
- Add environment variables for sensitive configuration

## License

ISC

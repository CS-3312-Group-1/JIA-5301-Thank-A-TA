# Deployment Guide for Plesk

This guide explains how to deploy the Node.js + React application to a Plesk server.

## New Folder Structure

The project has been restructured to meet Plesk's deployment requirements. The backend and frontend are now organized as follows:

```
/
│
├── server.js                 <-- Express backend entry point
├── package.json              <-- Backend dependencies
├── .env                      <-- Environment variables
│
├── frontend/                 <-- React app
│   ├── package.json          <-- Frontend dependencies
│   ├── public/
│   ├── src/
│   └── ...
│
├── db/                       <-- Database models
├── auth.js                   <-- Auth logic
└── ...                       <-- Other backend files
```

## Deployment Steps

### 1. Local Preparation

First, ensure your project runs correctly locally.

1.  **Install Backend Dependencies:**
    From the project root, run:
    ```bash
    npm install
    ```

2.  **Install Frontend Dependencies & Build:**
    Navigate to the `frontend` directory, install its dependencies, and create a production build.
    ```bash
    cd frontend
    npm install
    npm run build
    cd ..
    ```

3.  **Run Locally:**
    From the project root, start the server:
    ```bash
    node server.js
    ```
    The application should now be accessible in your browser, with the backend serving the React app.

### 2. Deploying to Plesk

1.  **Upload Files:**
    Upload all files and folders from your project root (including the `frontend/build` directory) to the Plesk application's root directory.

2.  **Plesk Configuration:**
    - **Application Startup File:** Set this to `server.js`.
    - **Node.js Version:** Ensure the version matches the one specified in your `package.json` (`"engines"` field) or a compatible version.
    - **Install Dependencies:** In the Plesk interface, click **NPM install**. This will install the backend dependencies listed in the root `package.json`.
    - **Environment Variables:**
        - Create a `.env` file in the application root or use the Plesk interface to set the required environment variables (e.g., `PORT`, `JWT_SECRET`, `DATABASE_URL`, etc.).
        - **IMPORTANT**: Set `NODE_ENV=production`.

3.  **Start the Application:**
    Use the Plesk dashboard to start or restart the Node.js application.

Your application should now be live. The Express server will handle API requests and serve the static React application from the `frontend/build` folder.

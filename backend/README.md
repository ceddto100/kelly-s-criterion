# Backend API

## Setup Instructions

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
```

### Firebase Credentials

For security reasons, Firebase service account credentials should **not** be committed to version control.

You have two options for providing Firebase credentials:

1. **Environment Variable (Preferred for production):**
   - Set the `FIREBASE_SERVICE_ACCOUNT` environment variable with the entire JSON content of your service account key.
   - This keeps credentials out of the file system entirely.
   - Example: 
     ```
     FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
     ```

2. **Local File (Development only):**
   - Create a file named `service-account-key.json` in the `src/config` directory.
   - Add this file to your `.gitignore` to prevent it from being committed.
   - The application will automatically use this file if the environment variable is not set.

### Getting Firebase Credentials

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon) > Service accounts
4. Click "Generate new private key"
5. Save the downloaded file as `service-account-key.json` in the `src/config` directory

## Running the Server

```
npm install
npm run dev
``` 
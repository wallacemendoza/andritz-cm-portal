# Authentication Setup Instructions

This project now includes Firebase Authentication with admin user management. Follow these steps to complete the setup:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## 2. Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click on **Get Started**
3. Go to the **Sign-in method** tab
4. Enable **Email/Password** authentication
5. Click **Save**

## 3. Create Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in production mode** (we'll set up rules next)
4. Select a location for your database
5. Click **Enable**

## 4. Set Up Firestore Security Rules

1. In Firestore Database, go to the **Rules** tab
2. Replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read, only admins can write
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // All other collections - authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

## 5. Get Firebase Configuration

1. In your Firebase project, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the **Web** icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "Andritz CM Portal")
6. Copy the Firebase configuration object

## 6. Update Firebase Configuration in Your Code

1. Open `src/firebase.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## 7. Create the Admin User

Since this is the first user, you'll need to create the admin account manually:

### Option A: Using Firebase Console (Recommended)

1. Go to **Authentication** > **Users** in Firebase Console
2. Click **Add user**
3. Enter email: `wmendoza.dev@outlook.com`
4. Enter password: `Newlife407!`
5. Click **Add user**
6. Go to **Firestore Database**
7. Click **Start collection**
8. Collection ID: `users`
9. Document ID: (copy the UID from the user you just created in Authentication)
10. Add fields:
    - `email` (string): `wmendoza.dev@outlook.com`
    - `role` (string): `admin`
    - `createdAt` (string): `2026-02-25T14:00:00.000Z` (or current date)
11. Click **Save**

### Option B: Using Firebase CLI (Advanced)

If you have Firebase CLI installed, you can run this script:

```javascript
// Run this in Firebase Console > Firestore > Start collection
// Or use Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function createAdminUser() {
  try {
    // Create user in Authentication
    const userRecord = await auth.createUser({
      email: 'wmendoza.dev@outlook.com',
      password: 'Newlife407!',
      emailVerified: true
    });

    // Add user to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: 'wmendoza.dev@outlook.com',
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
```

## 8. Configure Email Settings (Optional but Recommended)

To enable password reset emails:

1. Go to **Authentication** > **Templates** in Firebase Console
2. Click on **Password reset**
3. Customize the email template if desired
4. Make sure your Firebase project has email sending enabled

## 9. Test the Application

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to `http://localhost:3000`
3. You should be redirected to the login page
4. Login with:
   - Email: `wmendoza.dev@outlook.com`
   - Password: `Newlife407!`

5. Once logged in, you should see a "Users" button in the navigation (admin only)
6. Click "Users" to access the user management page
7. Add new users by entering their email address
8. New users will receive an email to set their password

## 10. Adding New Users

As an admin, you can now:

1. Go to `/admin/users` route
2. Click "Add User"
3. Enter the user's email address
4. Select their role (User or Admin)
5. Click "Add User & Send Invitation"
6. The user will receive an email to set their password

## Security Notes

- Never commit your Firebase configuration with real credentials to public repositories
- Consider using environment variables for sensitive configuration
- The admin password should be changed after first login
- Regularly review user access in the Firebase Console
- Enable 2FA for admin accounts when possible

## Troubleshooting

### "User not authorized" error
- Make sure the user exists in both Firebase Authentication AND Firestore `users` collection
- Verify the user document has the correct `role` field

### Email not sending
- Check Firebase Console > Authentication > Templates
- Verify your Firebase project has email sending enabled
- Check spam folder for password reset emails

### "Permission denied" errors
- Verify Firestore security rules are set up correctly
- Make sure the user is authenticated
- Check that admin users have `role: 'admin'` in Firestore

## Support

For issues or questions, contact the development team.

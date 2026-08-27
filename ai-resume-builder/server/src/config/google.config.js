// ============================================
// google.config.js - Google OAuth Configuration
// ============================================

import { OAuth2Client } from 'google-auth-library';

const getGoogleClientId = () => (process.env.GOOGLE_CLIENT_ID || '').trim();

// Using async/await pattern (JS Essentials: Async/Await)
const verifyGoogleToken = async (credential) => {
  const clientId = getGoogleClientId();

  if (!clientId) {
    console.error('Google token verification failed: GOOGLE_CLIENT_ID missing in environment');
    const error = new Error('Server configuration error: GOOGLE_CLIENT_ID is missing');
    error.statusCode = 500;
    throw error;
  }

  try {
    const googleClient = new OAuth2Client(clientId);
    const ticket = await googleClient.verifyIdToken({ // Google token verification (Express.js: OAuth Integration)
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error('Google token verification failed:', error.message);
    const err = new Error(`Invalid Google token: ${error.message}`);
    err.statusCode = 401;
    throw err;
  }
};

export { verifyGoogleToken };

import * as dotenv from 'dotenv';
dotenv.config();

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Credentials } from 'google-auth-library/build/src/auth/credentials.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3005/oauth2callback';

export function getAuthenticatedClient(): OAuth2Client {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in your .env file');
  }

  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);
}

export async function getRefreshedToken(token: Credentials) {
  const oAuth2Client = getAuthenticatedClient();
  oAuth2Client.setCredentials(token);
  const refreshedToken = await oAuth2Client.refreshAccessToken();
  return refreshedToken.credentials;
}

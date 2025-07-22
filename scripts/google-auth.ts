import { getAuthenticatedClient } from '../lib/google.js';
import * as http from 'http';
import * as url from 'url';
import { storeToken } from '../lib/db.js';

const oAuth2Client = getAuthenticatedClient();

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const server = http.createServer(async (req, res) => {
  if (req.url && req.url.startsWith('/oauth2callback')) {
    const qs = new url.URL(req.url, 'http://localhost:3005').searchParams;
    const code = qs.get('code');
    if (code) {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      storeToken(tokens);
      res.end('Authentication successful! You can close this window.');
      server.close();
      process.exit(0);
    }
  } else {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    res.writeHead(302, { Location: authorizeUrl });
    res.end();
  }
});

server.listen(3005, () => {
  console.log('Please visit http://localhost:3005 to authorize the application.');
});

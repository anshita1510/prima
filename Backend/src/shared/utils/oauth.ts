import { OAuth2Client } from 'google-auth-library';

// Google OAuth configuration
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Microsoft OAuth configuration (you'll need to install @azure/msal-node)
// import { ConfidentialClientApplication } from '@azure/msal-node';

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
}

interface MicrosoftUserInfo {
  id: string;
  mail: string;
  displayName: string;
  givenName: string;
  surname: string;
}

export class OAuthService {
  /**
   * Verify Google OAuth token and extract user information
   */
  static async verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token payload');
      }

      return {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        given_name: payload.given_name!,
        family_name: payload.family_name!,
        picture: payload.picture
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  /**
   * Verify Microsoft OAuth token and extract user information
   * Note: This is a simplified implementation. In production, you should use Microsoft Graph API
   */
  static async verifyMicrosoftToken(token: string): Promise<MicrosoftUserInfo> {
    try {
      // In a real implementation, you would:
      // 1. Validate the token with Microsoft's token validation endpoint
      // 2. Extract user information from Microsoft Graph API
      // 3. Return the user information
      
      // For now, we'll return a mock implementation
      // You should replace this with actual Microsoft Graph API calls
      
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Microsoft user info');
      }

      const userInfo = await response.json();
      
      return {
        id: userInfo.id,
        mail: userInfo.mail || userInfo.userPrincipalName,
        displayName: userInfo.displayName,
        givenName: userInfo.givenName,
        surname: userInfo.surname
      };
    } catch (error) {
      console.error('Microsoft token verification failed:', error);
      throw new Error('Invalid Microsoft token');
    }
  }

  /**
   * Generate Google OAuth URL for frontend redirection
   */
  static getGoogleAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true
    });
  }

  /**
   * Generate Microsoft OAuth URL for frontend redirection
   */
  static getMicrosoftAuthUrl(): string {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI;
    const scopes = 'openid profile email User.Read';
    
    const params = new URLSearchParams({
      client_id: clientId!,
      response_type: 'code',
      redirect_uri: redirectUri!,
      scope: scopes,
      response_mode: 'query'
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }
}

export { GoogleUserInfo, MicrosoftUserInfo };
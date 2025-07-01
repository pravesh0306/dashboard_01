// google-drive-storage.js
// Google Drive Storage Manager using Google Identity Services (GIS)
// Replace YOUR_GOOGLE_CLIENT_ID with your real client ID

const GOOGLE_DRIVE_CONFIG = Object.freeze({ // Freeze the config object
  CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google OAuth Client ID
  SCOPES: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
  FOLDER_ID: '', // Optional: set to a folder ID to upload into a specific folder
});

// Make config globally accessible for validation
window.GOOGLE_DRIVE_CONFIG = GOOGLE_DRIVE_CONFIG;

class GoogleDriveStorageManager {
  constructor() {
    this.isReady = false;
    this.accessToken = null;
    this.tokenExpiresAt = 0; // Store token expiration time in ms
    this.authPromiseResolvers = null; // To store { resolve, reject } for the current auth promise
    this.currentAuthPromise = null; // To track an in-flight authentication attempt
    this.tokenClient = null;
    this.storageKey = 'google_drive_auth'; // localStorage key for persistent auth
    
    // Restore authentication state from localStorage
    this.restoreAuthState();
  }
  async initialize() {
    if (this.isReady) return;
    await this.loadGIS();
    this.initializeTokenClient();
    this.isReady = true;
  }
  // Save authentication state to localStorage
  saveAuthState() {
    if (this.accessToken && this.tokenExpiresAt > Date.now()) {
      const authData = {
        accessToken: this.accessToken,
        tokenExpiresAt: this.tokenExpiresAt
      };
      localStorage.setItem(this.storageKey, JSON.stringify(authData));
    } else {
      // Clear expired or invalid auth state
      localStorage.removeItem(this.storageKey);
    }
  }

  // Save user profile to localStorage
  saveUserProfile(profile) {
    localStorage.setItem(this.storageKey + '_profile', JSON.stringify(profile));
  }

  // Get saved user profile from localStorage
  getSavedUserProfile() {
    try {
      const stored = localStorage.getItem(this.storageKey + '_profile');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to get saved user profile:', error);
      return null;
    }
  }

  // Restore authentication state from localStorage
  restoreAuthState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const authData = JSON.parse(stored);
        // Only restore if token hasn't expired
        if (authData.tokenExpiresAt > Date.now()) {
          this.accessToken = authData.accessToken;
          this.tokenExpiresAt = authData.tokenExpiresAt;
          console.info('Restored authentication state from localStorage');
        } else {
          // Remove expired token
          localStorage.removeItem(this.storageKey);
          console.info('Removed expired authentication state');
        }
      }
    } catch (error) {
      console.warn('Failed to restore authentication state:', error);
      localStorage.removeItem(this.storageKey);
    }
  }

  loadGIS() {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  initializeTokenClient() {
    // Check if CLIENT_ID is properly configured before initializing
    if (GOOGLE_DRIVE_CONFIG.CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID' || !GOOGLE_DRIVE_CONFIG.CLIENT_ID) {
      console.warn('Google Client ID not configured - OAuth client initialization skipped');
      return;
    }
    
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
      scope: GOOGLE_DRIVE_CONFIG.SCOPES,
      callback: (response) => {
        // This callback is invoked when a token is issued or an error occurs
        if (response && response.access_token) {
          console.log('Token received/refreshed:', response);
          this.accessToken = response.access_token;
          // Google OAuth tokens typically expire in 1 hour (3600 seconds)
          // The response might include 'expires_in' (seconds)
          const expiresInSeconds = response.expires_in ? parseInt(response.expires_in, 10) : 3500; // Default to slightly less than 1hr
          this.tokenExpiresAt = Date.now() + (expiresInSeconds * 1000);
          
          // Save authentication state to localStorage
          this.saveAuthState();
          
          if (this.authPromiseResolvers) {
            this.authPromiseResolvers.resolve(true);
          }
        } else {
          const errorMsg = response.error || 'Google authentication failed: No access token received.';
          console.error('Token callback error:', response);
          if (this.authPromiseResolvers) {
            this.authPromiseResolvers.reject(new Error(errorMsg));
          }
        }
        this.authPromiseResolvers = null; // Clear resolvers after use
      }
    });
  }  async authenticate() {
    await this.initialize(); // Ensure GIS is loaded and tokenClient is initialized

    // Check if CLIENT_ID is properly configured
    if (GOOGLE_DRIVE_CONFIG.CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID' || !GOOGLE_DRIVE_CONFIG.CLIENT_ID) {
      throw new Error('Google Client ID not configured. Please set up your Google Client ID for cloud sync or use locally.');
    }

    // Check if tokenClient was successfully initialized
    if (!this.tokenClient) {
      throw new Error('Google OAuth client not initialized. Please check your configuration.');
    }

    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      console.log('Using existing valid token.');
      return true;
    }

    // If an authentication process is already in flight, return its promise
    if (this.currentAuthPromise) {
      console.log('Authentication already in progress, awaiting existing promise.');
      return this.currentAuthPromise;
    }

    console.log('Requesting new access token.');
    this.currentAuthPromise = new Promise((resolve, reject) => {
      this.authPromiseResolvers = { resolve, reject };

      // Check if scopes have already been granted to avoid unnecessary consent prompt
      if (this.tokenClient && google.accounts.oauth2.hasGrantedAllScopes(this.tokenClient, GOOGLE_DRIVE_CONFIG.SCOPES)) {
        this.tokenClient.requestAccessToken({}); // Request token without prompt if already granted
      } else if (this.tokenClient) {
        this.tokenClient.requestAccessToken({ prompt: 'consent' }); // Prompt for consent if not granted
      } else {
        reject(new Error('OAuth client not initialized'));
      }
    }).finally(() => {
      this.currentAuthPromise = null; // Clear the promise once it's settled
    });

    return this.currentAuthPromise;
  }  async uploadFile(file, fileName, onProgress = null) {
    if (!this.isReady) {
      await this.initialize();
    }
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) { // Check token before every upload
      await this.authenticate(); // This will get a new token if needed
    }

    const metadata = {
      name: fileName,
      mimeType: file.type || 'application/octet-stream', // Add mimeType
      ...(GOOGLE_DRIVE_CONFIG.FOLDER_ID ? { parents: [GOOGLE_DRIVE_CONFIG.FOLDER_ID] } : {})
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress((e.loaded / e.total) * 100);
        }
      };      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);          resolve({
            id: result.id,
            name: result.name,
            url: `https://drive.google.com/file/d/${result.id}/view`,
            downloadUrl: `https://www.googleapis.com/drive/v3/files/${result.id}?alt=media`, // Direct media link
            size: file.size,
            type: file.type,
            provider: 'googledrive',
            uploadedAt: new Date(),
            fileId: result.id
          });
        } else {
          let errorMsg = 'Google Drive upload failed';
          try {
            const errorObj = JSON.parse(xhr.responseText);
            if (errorObj.error && errorObj.error.message) {
              errorMsg += `: ${errorObj.error.message} (Status: ${xhr.status})`;
            } else {
              errorMsg += `: ${xhr.responseText}`;
            }
          } catch (e) {
            errorMsg += `: ${xhr.responseText}`;
          }
          reject(new Error(errorMsg));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
      xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
      xhr.send(form);
    });
  }

  async downloadFile(fileId, fileName) {
    if (!this.isReady) {
      await this.initialize();
    }
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.authenticate();
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Create blob URL and trigger download
          const blob = xhr.response;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName || 'download';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve(true);
        } else {
          reject(new Error(`Download failed: ${xhr.status} ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during download'));
      xhr.open('GET', `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
      xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
      xhr.send();
    });
  }
  async getUserProfile() {
    if (!this.isReady) {
      await this.initialize();
    }
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.authenticate();
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const profile = JSON.parse(xhr.responseText);
          // Save profile to localStorage for persistence
          this.saveUserProfile(profile);
          resolve(profile);
        } else {
          reject(new Error(`Failed to get user profile: ${xhr.status} ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error getting user profile'));
      xhr.open('GET', 'https://www.googleapis.com/oauth2/v2/userinfo');
      xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
      xhr.send();
    });
  }

  isAuthenticated() {
    // Return false if CLIENT_ID is not configured
    if (GOOGLE_DRIVE_CONFIG.CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID' || !GOOGLE_DRIVE_CONFIG.CLIENT_ID) {
      return false;
    }
    return this.accessToken && Date.now() < this.tokenExpiresAt;
  }  logout() {
    const token = this.accessToken;
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    
    // Clear authentication state and user profile from localStorage
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.storageKey + '_profile');
    
    // Revoke the token if possible
    if (token && window.google && window.google.accounts && window.google.accounts.oauth2) {
      try {
        google.accounts.oauth2.revoke(token);
      } catch (error) {
        console.warn('Failed to revoke token:', error);
      }
    }
  }
}

// Initialize Google Drive storage manager
window.cloudStorage = new GoogleDriveStorageManager();
document.addEventListener('DOMContentLoaded', () => {
  window.cloudStorage.initialize()
    .then(() => console.log('Google Drive Storage Manager initialized.'))
    .catch(error => {
      console.warn('Google Drive initialization failed:', error);
    });
});

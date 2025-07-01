// Multi-user utilities for the Varoinmarwah Admin Dashboard
// This file contains helper functions for managing user-specific Google Drive folders

/**
 * This utility extends the Google Drive Storage Manager with multi-user capabilities
 * It ensures each user's files are stored in their own folder in their Google Drive
 */

// Import GoogleDriveStorageManager if it's not already available
if (typeof GoogleDriveStorageManager === 'undefined') {
  // In Node.js environment
  if (typeof require !== 'undefined') {
    const { GoogleDriveStorageManager } = require('./google-drive-storage.js');
  } else {
    console.warn('GoogleDriveStorageManager is not defined. Make sure google-drive-storage.js is loaded before this file.');
  }
}

// Add the findOrCreateFolder method to the GoogleDriveStorageManager prototype
GoogleDriveStorageManager.prototype.findOrCreateFolder = async function(folderName) {
  if (!this.isReady) await this.initialize();
  if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
    await this.authenticate();
  }
  
  // First, look for an existing folder with this name
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search for folder: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // If folder exists, return its ID
    if (data.files && data.files.length > 0) {
      console.log(`Found existing folder "${folderName}" with ID: ${data.files[0].id}`);
      return data.files[0].id;
    }
    
    // If folder doesn't exist, create it
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        })
      }
    );
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create folder: ${createResponse.statusText}`);
    }
    
    const folder = await createResponse.json();
    console.log(`Created new folder "${folderName}" with ID: ${folder.id}`);
    return folder.id;
  } catch (error) {
    console.error('Error finding or creating folder:', error);
    throw error;
  }
};

// Function to modify the upload flow to use user-specific folders
GoogleDriveStorageManager.prototype.originalUploadFile = GoogleDriveStorageManager.prototype.uploadFile;
GoogleDriveStorageManager.prototype.uploadFile = async function(file, fileName, onProgress = null) {
  try {
    // Get or create the app folder for this user
    const folderId = await this.findOrCreateFolder(GOOGLE_DRIVE_CONFIG.FOLDER_NAME);
    
    // Store the folder ID in localStorage for future reference
    localStorage.setItem('app_folder_id', folderId);
    console.log(`Using folder ID: ${folderId} for upload`);
    
    // Check authentication again
    if (!this.isReady) await this.initialize();
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.authenticate();
    }
    
    // Upload directly to the user-specific folder
    if (!file) {
      throw new Error('File is required');
    }

    let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';
    
    // Prepare metadata including the parent folder ID
    const metadata = {
      name: fileName || file.name,
      mimeType: file.type,
      parents: [folderId] // This ensures the file is uploaded to the user's app folder
    };
    
    // Start resumable upload session
    const sessionResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': file.type,
        'X-Upload-Content-Length': file.size
      },
      body: JSON.stringify(metadata)
    });
    
    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text();
      throw new Error(`Failed to start upload session: ${errorText}`);
    }
    
    // Get the upload URL from the Location header
    const location = sessionResponse.headers.get('Location');
    
    // Upload the file content
    const uploadResponse = await fetch(location, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload file: ${errorText}`);
    }
    
    const result = await uploadResponse.json();
    console.log('File uploaded successfully:', result);
    
    // Return the result with additional information
    return {
      ...result,
      folder: GOOGLE_DRIVE_CONFIG.FOLDER_NAME,
      folderId: folderId
    };
  } catch (error) {
    console.error('Enhanced upload failed:', error);
    throw error;
  }
};

console.log('Multi-user utilities loaded');

// Add debug logging function
window.debugDriveAuth = async function() {
  try {
    const manager = window.googleDriveManager || new GoogleDriveStorageManager();
    await manager.initialize();
    
    if (!manager.accessToken) {
      console.log('Not authenticated. Please authenticate first.');
      return;
    }
    
    // Log current auth status
    console.log('Current authentication status:');
    console.log('- Access token valid:', manager.accessToken ? 'Yes' : 'No');
    console.log('- Token expires at:', new Date(manager.tokenExpiresAt).toLocaleString());
    console.log('- Time remaining:', Math.floor((manager.tokenExpiresAt - Date.now()) / 1000), 'seconds');
    
    // Check folder existence
    const folderName = GOOGLE_DRIVE_CONFIG.FOLDER_NAME;
    try {
      console.log(`Checking for ${folderName} folder...`);
      const folderId = await manager.findOrCreateFolder(folderName);
      console.log(`${folderName} folder ID:`, folderId);
      
      // Check folder contents
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false`,
        {
          headers: { Authorization: `Bearer ${manager.accessToken}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Found ${data.files?.length || 0} files in the ${folderName} folder:`, 
          data.files?.map(f => f.name) || []);
      } else {
        console.error('Failed to list folder contents:', await response.text());
      }
    } catch (error) {
      console.error('Error checking folder:', error);
    }
    
    return 'Debug completed';
  } catch (error) {
    console.error('Debug error:', error);
    return `Debug error: ${error.message}`;
  }
};

# 🔒 Security Setup Guide

## ⚠️ **API Key Security**

**IMPORTANT**: The Google Client ID has been removed from all files for security.

## 🔧 **Setup Your Google Drive Integration**

### **Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API

### **Step 2: Create OAuth2 Credentials**
1. Go to **APIs & Credentials** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Authorized origins: Add your domain (e.g., `https://pravesh0306.github.io`)
5. Copy the **Client ID**

### **Step 3: Configure Your Dashboard**
Replace `YOUR_GOOGLE_CLIENT_ID` in `google-drive-storage.js`:

```javascript
const GOOGLE_DRIVE_CONFIG = Object.freeze({
  CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID_HERE',
  SCOPES: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
  FOLDER_ID: '',
});
```

### **Step 4: Security Best Practices**
- ✅ **Never commit API keys** to public repositories
- ✅ **Use environment variables** for production
- ✅ **Restrict OAuth domains** to your website only
- ✅ **Set up authorized users** in OAuth consent screen

## 🚀 **For GitHub Pages Deployment**

1. **Deploy without Google Drive** (current state - secure)
2. **Add your Client ID** only after deployment
3. **Test locally first** before going live

## 📱 **Local Development**
The dashboard works perfectly **without Google Drive** using localStorage. You can:
- ✅ Use all features locally
- ✅ Add Google Drive later when ready
- ✅ Deploy safely to GitHub Pages

**Current state is secure for deployment!** 🔒

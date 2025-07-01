/**
 * File Manager
 * Handles file uploads, downloads, and management with Google Drive integration
 */

class FileManager {
  constructor() {
    this.files = [];
    this.currentUpload = null;
    this.currentFile = null;
    this.searchTerm = '';
    this.filterType = 'all';
    this.sortBy = 'date_desc';
    this.storageKey = 'file_manager_files';
    
    // Initialize all the DOM elements and event listeners
    this.initElements();
    this.bindEvents();
    
    // Load files from localStorage if they exist
    this.loadFiles();
    
    // Initial file list render
    this.renderFiles();
  }
  
  /**
   * Initialize DOM elements
   */
  initElements() {
    // Upload elements
    this.uploadAreaElem = document.getElementById('uploadArea');
    this.dropZoneElem = document.getElementById('dropZone');
    this.fileInputElem = document.getElementById('fileInput');
    this.uploadProgressElem = document.getElementById('uploadProgress');
    this.uploadFileNameElem = document.getElementById('uploadFileName');
    this.uploadPercentElem = document.getElementById('uploadPercent');
    this.uploadProgressBarElem = document.getElementById('uploadProgressBar');
    this.cancelUploadBtnElem = document.getElementById('cancelUploadBtn');
    
    // File list elements
    this.noFilesMessageElem = document.getElementById('noFilesMessage');
    this.filesListElem = document.getElementById('filesList');
    
    // Filter and search elements
    this.searchFilesElem = document.getElementById('searchFiles');
    this.fileTypeFilterElem = document.getElementById('fileTypeFilter');
    this.fileSortByElem = document.getElementById('fileSortBy');
    
    // Action buttons
    this.uploadFilesBtnElem = document.getElementById('uploadFilesBtn');
    this.uploadFirstFileBtnElem = document.getElementById('uploadFirstFileBtn');
    this.refreshFilesBtnElem = document.getElementById('refreshFilesBtn');
    
    // Preview modal elements
    this.filePreviewModalElem = document.getElementById('filePreviewModal');
    this.previewFileNameElem = document.getElementById('previewFileName');
    this.previewContentElem = document.getElementById('previewContent');
    this.previewFileSizeElem = document.getElementById('previewFileSize');
    this.previewFileTypeElem = document.getElementById('previewFileType');
    this.closePreviewBtnElem = document.getElementById('closePreviewBtn');
    this.downloadFileBtnElem = document.getElementById('downloadFileBtn');
    this.deleteFileBtnElem = document.getElementById('deleteFileBtn');
  }
  
  /**
   * Bind event listeners to elements
   */
  bindEvents() {
    // Upload button events
    this.uploadFilesBtnElem.addEventListener('click', () => this.toggleUploadArea());
    this.uploadFirstFileBtnElem.addEventListener('click', () => this.toggleUploadArea(true));
    
    // File input change event
    this.fileInputElem.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFiles(e.target.files);
      }
    });
    
    // Drag and drop events
    this.dropZoneElem.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZoneElem.classList.add('border-[#0066cc]', 'bg-[#f7f9fc]');
    });
    
    this.dropZoneElem.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZoneElem.classList.remove('border-[#0066cc]', 'bg-[#f7f9fc]');
    });
    
    this.dropZoneElem.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZoneElem.classList.remove('border-[#0066cc]', 'bg-[#f7f9fc]');
      
      if (e.dataTransfer.files.length > 0) {
        this.handleFiles(e.dataTransfer.files);
      }
    });
    
    // Cancel upload button
    this.cancelUploadBtnElem.addEventListener('click', () => this.cancelUpload());
    
    // Search and filter events
    this.searchFilesElem.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.renderFiles();
    });
    
    this.fileTypeFilterElem.addEventListener('change', (e) => {
      this.filterType = e.target.value;
      this.renderFiles();
    });
    
    this.fileSortByElem.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.renderFiles();
    });
    
    // Refresh files button
    this.refreshFilesBtnElem.addEventListener('click', () => this.refreshFiles());
    
    // Preview modal events
    this.closePreviewBtnElem.addEventListener('click', () => this.closePreview());
    this.downloadFileBtnElem.addEventListener('click', () => this.downloadCurrentFile());
    this.deleteFileBtnElem.addEventListener('click', () => this.deleteCurrentFile());
    
    // Close modal when clicking outside
    this.filePreviewModalElem.addEventListener('click', (e) => {
      if (e.target === this.filePreviewModalElem) {
        this.closePreview();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.filePreviewModalElem.classList.contains('hidden')) {
        this.closePreview();
      }
    });
  }
  
  /**
   * Toggle the visibility of the upload area
   * @param {boolean} show - Force show if true
   */
  toggleUploadArea(show = false) {
    if (show) {
      this.uploadAreaElem.classList.remove('hidden');
    } else {
      this.uploadAreaElem.classList.toggle('hidden');
    }
    
    // Reset upload progress if hiding
    if (this.uploadAreaElem.classList.contains('hidden')) {
      this.resetUploadProgress();
    }
  }
  
  /**
   * Handle files selected for upload
   * @param {FileList} files - The files to upload
   */
  async handleFiles(files) {
    if (!window.app.cloudStorage) {
      this.showNotification('Cloud storage not available. Please log in.', 'error');
      return;
    }
    
    // Hide the drop zone and show progress
    this.dropZoneElem.classList.add('hidden');
    this.uploadProgressElem.classList.remove('hidden');
    
    for (const file of Array.from(files)) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.showNotification(`File ${file.name} exceeds the 10MB limit`, 'error');
        continue;
      }
      
      try {
        // Set current upload file
        this.currentUpload = file;
        this.uploadFileNameElem.textContent = file.name;
        this.uploadPercentElem.textContent = '0%';
        this.uploadProgressBarElem.style.width = '0%';
        
        // Upload the file
        const fileInfo = await window.app.cloudStorage.uploadFile(
          file, 
          file.name, 
          (progress) => {
            this.uploadProgressBarElem.style.width = `${progress}%`;
            this.uploadPercentElem.textContent = `${progress}%`;
          }
        );
        
        if (fileInfo) {
          // Format the file info and add to files array
          const formattedFile = {
            id: fileInfo.id,
            name: fileInfo.name,
            size: file.size,
            type: file.type,
            url: fileInfo.url,
            downloadUrl: fileInfo.downloadUrl,
            uploadedAt: new Date().toISOString(),
            previewUrl: this.getPreviewUrl(fileInfo, file)
          };
          
          // Add to files array and save to localStorage
          this.files.unshift(formattedFile);
          this.saveFiles();
          
          // Re-render the files list
          this.renderFiles();
          
          this.showNotification(`${file.name} uploaded successfully`, 'success');
        }
      } catch (error) {
        console.error('Upload error:', error);
        this.showNotification(`Failed to upload ${file.name}: ${error.message}`, 'error');
      } finally {
        this.currentUpload = null;
      }
    }
    
    // Reset the file input
    this.fileInputElem.value = '';
    
    // Show the drop zone again and hide progress
    this.dropZoneElem.classList.remove('hidden');
    this.uploadProgressElem.classList.add('hidden');
  }
  
  /**
   * Cancel the current upload
   */
  cancelUpload() {
    if (window.app.cloudStorage) {
      window.app.cloudStorage.cancelUpload();
    }
    
    this.resetUploadProgress();
    this.showNotification('Upload cancelled', 'info');
  }
  
  /**
   * Reset the upload progress UI
   */
  resetUploadProgress() {
    this.uploadFileNameElem.textContent = '';
    this.uploadPercentElem.textContent = '0%';
    this.uploadProgressBarElem.style.width = '0%';
    this.uploadProgressElem.classList.add('hidden');
    this.dropZoneElem.classList.remove('hidden');
  }
  
  /**
   * Get preview URL based on file type
   * @param {Object} fileInfo - Google Drive file info 
   * @param {File} file - Original file object
   * @returns {string} Preview URL
   */
  getPreviewUrl(fileInfo, file) {
    // Use thumbnail for images
    if (file.type.startsWith('image/')) {
      return fileInfo.url;
    }
    
    // Use Google Docs viewer for PDFs and documents
    if (file.type === 'application/pdf' || 
        file.type.includes('document') || 
        file.type.includes('spreadsheet')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fileInfo.url)}&embedded=true`;
    }
    
    // Default: no preview available
    return null;
  }
  
  /**
   * Load files from localStorage
   */
  loadFiles() {
    try {
      const storedFiles = localStorage.getItem(this.storageKey);
      if (storedFiles) {
        this.files = JSON.parse(storedFiles);
      }
    } catch (error) {
      console.error('Failed to load files from localStorage:', error);
      this.files = [];
    }
  }
  
  /**
   * Save files to localStorage
   */
  saveFiles() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.files));
    } catch (error) {
      console.error('Failed to save files to localStorage:', error);
    }
  }
  
  /**
   * Filter files based on current filters and search term
   * @returns {Array} Filtered files
   */
  getFilteredFiles() {
    let filteredFiles = [...this.files];
    
    // Apply search filter
    if (this.searchTerm) {
      filteredFiles = filteredFiles.filter(file => 
        file.name.toLowerCase().includes(this.searchTerm)
      );
    }
    
    // Apply type filter
    if (this.filterType !== 'all') {
      switch (this.filterType) {
        case 'image':
          filteredFiles = filteredFiles.filter(file => file.type.startsWith('image/'));
          break;
        case 'document':
          filteredFiles = filteredFiles.filter(file => 
            file.type.includes('pdf') || 
            file.type.includes('document') || 
            file.type.includes('spreadsheet') ||
            file.type.includes('word') ||
            file.type.includes('excel') ||
            file.type.includes('powerpoint') ||
            file.type.includes('text')
          );
          break;
        case 'other':
          filteredFiles = filteredFiles.filter(file => 
            !file.type.startsWith('image/') && 
            !file.type.includes('pdf') &&
            !file.type.includes('document') &&
            !file.type.includes('spreadsheet') &&
            !file.type.includes('word') &&
            !file.type.includes('excel') &&
            !file.type.includes('powerpoint') &&
            !file.type.includes('text')
          );
          break;
      }
    }
    
    // Apply sorting
    filteredFiles.sort((a, b) => {
      switch (this.sortBy) {
        case 'date_desc':
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        case 'date_asc':
          return new Date(a.uploadedAt) - new Date(b.uploadedAt);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'size_desc':
          return b.size - a.size;
        case 'size_asc':
          return a.size - b.size;
        default:
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      }
    });
    
    return filteredFiles;
  }
  
  /**
   * Render the files list
   */
  renderFiles() {
    const filteredFiles = this.getFilteredFiles();
    
    // Show/hide no files message
    if (this.files.length === 0) {
      this.noFilesMessageElem.classList.remove('hidden');
      this.filesListElem.classList.add('hidden');
    } else if (filteredFiles.length === 0) {
      this.noFilesMessageElem.textContent = 'No files match your search';
      this.noFilesMessageElem.classList.remove('hidden');
      this.filesListElem.classList.add('hidden');
    } else {
      this.noFilesMessageElem.classList.add('hidden');
      this.filesListElem.classList.remove('hidden');
    }
    
    // Clear the files list
    this.filesListElem.innerHTML = '';
    
    // Add each file to the grid
    filteredFiles.forEach(file => {
      const fileCard = document.createElement('div');
      fileCard.className = 'bg-white rounded-lg border border-[#dde1e3] overflow-hidden transition-all hover:shadow-md';
      
      // Determine file icon based on type
      let fileIcon = this.getFileIcon(file.type);
      let previewThumbnail = '';
      
      // For images, use thumbnail
      if (file.type.startsWith('image/')) {
        previewThumbnail = `
          <div class="relative h-32 bg-[#f7f9fc] overflow-hidden">
            <img src="${file.url}" alt="${file.name}" class="absolute inset-0 w-full h-full object-cover">
          </div>
        `;
      } else {
        previewThumbnail = `
          <div class="h-32 bg-[#f7f9fc] flex items-center justify-center">
            ${fileIcon}
          </div>
        `;
      }
      
      // Format the file size
      const formattedSize = this.formatFileSize(file.size);
      
      // Format the date
      const uploadDate = new Date(file.uploadedAt);
      const formattedDate = uploadDate.toLocaleDateString(undefined, { 
        year: 'numeric', month: 'short', day: 'numeric' 
      });
      
      fileCard.innerHTML = `
        ${previewThumbnail}
        <div class="p-4">
          <h3 class="font-medium text-[#121416] text-sm truncate" title="${file.name}">${file.name}</h3>
          <div class="flex justify-between items-center mt-2">
            <span class="text-xs text-[#6a7681]">${formattedSize}</span>
            <span class="text-xs text-[#6a7681]">${formattedDate}</span>
          </div>
        </div>
        <div class="border-t border-[#dde1e3] bg-[#f8fafc] p-3 flex justify-end gap-2">
          <button class="preview-btn text-xs text-[#0066cc] hover:text-[#0052a3]" data-id="${file.id}">
            Preview
          </button>
          <button class="download-btn text-xs text-[#0066cc] hover:text-[#0052a3]" data-id="${file.id}">
            Download
          </button>
        </div>
      `;
      
      // Add click handlers
      const previewBtn = fileCard.querySelector('.preview-btn');
      const downloadBtn = fileCard.querySelector('.download-btn');
      
      previewBtn.addEventListener('click', () => this.previewFile(file.id));
      downloadBtn.addEventListener('click', () => this.downloadFile(file.id));
      
      // Add thumbnail click handler for preview
      const thumbnail = fileCard.querySelector('div.h-32, img');
      if (thumbnail) {
        thumbnail.style.cursor = 'pointer';
        thumbnail.addEventListener('click', () => this.previewFile(file.id));
      }
      
      this.filesListElem.appendChild(fileCard);
    });
  }
  
  /**
   * Format file size for display
   * @param {number} bytes - The file size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / 1048576).toFixed(1) + ' MB';
    }
  }
  
  /**
   * Get SVG icon for file type
   * @param {string} mimeType - The file MIME type
   * @returns {string} SVG icon HTML
   */
  getFileIcon(mimeType) {
    let iconHtml = '';
    let iconColor = '#6a7681';
    
    if (mimeType.startsWith('image/')) {
      iconColor = '#34D399';
      iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="${iconColor}">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      `;
    } else if (mimeType === 'application/pdf') {
      iconColor = '#EF4444';
      iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="${iconColor}">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 9h4m-4 4h4m-4 4h4" />
        </svg>
      `;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      iconColor = '#3B82F6';
      iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="${iconColor}">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      `;
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      iconColor = '#22C55E';
      iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="${iconColor}">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      `;
    } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
      iconColor = '#F59E0B';
      iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="${iconColor}">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      `;
    } else {
      iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="${iconColor}">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      `;
    }
    
    return iconHtml;
  }
  
  /**
   * Preview a file
   * @param {string} fileId - The ID of the file to preview
   */
  previewFile(fileId) {
    const file = this.files.find(f => f.id === fileId);
    if (!file) return;
    
    this.currentFile = file;
    
    // Set file info in modal
    this.previewFileNameElem.textContent = file.name;
    this.previewFileSizeElem.textContent = this.formatFileSize(file.size);
    this.previewFileTypeElem.textContent = file.type;
    
    // Set the preview content
    let previewContent = '';
    
    if (file.type.startsWith('image/')) {
      previewContent = `<img src="${file.url}" alt="${file.name}" class="max-w-full max-h-[70vh] object-contain">`;
    } else if (file.type === 'application/pdf' || file.previewUrl) {
      const previewUrl = file.previewUrl || `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`;
      previewContent = `<iframe src="${previewUrl}" width="100%" height="500" frameborder="0"></iframe>`;
    } else {
      previewContent = `
        <div class="text-center p-8">
          ${this.getFileIcon(file.type)}
          <p class="mt-4 text-[#6a7681]">Preview not available for this file type</p>
          <button id="previewDownloadBtn" class="mt-4 bg-[#0066cc] hover:bg-[#0052a3] text-white px-4 py-2 rounded-lg">
            Download to view
          </button>
        </div>
      `;
    }
    
    this.previewContentElem.innerHTML = previewContent;
    
    // Add event listener for download button in preview content
    const previewDownloadBtn = this.previewContentElem.querySelector('#previewDownloadBtn');
    if (previewDownloadBtn) {
      previewDownloadBtn.addEventListener('click', () => this.downloadCurrentFile());
    }
    
    // Show the modal
    this.filePreviewModalElem.classList.remove('hidden');
  }
  
  /**
   * Close the file preview modal
   */
  closePreview() {
    this.filePreviewModalElem.classList.add('hidden');
    this.currentFile = null;
    this.previewContentElem.innerHTML = '';
  }
  
  /**
   * Download a file by ID
   * @param {string} fileId - The ID of the file to download
   */
  downloadFile(fileId) {
    const file = this.files.find(f => f.id === fileId);
    if (!file || !file.downloadUrl) {
      this.showNotification('Download link not available', 'error');
      return;
    }
    
    window.open(file.downloadUrl, '_blank');
  }
  
  /**
   * Download the currently previewed file
   */
  downloadCurrentFile() {
    if (this.currentFile && this.currentFile.downloadUrl) {
      window.open(this.currentFile.downloadUrl, '_blank');
    }
  }
  
  /**
   * Delete the currently previewed file
   */
  async deleteCurrentFile() {
    if (!this.currentFile) return;
    
    if (!confirm(`Are you sure you want to delete ${this.currentFile.name}?`)) {
      return;
    }
    
    try {
      // Delete from Google Drive if cloud storage is available
      if (window.app.cloudStorage && this.currentFile.id) {
        await window.app.cloudStorage.deleteFile(this.currentFile.id);
      }
      
      // Remove from local files array
      this.files = this.files.filter(f => f.id !== this.currentFile.id);
      this.saveFiles();
      
      // Close the preview modal
      this.closePreview();
      
      // Re-render files list
      this.renderFiles();
      
      this.showNotification('File deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting file:', error);
      this.showNotification(`Failed to delete file: ${error.message}`, 'error');
    }
  }
  
  /**
   * Refresh files list from Google Drive
   */
  async refreshFiles() {
    if (!window.app.cloudStorage) {
      this.showNotification('Cloud storage not available. Please log in.', 'error');
      return;
    }
    
    try {
      // Get files from Google Drive
      const driveFiles = await window.app.cloudStorage.listFiles();
      
      if (driveFiles && driveFiles.length > 0) {
        // Update local files array
        this.files = driveFiles.map(file => ({
          id: file.id,
          name: file.name,
          size: file.size || 0,
          type: file.mimeType || 'application/octet-stream',
          url: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
          downloadUrl: file.webContentLink || `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          uploadedAt: file.createdTime || new Date().toISOString(),
          previewUrl: this.getPreviewUrlFromMimeType(file)
        }));
        
        // Save to localStorage
        this.saveFiles();
        
        // Re-render files list
        this.renderFiles();
        
        this.showNotification(`Refreshed ${driveFiles.length} files from Google Drive`, 'success');
      } else {
        this.showNotification('No files found in Google Drive', 'info');
      }
    } catch (error) {
      console.error('Error refreshing files:', error);
      this.showNotification(`Failed to refresh files: ${error.message}`, 'error');
    }
  }
  
  /**
   * Get preview URL based on MIME type from Google Drive
   * @param {Object} file - Google Drive file object
   * @returns {string|null} Preview URL
   */
  getPreviewUrlFromMimeType(file) {
    if (!file.mimeType) return null;
    
    if (file.mimeType.startsWith('image/')) {
      return file.webViewLink;
    }
    
    if (file.mimeType === 'application/pdf' || 
        file.mimeType.includes('document') || 
        file.mimeType.includes('spreadsheet')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(file.webViewLink)}&embedded=true`;
    }
    
    return null;
  }
  
  /**
   * Show a notification message
   * @param {string} message - The message to display
   * @param {string} type - The type of notification (success, error, info)
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-opacity duration-300';
    
    // Set color based on type
    switch (type) {
      case 'success':
        notification.classList.add('bg-green-500', 'text-white');
        break;
      case 'error':
        notification.classList.add('bg-red-500', 'text-white');
        break;
      default:
        notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Add delete file method to GoogleDriveStorageManager if it doesn't exist
if (typeof GoogleDriveStorageManager !== 'undefined' && 
    !GoogleDriveStorageManager.prototype.deleteFile) {
  
  /**
   * Delete a file from Google Drive
   * @param {string} fileId - The ID of the file to delete
   */
  GoogleDriveStorageManager.prototype.deleteFile = async function(fileId) {
    if (!this.isReady) await this.initialize();
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.authenticate();
    }
    
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || 'Failed to delete file');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };
}

// Add list files method to GoogleDriveStorageManager if it doesn't exist
if (typeof GoogleDriveStorageManager !== 'undefined' && 
    !GoogleDriveStorageManager.prototype.listFiles) {
  
  /**
   * List files from Google Drive
   * @returns {Array} List of files
   */
  GoogleDriveStorageManager.prototype.listFiles = async function() {
    if (!this.isReady) await this.initialize();
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.authenticate();
    }
    
    try {
      // Get or create the app folder
      let folderId;
      try {
        folderId = await this.findOrCreateFolder(GOOGLE_DRIVE_CONFIG.FOLDER_NAME);
      } catch (error) {
        console.warn('Could not find or create app folder, will list all files:', error);
      }
      
      // Build query to list files in the app folder
      let query = folderId ? `'${folderId}' in parents` : '';
      
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink)`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || 'Failed to list files');
      }
      
      const result = await response.json();
      return result.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  };
}

// Add cancel upload method to GoogleDriveStorageManager if it doesn't exist
if (typeof GoogleDriveStorageManager !== 'undefined' && 
    !GoogleDriveStorageManager.prototype.cancelUpload) {
  
  GoogleDriveStorageManager.prototype.cancelUpload = function() {
    if (this.currentXhr) {
      this.currentXhr.abort();
      this.currentXhr = null;
    }
  };
}

// Initialize file manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (typeof GoogleDriveStorageManager !== 'undefined') {
    window.fileManager = new FileManager();
  } else {
    console.error('GoogleDriveStorageManager is not available');
    alert('Cloud storage functionality is not available. Please make sure you are logged in.');
  }
});

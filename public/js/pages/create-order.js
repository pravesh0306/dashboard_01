/**
 * Create Order Page Controller
 * Handles order creation, file uploads, and form submissions
 */

// Prevent redefinition
if (typeof CreateOrderController === 'undefined') {
  class CreateOrderController {
    constructor() {
      this.initializeElements();
      this.bindEvents();
    }    /**
     * Initialize DOM elements and references
     */
    initializeElements() {
      this.form = document.getElementById('createOrderForm');
      
      // Upload buttons
      this.fabricUploadBtn = document.getElementById('fabricUploadBtn');
      this.fabricAttachment = document.getElementById('fabricAttachment');
      this.styleReferenceUploadBtn = document.getElementById('styleReferenceUploadBtn');
      this.styleReferenceAttachment = document.getElementById('styleReferenceAttachment');
      this.attachmentsUploadBtn = document.getElementById('attachmentsUploadBtn');
      this.additionalAttachments = document.getElementById('additionalAttachments');

      // New elements for enhanced file management
      this.selectedFilesContainer = document.getElementById('selectedFilesContainer');
      this.selectedFilesList = document.getElementById('selectedFilesList');
      this.addMoreFilesBtn = document.getElementById('addMoreFilesBtn');
      this.clearAllFilesBtn = document.getElementById('clearAllFilesBtn');

      // Selected files storage
      this.uploadedFiles = {
        fabric: null,
        styleReference: null,
        additional: []
      };
    }

    /**
     * Bind event listeners to elements
     */
    bindEvents() {
      // Form submission
      if (this.form) {
        this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
      }

      // File upload buttons
      if (this.fabricUploadBtn && this.fabricAttachment) {
        this.fabricUploadBtn.addEventListener('click', () => this.fabricAttachment.click());
        this.fabricAttachment.addEventListener('change', (e) => this.handleFileSelection(e, 'fabric'));
      }

      if (this.styleReferenceUploadBtn && this.styleReferenceAttachment) {
        this.styleReferenceUploadBtn.addEventListener('click', () => this.styleReferenceAttachment.click());
        this.styleReferenceAttachment.addEventListener('change', (e) => this.handleFileSelection(e, 'styleReference'));
      }      if (this.attachmentsUploadBtn && this.additionalAttachments) {
        this.attachmentsUploadBtn.addEventListener('click', () => this.additionalAttachments.click());
        this.additionalAttachments.addEventListener('change', (e) => this.handleFileSelection(e, 'additional'));
      }

      // New enhanced file management buttons
      if (this.addMoreFilesBtn) {
        this.addMoreFilesBtn.addEventListener('click', () => this.additionalAttachments.click());
      }

      if (this.clearAllFilesBtn) {
        this.clearAllFilesBtn.addEventListener('click', () => this.clearAllFiles());
      }

      // Setup drag and drop for file upload areas
      this.setupDragAndDrop();
    }    /**
     * Set up drag and drop functionality for file upload areas
     */
    setupDragAndDrop() {
      const dropZones = document.querySelectorAll('.border-dashed');
      
      dropZones.forEach(zone => {
        // Determine which attachment this zone is for
        let fileType = 'additional';
        if (zone.contains(this.fabricUploadBtn)) {
          fileType = 'fabric';
        } else if (zone.contains(this.styleReferenceUploadBtn)) {
          fileType = 'styleReference';
        }

        // Add drag and drop event listeners
        zone.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          zone.classList.add('border-[#0066cc]', 'bg-[#f0f8ff]');
          
          // Add visual indicator
          const indicator = zone.querySelector('.drag-indicator');
          if (!indicator) {
            const dragIndicator = document.createElement('div');
            dragIndicator.className = 'drag-indicator absolute inset-0 bg-[#0066cc] bg-opacity-10 rounded-xl flex items-center justify-center pointer-events-none';
            dragIndicator.innerHTML = `
              <div class="text-[#0066cc] text-sm font-medium">
                <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                Drop files here
              </div>
            `;
            zone.style.position = 'relative';
            zone.appendChild(dragIndicator);
          }
        });

        zone.addEventListener('dragleave', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Only remove styles if we're leaving the zone entirely
          if (!zone.contains(e.relatedTarget)) {
            zone.classList.remove('border-[#0066cc]', 'bg-[#f0f8ff]');
            const indicator = zone.querySelector('.drag-indicator');
            if (indicator) {
              indicator.remove();
            }
          }
        });

        zone.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          zone.classList.remove('border-[#0066cc]', 'bg-[#f0f8ff]');
          
          // Remove drag indicator
          const indicator = zone.querySelector('.drag-indicator');
          if (indicator) {
            indicator.remove();
          }
          
          // Process dropped files
          const files = e.dataTransfer.files;
          if (files.length > 0) {
            // Create a mock event for handleFileSelection
            const mockEvent = {
              target: { files: files }
            };
            
            this.handleFileSelection(mockEvent, fileType);
            
            // Reset the file input to allow re-selecting the same files
            switch(fileType) {
              case 'fabric':
                if (this.fabricAttachment) this.fabricAttachment.value = '';
                break;
              case 'styleReference':
                if (this.styleReferenceAttachment) this.styleReferenceAttachment.value = '';
                break;
              case 'additional':
                if (this.additionalAttachments) this.additionalAttachments.value = '';
                break;
            }
          }
        });
      });
    }/**
     * Handle file selection for uploads
     * @param {Event} e - The change event
     * @param {string} type - Type of attachment ('fabric', 'styleReference', 'additional')
     */
    handleFileSelection(e, type) {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Validate files before processing
      const validFiles = this.validateFiles(Array.from(files));
      if (validFiles.length === 0) return;

      switch(type) {
        case 'fabric':
          this.uploadedFiles.fabric = validFiles[0];
          this.updateFileDisplay(this.fabricUploadBtn, validFiles[0].name);
          this.showNotification(`Fabric file "${validFiles[0].name}" selected`, 'success');
          break;
        case 'styleReference':
          this.uploadedFiles.styleReference = validFiles[0];
          this.updateFileDisplay(this.styleReferenceUploadBtn, validFiles[0].name);
          this.showNotification(`Style reference "${validFiles[0].name}" selected`, 'success');
          break;
        case 'additional':
          // Check for duplicates before adding
          const existingNames = this.uploadedFiles.additional.map(f => f.name);
          const newFiles = validFiles.filter(file => !existingNames.includes(file.name));
          
          if (newFiles.length === 0) {
            this.showNotification('All selected files are already added', 'warning');
            return;
          }
          
          // Add new files to existing ones (don't replace)
          this.uploadedFiles.additional = [...this.uploadedFiles.additional, ...newFiles];
          this.updateAdditionalFilesDisplay();
          
          // Show success message
          const message = newFiles.length === 1 
            ? `File "${newFiles[0].name}" added successfully`
            : `${newFiles.length} files added successfully`;
          this.showNotification(message, 'success');
          break;
      }
    }

    /**
     * Validate files before adding them
     * @param {File[]} files - Files to validate
     * @returns {File[]} Valid files
     */
    validateFiles(files) {
      const validFiles = [];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      for (const file of files) {
        // Check file size
        if (file.size > maxSize) {
          this.showNotification(`File "${file.name}" exceeds 10MB limit`, 'error');
          continue;
        }
        
        // Check file type (basic validation)
        if (file.size === 0) {
          this.showNotification(`File "${file.name}" appears to be empty`, 'error');
          continue;
        }
        
        validFiles.push(file);
      }
      
      return validFiles;
    }/**
     * Update the display for additional files
     */
    updateAdditionalFilesDisplay() {
      const fileCount = this.uploadedFiles.additional.length;
      const fileCountDisplay = document.getElementById('fileCountDisplay');
      
      if (fileCount === 0) {
        this.selectedFilesContainer.classList.add('hidden');
        this.updateFileDisplay(this.attachmentsUploadBtn, '📎 Add Files');
        return;
      }

      // Show the selected files container
      this.selectedFilesContainer.classList.remove('hidden');
      
      // Update file count display
      if (fileCountDisplay) {
        fileCountDisplay.textContent = fileCount;
      }
      
      // Update main button display
      this.updateFileDisplay(
        this.attachmentsUploadBtn, 
        fileCount === 1 ? '📎 1 file selected' : `📎 ${fileCount} files selected`
      );

      // Update the files list with enhanced display
      this.selectedFilesList.innerHTML = this.uploadedFiles.additional.map((file, index) => `
        <div class="file-item flex items-center justify-between p-3 bg-white rounded-lg border border-[#dde1e3] hover:border-[#0066cc] transition-colors">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-10 h-10 bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-white text-sm font-bold">${this.getFileIcon(file.type)}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[#121416] text-sm font-medium truncate" title="${file.name}">${file.name}</p>
              <div class="flex items-center gap-2 mt-1">
                <p class="text-[#6a7681] text-xs">${this.formatFileSize(file.size)}</p>
                <span class="text-[#6a7681] text-xs">•</span>
                <p class="text-[#6a7681] text-xs capitalize">${this.getFileTypeLabel(file.type)}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded">Ready</span>
            <button type="button" onclick="createOrderController.removeFile(${index})" 
                    class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors" 
                    title="Remove file">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      `).join('');
    }    /**
     * Get file icon based on file type
     */
    getFileIcon(mimeType) {
      if (mimeType.startsWith('image/')) return '🖼️';
      if (mimeType.includes('pdf')) return '📄';
      if (mimeType.includes('doc')) return '📝';
      if (mimeType.includes('text')) return '📝';
      if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊';
      return '📎';
    }

    /**
     * Get user-friendly file type label
     */
    getFileTypeLabel(mimeType) {
      if (mimeType.startsWith('image/')) return 'Image';
      if (mimeType.includes('pdf')) return 'PDF';
      if (mimeType.includes('doc')) return 'Document';
      if (mimeType.includes('text')) return 'Text';
      if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'Spreadsheet';
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'Presentation';
      return 'File';
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * Remove a specific file from additional attachments
     */
    removeFile(index) {
      this.uploadedFiles.additional.splice(index, 1);
      this.updateAdditionalFilesDisplay();
      
      // Reset the file input to allow re-selecting the same files
      this.additionalAttachments.value = '';
    }

    /**
     * Clear all additional files
     */
    clearAllFiles() {
      this.uploadedFiles.additional = [];
      this.updateAdditionalFilesDisplay();
      
      // Reset the file input
      this.additionalAttachments.value = '';
    }

    /**
     * Update the display of the upload button to show selected file
     * @param {HTMLElement} button - The upload button
     * @param {string} text - Text to display
     */
    updateFileDisplay(button, text) {
      const span = button.querySelector('span');
      if (span) {
        span.textContent = text;
        button.classList.add('bg-[#e8f2ec]');
      }
    }

    /**
     * Handle form submission
     * @param {Event} e - The submit event 
     */
    async handleFormSubmit(e) {
      e.preventDefault();
      
      try {
        // Show loading state
        this.setFormSubmitting(true);
        
        // Collect form data
        const formData = new FormData(this.form);
        const orderData = Object.fromEntries(formData.entries());
        
        // Add file metadata
        orderData.hasAttachments = !!(this.uploadedFiles.fabric || 
                                     this.uploadedFiles.styleReference || 
                                     this.uploadedFiles.additional.length);
        
        // Process file uploads if available
        if (window.app && window.app.cloudStorage) {
          const uploadTasks = [];
          const uploadedFileUrls = {};
          
          // Upload fabric file if exists
          if (this.uploadedFiles.fabric) {
            uploadTasks.push(
              window.app.cloudStorage.uploadFile(this.uploadedFiles.fabric)
                .then(url => uploadedFileUrls.fabricUrl = url)
            );
          }
          
          // Upload style reference if exists
          if (this.uploadedFiles.styleReference) {
            uploadTasks.push(
              window.app.cloudStorage.uploadFile(this.uploadedFiles.styleReference)
                .then(url => uploadedFileUrls.styleReferenceUrl = url)
            );
          }
          
          // Upload additional attachments if exist
          if (this.uploadedFiles.additional.length) {
            const additionalUploads = this.uploadedFiles.additional.map(file => 
              window.app.cloudStorage.uploadFile(file)
            );
            
            uploadTasks.push(
              Promise.all(additionalUploads)
                .then(urls => uploadedFileUrls.additionalUrls = urls)
            );
          }
          
          // Wait for all uploads to complete
          if (uploadTasks.length) {
            await Promise.all(uploadTasks);
            orderData.attachments = uploadedFileUrls;
          }
        }
        
        // Add metadata
        orderData.id = this.generateOrderId();
        orderData.createdAt = new Date().toISOString();
        orderData.status = "In Progress";
        
        // Save order data
        if (window.dataManager) {
          window.dataManager.createOrder(orderData);
          
          // Show success message
          this.showNotification('Order created successfully!', 'success');
          
          // Reset form after successful submission
          this.form.reset();
          this.resetFileUploads();
          
          // Redirect to orders page after short delay
          setTimeout(() => {
            if (window.app) {
              window.app.navigateTo('orders');
            }
          }, 1500);
        } else {
          throw new Error('Data manager not available');
        }
      } catch (error) {
        console.error('Error creating order:', error);
        this.showNotification('Error creating order. Please try again.', 'error');
      } finally {
        this.setFormSubmitting(false);
      }
    }
    
    /**
     * Generate a unique order ID
     * @returns {string} Unique order ID
     */
    generateOrderId() {
      return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    
    /**
     * Set form to submitting state
     * @param {boolean} isSubmitting - Whether form is submitting
     */
    setFormSubmitting(isSubmitting) {
      const submitBtn = this.form.querySelector('button[type="submit"]');
      if (submitBtn) {
        if (isSubmitting) {
          submitBtn.disabled = true;
          submitBtn.classList.add('opacity-70');
          submitBtn.innerHTML = '<span class="truncate">Creating Order...</span>';
        } else {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-70');
          submitBtn.innerHTML = '<span class="truncate">Create Order</span>';
        }
      }
    }
      /**
     * Reset file upload fields and their display
     */
    resetFileUploads() {
      this.uploadedFiles = {
        fabric: null,
        styleReference: null,
        additional: []
      };
        // Reset upload buttons
      if (this.fabricUploadBtn) {
        this.updateFileDisplay(this.fabricUploadBtn, '📎 Upload Fabric');
        this.fabricUploadBtn.classList.remove('bg-[#e8f2ec]');
      }
      
      if (this.styleReferenceUploadBtn) {
        this.updateFileDisplay(this.styleReferenceUploadBtn, '📎 Upload Style');
        this.styleReferenceUploadBtn.classList.remove('bg-[#e8f2ec]');
      }
      
      if (this.attachmentsUploadBtn) {
        this.updateFileDisplay(this.attachmentsUploadBtn, '📎 Add Files');
        this.attachmentsUploadBtn.classList.remove('bg-[#e8f2ec]');
      }

      // Hide the selected files container
      if (this.selectedFilesContainer) {
        this.selectedFilesContainer.classList.add('hidden');
      }

      // Clear the selected files list
      if (this.selectedFilesList) {
        this.selectedFilesList.innerHTML = '';
      }

      // Reset file inputs
      if (this.fabricAttachment) this.fabricAttachment.value = '';
      if (this.styleReferenceAttachment) this.styleReferenceAttachment.value = '';
      if (this.additionalAttachments) this.additionalAttachments.value = '';
    }
    
    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type ('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
      // Use app notification system if available
      if (window.utils && window.utils.showToast) {
        window.utils.showToast(message, type);
        return;
      }
      
      // Fallback to alert if toast not available
      alert(message);
    }
  }

  // Initialize controller when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.createOrderController = new CreateOrderController();
  });
}
/**
 * Orders Page Controller
 * Handles order listing, filtering, editing, and PDF generation
 */

// Prevent redefinition
if (typeof OrdersController === 'undefined') {
  class OrdersController {
    constructor() {
      this.orders = [];
      this.filteredOrders = [];
      this.initializeElements();
      this.bindEvents();
      this.loadOrders();
    }

    /**
     * Initialize DOM elements and references
     */
    initializeElements() {
      // Filter elements
      this.searchInput = document.getElementById('orderSearch');
      this.statusFilter = document.getElementById('statusFilter');
      this.categoryFilter = document.getElementById('categoryFilter');
      this.sortFilter = document.getElementById('sortFilter');

      // Table and navigation elements
      this.ordersTableBody = document.getElementById('ordersTableBody');
      this.printOrdersBtn = document.getElementById('printOrdersBtn');
      this.createOrderNavBtn = document.getElementById('createOrderNavBtnFromOrdersPage');

      // Preview panel elements
      this.orderPreviewPanel = document.getElementById('orderPreviewPanel');
      this.closePreviewBtn = document.getElementById('closePreviewBtn');
      this.orderDetailsContent = document.getElementById('orderDetailsContent');

      // Edit modal elements
      this.orderEditModal = document.getElementById('orderEditModal');
      this.editOrderForm = document.getElementById('editOrderForm');
      this.cancelEditBtn = document.getElementById('cancelEditBtn');
      
      // Edit form fields
      this.editOrderId = document.getElementById('editOrderId');
      this.editCustomerName = document.getElementById('editCustomerName');
      this.editCategory = document.getElementById('editCategory');
      this.editType = document.getElementById('editType');
      this.editStatus = document.getElementById('editStatus');
      this.editDescription = document.getElementById('editDescription');
      this.editDeliveryDate = document.getElementById('editDeliveryDate');
      this.editCanvaUrl = document.getElementById('editCanvaUrl');
      this.editOpenCanvaTemplateBtn = document.getElementById('editOpenCanvaTemplateBtn');
      this.editConnectToCanvaBtn = document.getElementById('editConnectToCanvaBtn');
    }

    /**
     * Bind event listeners to elements
     */
    bindEvents() {
      // Filter events
      if (this.searchInput) {
        this.searchInput.addEventListener('input', this.applyFilters.bind(this));
      }
      if (this.statusFilter) {
        this.statusFilter.addEventListener('change', this.applyFilters.bind(this));
      }
      if (this.categoryFilter) {
        this.categoryFilter.addEventListener('change', this.applyFilters.bind(this));
      }
      if (this.sortFilter) {
        this.sortFilter.addEventListener('change', this.applySorting.bind(this));
      }      // Action buttons
      if (this.printOrdersBtn) {
        this.printOrdersBtn.addEventListener('click', this.printOrdersListAsPDF.bind(this));
      }
      if (this.createOrderNavBtn) {
        this.createOrderNavBtn.addEventListener('click', () => {
          window.location.href = './create-order.html';
        });
      }

      // Preview panel
      if (this.closePreviewBtn) {
        this.closePreviewBtn.addEventListener('click', this.closePreview.bind(this));
      }      // Edit modal
      if (this.editOrderForm) {
        this.editOrderForm.addEventListener('submit', this.saveEditedOrder.bind(this));
      }
      if (this.cancelEditBtn) {
        this.cancelEditBtn.addEventListener('click', this.closeEditModal.bind(this));
      }

      // Canva integration buttons
      if (this.editOpenCanvaTemplateBtn) {
        this.editOpenCanvaTemplateBtn.addEventListener('click', this.openCanvaTemplate.bind(this));
      }
      if (this.editConnectToCanvaBtn) {
        this.editConnectToCanvaBtn.addEventListener('click', this.openCanvaDesignTool.bind(this));
      }

      // Close modal on backdrop click
      if (this.orderEditModal) {
        this.orderEditModal.addEventListener('click', (e) => {
          if (e.target === this.orderEditModal) {
            this.closeEditModal();
          }
        });
      }
    }

    /**
     * Load orders from localStorage
     */
    loadOrders() {
      try {
        const savedOrders = localStorage.getItem('fashionOrders');
        this.orders = savedOrders ? JSON.parse(savedOrders) : [];
        this.filteredOrders = [...this.orders];
        this.renderOrders();
      } catch (error) {
        console.error('Error loading orders:', error);
        this.orders = [];
        this.filteredOrders = [];
        this.renderOrders();
      }
    }

    /**
     * Save orders to localStorage
     */
    saveOrders() {
      try {
        localStorage.setItem('fashionOrders', JSON.stringify(this.orders));
      } catch (error) {
        console.error('Error saving orders:', error);
      }
    }

    /**
     * Apply filters to the orders list
     */
    applyFilters() {
      const searchTerm = this.searchInput?.value.toLowerCase() || '';
      const statusFilter = this.statusFilter?.value || 'All Statuses';
      const categoryFilter = this.categoryFilter?.value || 'All Categories';

      this.filteredOrders = this.orders.filter(order => {
        const matchesSearch = !searchTerm || 
          order.customerName.toLowerCase().includes(searchTerm) ||
          order.orderId.toLowerCase().includes(searchTerm) ||
          order.category.toLowerCase().includes(searchTerm) ||
          order.type.toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === 'All Statuses' || order.status === statusFilter;
        const matchesCategory = categoryFilter === 'All Categories' || order.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      });

      this.applySorting();
    }

    /**
     * Apply sorting to the filtered orders
     */
    applySorting() {
      const sortOption = this.sortFilter?.value || 'Sort by Date';

      switch (sortOption) {
        case 'Latest First':
          this.filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'Oldest First':
          this.filteredOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        default:
          this.filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      this.renderOrders();
    }

    /**
     * Render the orders table
     */
    renderOrders() {
      if (!this.ordersTableBody) return;

      if (this.filteredOrders.length === 0) {
        this.ordersTableBody.innerHTML = `
          <tr>
            <td colspan="7" class="px-4 py-8 text-center text-[#6a7681]">No orders found</td>
          </tr>
        `;
        return;
      }

      this.ordersTableBody.innerHTML = this.filteredOrders.map(order => `
        <tr class="border-b border-[#dde1e3] hover:bg-[#f8fafc]" data-order-id="${order.orderId}">
          <td class="px-4 py-3 text-[#121416] text-sm font-medium">${order.orderId}</td>
          <td class="px-4 py-3 text-[#121416] text-sm">${order.customerName}</td>
          <td class="px-4 py-3 text-[#121416] text-sm">${order.type || 'N/A'}</td>
          <td class="px-4 py-3">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getStatusClass(order.status)}">
              ${order.status}
            </span>
          </td>
          <td class="px-4 py-3 text-[#121416] text-sm">${this.formatDate(order.deliveryDate)}</td>
          <td class="px-4 py-3 text-[#121416] text-sm">
            ${this.renderAttachments(order)}
          </td>          <td class="px-4 py-3">
            <div class="flex gap-2">
              <button onclick="ordersController.viewOrder('${order.orderId}')" class="text-[#0066cc] hover:text-[#0052a3] text-sm font-medium" aria-label="View order ${order.orderId}">
                View
              </button>
              <button onclick="ordersController.editOrder('${order.orderId}')" class="text-[#059669] hover:text-[#047857] text-sm font-medium" aria-label="Edit order ${order.orderId}">
                Edit
              </button>
              <button onclick="ordersController.deleteOrder('${order.orderId}')" class="text-[#dc2626] hover:text-[#b91c1c] text-sm font-medium" aria-label="Delete order ${order.orderId}">
                Delete
              </button>
              <button onclick="ordersController.printOrderAsPDF('${order.orderId}')" class="text-[#6366f1] hover:text-[#4f46e5] text-sm font-medium" aria-label="Print order ${order.orderId}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
                  <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    /**
     * Get CSS class for order status
     */
    getStatusClass(status) {
      switch (status) {
        case 'Completed':
          return 'bg-green-100 text-green-800';
        case 'In Progress':
          return 'bg-blue-100 text-blue-800';
        case 'Cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }    /**
     * Format date for display
     */
    formatDate(dateString) {
      if (!dateString) return 'Not set';
      try {
        return new Date(dateString).toLocaleDateString();
      } catch {
        return 'Invalid date';
      }
    }

    /**
     * Render attachments for the table
     */
    renderAttachments(order) {
      const attachments = [];
      
      if (order.fabricAttachment) attachments.push('Fabric');
      if (order.styleReferenceAttachment) attachments.push('Style Ref');
      if (order.additionalAttachments && order.additionalAttachments.length > 0) {
        attachments.push(`+${order.additionalAttachments.length} files`);
      }

      return attachments.length > 0 ? attachments.join(', ') : 'None';
    }

    /**
     * View order details in preview panel
     */
    viewOrder(orderId) {
      const order = this.orders.find(o => o.orderId === orderId);
      if (!order) return;

      if (this.orderDetailsContent) {
        this.orderDetailsContent.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>Order ID:</strong> ${order.orderId}</div>
            <div><strong>Customer:</strong> ${order.customerName}</div>
            <div><strong>Category:</strong> ${order.category || 'N/A'}</div>
            <div><strong>Type:</strong> ${order.type || 'N/A'}</div>
            <div><strong>Status:</strong> <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getStatusClass(order.status)}">${order.status}</span></div>
            <div><strong>Delivery Date:</strong> ${this.formatDate(order.deliveryDate)}</div>
          </div>
          ${order.description ? `<div class="mt-4"><strong>Description:</strong><br><p class="mt-2 text-[#6a7681]">${order.description}</p></div>` : ''}
          ${order.canvaUrl ? `<div class="mt-4"><strong>Canva Design:</strong><br><a href="${order.canvaUrl}" target="_blank" class="text-[#0066cc] hover:underline">${order.canvaUrl}</a></div>` : ''}
          ${this.renderOrderAttachments(order)}
        `;
      }

      if (this.orderPreviewPanel) {
        this.orderPreviewPanel.style.display = 'block';
      }
    }

    /**
     * Render attachments for order preview
     */
    renderOrderAttachments(order) {
      const attachments = [];
      
      if (order.fabricAttachment) {
        attachments.push(`<div>📎 Fabric: ${order.fabricAttachment.name}</div>`);
      }
      if (order.styleReferenceAttachment) {
        attachments.push(`<div>📎 Style Reference: ${order.styleReferenceAttachment.name}</div>`);
      }
      if (order.additionalAttachments && order.additionalAttachments.length > 0) {
        order.additionalAttachments.forEach(file => {
          attachments.push(`<div>📎 ${file.name}</div>`);
        });
      }

      return attachments.length > 0 ? 
        `<div class="mt-4"><strong>Attachments:</strong><br><div class="mt-2 space-y-1">${attachments.join('')}</div></div>` : 
        '';
    }

    /**
     * Close order preview panel
     */
    closePreview() {
      if (this.orderPreviewPanel) {
        this.orderPreviewPanel.style.display = 'none';
      }
    }

    /**
     * Edit order - open edit modal
     */
    editOrder(orderId) {
      const order = this.orders.find(o => o.orderId === orderId);
      if (!order) {
        console.error(`Order ${orderId} not found`);
        return;
      }

      // Populate form fields with order data
      this.editOrderId.value = order.orderId;
      this.editCustomerName.value = order.customerName;
      this.editCategory.value = order.category;
      this.editType.value = order.type || '';
      this.editStatus.value = order.status;
      this.editDescription.value = order.description || '';
      this.editDeliveryDate.value = order.deliveryDate ? this.formatDateForInput(order.deliveryDate) : '';
      this.editCanvaUrl.value = order.canvaUrl || '';
      
      if (order.trialDate) {
        if (this.editTrialDate) {
          this.editTrialDate.value = this.formatDateForInput(order.trialDate);
        }
      }

      // Show the edit modal
      this.orderEditModal.classList.remove('hidden');
    }

    /**
     * Save edited order
     * @param {Event} event - Form submission event
     */
    saveEditedOrder(event) {
      event.preventDefault();
      
      const orderId = this.editOrderId.value;
      const orderIndex = this.orders.findIndex(o => o.orderId === orderId);
      
      if (orderIndex === -1) {
        console.error(`Order ${orderId} not found`);
        return;
      }
      
      // Update order with form data
      const updatedOrder = {
        ...this.orders[orderIndex],
        customerName: this.editCustomerName.value,
        category: this.editCategory.value,
        type: this.editType.value,
        status: this.editStatus.value,
        description: this.editDescription.value,
        deliveryDate: this.editDeliveryDate.value,
        canvaUrl: this.editCanvaUrl.value,
        updatedAt: new Date().toISOString()
      };
      
      // Update trial date if the field exists
      if (this.editTrialDate) {
        updatedOrder.trialDate = this.editTrialDate.value;
      }

      // Update order in array
      this.orders[orderIndex] = updatedOrder;
      
      // Save to local storage
      this.saveOrders();
      
      // Close modal and refresh view
      this.closeEditModal();
      this.applyFilters();
      
      // Show success notification
      this.showNotification('Order updated successfully', 'success');
    }

    /**
     * Delete an order
     * @param {string} orderId - The ID of the order to delete
     */
    deleteOrder(orderId) {
      if (!confirm(`Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
        return;
      }
      
      const orderIndex = this.orders.findIndex(o => o.orderId === orderId);
      if (orderIndex === -1) {
        console.error(`Order ${orderId} not found`);
        return;
      }
      
      // Remove the order
      this.orders.splice(orderIndex, 1);
      
      // Save to local storage
      this.saveOrders();
      
      // Refresh the view
      this.applyFilters();
      
      // Show success notification
      this.showNotification('Order deleted successfully', 'success');
    }

    /**
     * Format date for input fields (YYYY-MM-DD)
     * @param {string} dateString - Date string to format
     */
    formatDateForInput(dateString) {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formatting date for input:', error);
        return '';
      }
    }

    /**
     * Show a notification
     * @param {string} message - The message to show
     * @param {string} type - The type of notification (success, error, info)
     */
    showNotification(message, type = 'info') {
      // Create notification element
      const notification = document.createElement('div');
      
      // Set classes based on type
      let bgColor, textColor;
      switch (type) {
        case 'success':
          bgColor = 'bg-green-100';
          textColor = 'text-green-800';
          break;
        case 'error':
          bgColor = 'bg-red-100';
          textColor = 'text-red-800';
          break;
        default:
          bgColor = 'bg-blue-100';
          textColor = 'text-blue-800';
      }
      
      // Set notification content and style
      notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-md ${bgColor} ${textColor} z-50`;
      notification.textContent = message;
      
      // Add to DOM
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
        notification.classList.add('opacity-0');
        notification.style.transition = 'opacity 0.5s';
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);
    }

    /**
     * Close edit modal
     */
    closeEditModal() {
      if (this.orderEditModal) {
        this.orderEditModal.classList.add('hidden');
      }
    }

    /**
     * Open Canva template (use default template)
     */
    openCanvaTemplate() {
      // Get default template URL from settings or use a generic URL
      const defaultTemplateUrl = localStorage.getItem('canvaTemplateUrl') || 'https://www.canva.com/design/';
      window.open(defaultTemplateUrl, '_blank');
    }

    /**
     * Open Canva design tool for the current order
     */
    openCanvaDesignTool() {
      const canvaUrl = this.editCanvaUrl.value.trim();
      
      if (canvaUrl) {
        // Open existing Canva design
        window.open(canvaUrl, '_blank');
      } else {
        // Open Canva main design page
        window.open('https://www.canva.com/design/', '_blank');
        
        // Show helpful message
        this.showNotification('Canva opened! Copy the design URL back to this form when ready.', 'info');
      }
    }
    
    /**
     * Print a specific order as PDF
     * @param {string} orderId - The ID of the order to print
     */
    printOrderAsPDF(orderId) {
      const order = this.orders.find(o => o.orderId === orderId);
      if (!order) {
        console.error(`Order ${orderId} not found`);
        return;
      }
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Generate HTML content for the PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Order ${order.orderId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #eee;
              padding-bottom: 10px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #0066cc;
            }
            .order-id {
              font-size: 20px;
              margin-top: 5px;
              color: #666;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .info-row {
              display: flex;
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              width: 200px;
            }
            .info-value {
              flex: 1;
            }
            .status {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 14px;
              font-weight: bold;
            }
            .status-completed {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-progress {
              background-color: #dbeafe;
              color: #1e40af;
            }
            .status-cancelled {
              background-color: #fee2e2;
              color: #b91c1c;
            }
            .status-pending {
              background-color: #fef3c7;
              color: #92400e;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            @media print {
              body {
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Fashion Admin</div>
            <div class="order-id">Order: ${order.orderId}</div>
            <div>Generated: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-row">
              <div class="info-label">Customer Name:</div>
              <div class="info-value">${order.customerName}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Order Details</div>
            <div class="info-row">
              <div class="info-label">Order Type:</div>
              <div class="info-value">${order.type || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Category:</div>
              <div class="info-value">${order.category || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Status:</div>
              <div class="info-value">
                <span class="status ${this.getPDFStatusClass(order.status)}">${order.status}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-label">Created Date:</div>
              <div class="info-value">${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Trial Date:</div>
              <div class="info-value">${order.trialDate ? new Date(order.trialDate).toLocaleDateString() : 'Not scheduled'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Delivery Date:</div>
              <div class="info-value">${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Not scheduled'}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Order Description</div>
            <div>${order.description || 'No description provided'}</div>
          </div>
          
          <div class="footer">
            <p>Fashion Admin Dashboard &copy; 2025</p>
            <p>This is a computer-generated document. No signature is required.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;
      
      // Write to the new window and trigger print
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
    
    /**
     * Get status class for PDF
     * @param {string} status - The order status
     */
    getPDFStatusClass(status) {
      switch (status) {
        case 'Completed':
          return 'status-completed';
        case 'In Progress':
          return 'status-progress';
        case 'Cancelled':
          return 'status-cancelled';
        default:
          return 'status-pending';
      }
    }
    
    /**
     * Print all orders list as PDF
     */
    printOrdersListAsPDF() {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Build table rows for orders
      const orderRows = this.filteredOrders.map(order => `
        <tr>
          <td>${order.orderId}</td>
          <td>${order.customerName}</td>
          <td>${order.type || 'N/A'}</td>
          <td>
            <span class="status ${this.getPDFStatusClass(order.status)}">${order.status}</span>
          </td>
          <td>${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Not set'}</td>
          <td>${order.trialDate ? new Date(order.trialDate).toLocaleDateString() : 'Not set'}</td>
        </tr>
      `).join('');
      
      // Generate HTML content for the PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Orders List</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 1000px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #eee;
              padding-bottom: 10px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #0066cc;
            }
            .subtitle {
              font-size: 18px;
              margin-top: 5px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f0f2f5;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .status {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-completed {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-progress {
              background-color: #dbeafe;
              color: #1e40af;
            }
            .status-cancelled {
              background-color: #fee2e2;
              color: #b91c1c;
            }
            .status-pending {
              background-color: #fef3c7;
              color: #92400e;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            @media print {
              body {
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              tr {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Fashion Admin</div>
            <div class="subtitle">Orders List</div>
            <div>Generated: ${new Date().toLocaleString()}</div>
            <div>Total Orders: ${this.filteredOrders.length}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Delivery Date</th>
                <th>Trial Date</th>
              </tr>
            </thead>
            <tbody>
              ${orderRows}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Fashion Admin Dashboard &copy; 2025</p>
            <p>This is a computer-generated document. No signature is required.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;
      
      // Write to the new window and trigger print
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  }

  // Initialize controller when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.ordersController = new OrdersController();
  });
}
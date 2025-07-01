/**
 * Order Filter Module
 * Handles filtering orders based on upcoming trials and deliveries
 */
class OrderFilterManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Check if there's a stored filter in session storage
        this.checkStoredFilter();
        
        // Add event listeners for filter clear buttons
        document.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('clear-filter-btn')) {
                this.clearFilter();
            }
        });
    }

    // Check for and apply stored filter
    checkStoredFilter() {
        const savedFilter = sessionStorage.getItem('orderFilter');
        if (!savedFilter) return;
        
        console.log('Applying saved filter:', savedFilter);
        
        // Apply the filter
        switch(savedFilter) {
            case 'upcomingTrials':
                this.filterByUpcomingTrials();
                break;
            case 'upcomingDeliveries':
                this.filterByUpcomingDeliveries();
                break;
            // other cases can be handled here
            default:
                // Unknown filter type
                break;
        }
        
        // Clear the stored filter
        sessionStorage.removeItem('orderFilter');
    }
    
    // Filter orders with trials in the next 7 days
    filterByUpcomingTrials() {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        this.applyFilter(order => {
            if (!order.trialDate) return false;
            const trialDate = new Date(order.trialDate);
            return trialDate >= today && 
                   trialDate <= nextWeek && 
                   order.status !== 'Completed' && 
                   order.status !== 'Cancelled';
        }, 'Upcoming Trials (Next 7 Days)', 'trial');
    }
    
    // Filter orders with deliveries in the next 7 days
    filterByUpcomingDeliveries() {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        this.applyFilter(order => {
            if (!order.deliveryDate) return false;
            const deliveryDate = new Date(order.deliveryDate);
            return deliveryDate >= today && 
                   deliveryDate <= nextWeek && 
                   order.status !== 'Completed' && 
                   order.status !== 'Cancelled';
        }, 'Upcoming Deliveries (Next 7 Days)', 'delivery');
    }

    applyFilter(filterType) {
        if (!window.orders) return;
        
        // Create a filter banner at the top of orders page
        const ordersPage = document.getElementById('ordersPage');
        if (!ordersPage) return;
        
        // Check if filter banner already exists
        const existingBanner = document.getElementById('filterBanner');
        if (existingBanner) existingBanner.remove();
        
        // Create a new filter banner
        const filterBanner = document.createElement('div');
        filterBanner.id = 'filterBanner';
        filterBanner.className = 'mx-4 mt-2 p-3 rounded-lg flex items-center justify-between';
        
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        // Set banner styling and content based on filter type
        if (filterType === 'upcomingTrials') {
            filterBanner.classList.add('bg-[#fffbeb]', 'border', 'border-[#f59e0b]');
            filterBanner.innerHTML = `
                <div class="flex items-center">
                    <span class="text-[#f59e0b] font-medium">Showing orders with upcoming trials</span>
                    <span class="ml-2 text-xs text-[#f59e0b]">(Next 7 days)</span>
                </div>
                <button class="clear-filter-btn text-sm text-[#f59e0b] hover:underline">Clear Filter</button>
            `;
            
            // Filter the orders table to show only upcoming trials
            this.filterOrdersTable('trialDate', today, nextWeek);
        } 
        else if (filterType === 'upcomingDeliveries') {
            filterBanner.classList.add('bg-[#ecfdf5]', 'border', 'border-[#10b981]');
            filterBanner.innerHTML = `
                <div class="flex items-center">
                    <span class="text-[#10b981] font-medium">Showing orders with upcoming deliveries</span>
                    <span class="ml-2 text-xs text-[#10b981]">(Next 7 days)</span>
                </div>
                <button class="clear-filter-btn text-sm text-[#10b981] hover:underline">Clear Filter</button>
            `;
            
            // Filter the orders table to show only upcoming deliveries
            this.filterOrdersTable('deliveryDate', today, nextWeek);
        }
        
        // Insert the banner at the top of the orders page
        const firstElement = ordersPage.firstElementChild;
        ordersPage.insertBefore(filterBanner, firstElement.nextElementSibling);
    }
    
    filterOrdersTable(dateField, startDate, endDate) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        // Clear the table
        tbody.innerHTML = '';
        
        // Get filtered orders
        const filteredOrders = window.orders.filter(order => {
            if (!order[dateField]) return false;
            const date = new Date(order[dateField]);
            return date >= startDate && date <= endDate && order.status !== 'Completed' && order.status !== 'Cancelled';
        });
        
        // If no filtered orders, show message
        if (filteredOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-[#6a7681]">No orders match the current filter</td></tr>';
            return;
        }
        
        // Render filtered orders
        filteredOrders.forEach(order => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-[#d1e6d9] hover:bg-[#f8fafc] cursor-pointer';
            const statusColor = order.status === 'Completed' ? 'text-[#10b981] bg-[#ecfdf5]' : 'text-[#f59e0b] bg-[#fffbeb]';
            
            // Calculate total attachment count
            let attachmentCount = Array.isArray(order.attachments) ? order.attachments.length : 0;
            if (order.fabricAttachment) attachmentCount++;
            if (order.styleAttachment) attachmentCount++;
            if (order.techpackAttachment) attachmentCount++;
            
            // TechPack HTML
            const techpackHtml = order.techpackAttachment ? 
                `<div class="techpack-cell flex items-center gap-2">
                    <button onclick="previewFile(event, '${order.techpackAttachment.url}', '${order.techpackAttachment.name}', '${order.techpackAttachment.type}')" 
                            class="text-[#51946b] hover:text-[#3d7354] text-sm font-medium flex items-center gap-1" 
                            title="Preview ${order.techpackAttachment.name}">
                    📎 ${order.techpackAttachment.name.substring(0, 12)}${order.techpackAttachment.name.length > 12 ? '...' : ''}
                    </button>
                </div>` : 
                `<div class="techpack-cell flex items-center gap-2">
                    <input type="file" id="techpack-${order.id}" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
                        onchange="uploadTechpack(${order.id}, this)" class="hidden">
                    <button onclick="document.getElementById('techpack-${order.id}').click()" 
                            class="bg-[#51946b] hover:bg-[#3d7354] text-white px-2 py-1 rounded text-xs font-medium">
                    + TechPack
                    </button>
                </div>`;
            
            tr.innerHTML = `
                <td class="px-4 py-3 text-[#111518] text-sm">#${order.id}</td>
                <td class="px-4 py-3 text-[#111518] text-sm">${order.customer}</td>
                <td class="px-4 py-3 text-[#111518] text-sm">${order.category || order.type || ''}</td>
                <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">${order.status}</span></td>
                <td class="px-4 py-3">${techpackHtml}</td>
                <td class="px-4 py-3 text-[#111518] text-sm">${order.deliveryDate || ''}</td>
                <td class="px-4 py-3 text-[#111518] text-sm">📎 ${attachmentCount}</td>
            `;
            tr.onclick = () => window.displayOrderPreview(order.id);
            tbody.appendChild(tr);
        });
    }
    
    clearFilter() {
        // Clear the session storage
        sessionStorage.removeItem('orderFilter');
        
        // Remove the filter banner
        const filterBanner = document.getElementById('filterBanner');
        if (filterBanner) filterBanner.remove();
        
        // Re-render the orders table with all orders
        if (window.renderOrders) {
            window.renderOrders();
        }
    }
    
    showFilterActiveIndicator(filterType) {
        // This method could be used to add a visual indicator elsewhere in the UI
        // Currently, the filter banner serves this purpose
    }
}

// Initialize order filter manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.orderFilterManager = new OrderFilterManager();
});

/**
 * Dashboard Page Controller
 * Handles dashboard-specific functionality, stats rendering, and PDF generation
 */

// Prevent redefinition if already defined
if (typeof DashboardController === 'undefined') {
  class DashboardController {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadDashboardData();
    }

    initializeElements() {
        this.elements = {
            totalOrders: document.getElementById('totalOrders'),
            pendingOrders: document.getElementById('pendingOrders'),
            completedOrders: document.getElementById('completedOrders'),
            totalCustomers: document.getElementById('totalCustomers'),
            recentOrdersTable: document.getElementById('recentOrdersTable'),
            printDashboardBtn: document.getElementById('printDashboardBtn'),
            // New elements for upcoming events
            upcomingTrialsTable: document.getElementById('upcomingTrialsTable'),
            upcomingDeliveriesTable: document.getElementById('upcomingDeliveriesTable'),
            trialComingUpStat: document.getElementById('trialComingUpStat'),
            deliveryComingUpStat: document.getElementById('deliveryComingUpStat'),
            calendarContainer: document.querySelector('.calendar-grid'),
            // Calendar navigation elements
            prevMonthBtn: document.getElementById('prevMonthBtn'),
            nextMonthBtn: document.getElementById('nextMonthBtn'),
            currentMonthLabel: document.getElementById('currentMonthLabel')
        };
        
        // Store current calendar month/year
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
    }

    bindEvents() {
        if (this.elements.printDashboardBtn) {
            this.elements.printDashboardBtn.addEventListener('click', () => {
                this.printDashboard();
            });
        }
        
        // Add click handlers to status cards for filtered navigation
        if (this.elements.trialComingUpStat && this.elements.trialComingUpStat.parentElement) {
            this.elements.trialComingUpStat.parentElement.style.cursor = 'pointer';
            this.elements.trialComingUpStat.parentElement.addEventListener('click', () => {
                if (window.app) {
                    window.app.navigate('orders');
                    // Add filter for upcoming trials
                    sessionStorage.setItem('orderFilter', 'upcomingTrials');
                }
            });
        }
        
        if (this.elements.deliveryComingUpStat && this.elements.deliveryComingUpStat.parentElement) {
            this.elements.deliveryComingUpStat.parentElement.style.cursor = 'pointer';
            this.elements.deliveryComingUpStat.parentElement.addEventListener('click', () => {
                if (window.app) {
                    window.app.navigate('orders');
                    // Add filter for upcoming deliveries
                    sessionStorage.setItem('orderFilter', 'upcomingDeliveries');
                }
            });
        }
        
        // Add calendar navigation handlers
        if (this.elements.prevMonthBtn) {
            this.elements.prevMonthBtn.addEventListener('click', () => {
                this.navigateCalendar(-1);
            });
        }
        
        if (this.elements.nextMonthBtn) {
            this.elements.nextMonthBtn.addEventListener('click', () => {
                this.navigateCalendar(1);
            });
        }
    }

    loadDashboardData() {
        this.updateStats();
        this.renderRecentOrders();
        this.renderUpcomingTrials();
        this.renderUpcomingDeliveries();
        this.updateCalendarMarkings();
        this.generateCalendar(); // Generate calendar on load
    }

    updateStats() {
        const dataManager = window.dataManager;
        if (!dataManager) return;

        const orders = dataManager.getOrders();
        const customers = dataManager.getCustomers();

        // Get upcoming events (within next 7 days)
        const upcomingTrials = this.getUpcomingTrials(orders);
        const upcomingDeliveries = this.getUpcomingDeliveries(orders);

        const stats = {
            total: orders.length,
            pending: orders.filter(order => order.status === 'In Progress').length,
            completed: orders.filter(order => order.status === 'Completed').length,
            customers: customers.length,
            trialComingUp: upcomingTrials.length,
            deliveryComingUp: upcomingDeliveries.length
        };

        // Update stat elements with animation
        this.animateCountUp(this.elements.totalOrders, stats.total);
        this.animateCountUp(this.elements.pendingOrders, stats.pending);
        this.animateCountUp(this.elements.completedOrders, stats.completed);
        this.animateCountUp(this.elements.totalCustomers, stats.customers);
        
        // Update new status elements
        if (this.elements.trialComingUpStat) {
            this.animateCountUp(this.elements.trialComingUpStat, stats.trialComingUp);
        }
        if (this.elements.deliveryComingUpStat) {
            this.animateCountUp(this.elements.deliveryComingUpStat, stats.deliveryComingUp);
        }
    }

    // Get orders with upcoming trials (within next 7 days)
    getUpcomingTrials(orders) {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        return orders.filter(order => {
            if (!order.trialDate) return false;
            const trialDate = new Date(order.trialDate);
            return trialDate >= today && trialDate <= nextWeek && order.status !== 'Completed' && order.status !== 'Cancelled';
        }).sort((a, b) => new Date(a.trialDate) - new Date(b.trialDate));
    }

    // Get orders with upcoming deliveries (within next 7 days)
    getUpcomingDeliveries(orders) {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        return orders.filter(order => {
            if (!order.deliveryDate) return false;
            const deliveryDate = new Date(order.deliveryDate);
            return deliveryDate >= today && deliveryDate <= nextWeek && order.status !== 'Completed' && order.status !== 'Cancelled';
        }).sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
    }

    // Render upcoming trials table
    renderUpcomingTrials() {
        if (!this.elements.upcomingTrialsTable) return;

        const dataManager = window.dataManager;
        if (!dataManager) return;

        const orders = dataManager.getOrders();
        const upcomingTrials = this.getUpcomingTrials(orders);

        this.elements.upcomingTrialsTable.innerHTML = '';

        if (upcomingTrials.length === 0) {
            this.elements.upcomingTrialsTable.innerHTML = `
                <tr>
                    <td colspan="3" class="px-4 py-8 text-center text-[#6a7681]">No upcoming trials</td>
                </tr>
            `;
            return;
        }

        upcomingTrials.forEach(order => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-[#dde1e3] hover:bg-[#f8fafc] cursor-pointer';
            
            const daysUntil = this.getDaysUntilDate(order.trialDate);
            const urgencyClass = daysUntil <= 2 ? 'text-[#ef4444] bg-[#fef2f2]' : 'text-[#f59e0b] bg-[#fffbeb]';
            
            tr.innerHTML = `
                <td class="px-4 py-3 text-[#121416] text-sm font-medium">#${order.id}</td>
                <td class="px-4 py-3 text-[#121416] text-sm">${order.customerName || order.customer}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${urgencyClass}">
                        ${this.formatDate(order.trialDate)} (${daysUntil}d)
                    </span>
                </td>
            `;

            tr.addEventListener('click', () => {
                if (window.app) {
                    window.app.navigate('orders');
                    setTimeout(() => this.highlightOrder(order.id), 100);
                }
            });

            this.elements.upcomingTrialsTable.appendChild(tr);
        });
    }

    // Render upcoming deliveries table
    renderUpcomingDeliveries() {
        if (!this.elements.upcomingDeliveriesTable) return;

        const dataManager = window.dataManager;
        if (!dataManager) return;

        const orders = dataManager.getOrders();
        const upcomingDeliveries = this.getUpcomingDeliveries(orders);

        this.elements.upcomingDeliveriesTable.innerHTML = '';

        if (upcomingDeliveries.length === 0) {
            this.elements.upcomingDeliveriesTable.innerHTML = `
                <tr>
                    <td colspan="3" class="px-4 py-8 text-center text-[#6a7681]">No upcoming deliveries</td>
                </tr>
            `;
            return;
        }

        upcomingDeliveries.forEach(order => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-[#dde1e3] hover:bg-[#f8fafc] cursor-pointer';
            
            const daysUntil = this.getDaysUntilDate(order.deliveryDate);
            const urgencyClass = daysUntil <= 2 ? 'text-[#ef4444] bg-[#fef2f2]' : 'text-[#10b981] bg-[#ecfdf5]';
            
            tr.innerHTML = `
                <td class="px-4 py-3 text-[#121416] text-sm font-medium">#${order.id}</td>
                <td class="px-4 py-3 text-[#121416] text-sm">${order.customerName || order.customer}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${urgencyClass}">
                        ${this.formatDate(order.deliveryDate)} (${daysUntil}d)
                    </span>
                </td>
            `;

            tr.addEventListener('click', () => {
                if (window.app) {
                    window.app.navigate('orders');
                    setTimeout(() => this.highlightOrder(order.id), 100);
                }
            });

            this.elements.upcomingDeliveriesTable.appendChild(tr);
        });
    }

    // Render recent orders table
    renderRecentOrders() {
        if (!this.elements.recentOrdersTable) return;

        const dataManager = window.dataManager;
        if (!dataManager) return;

        const orders = dataManager.getOrders();
        // Get most recent 5 orders
        const recentOrders = [...orders].sort((a, b) => {
            const dateA = new Date(a.trialDate || a.deliveryDate);
            const dateB = new Date(b.trialDate || b.deliveryDate);
            return dateB - dateA;
        }).slice(0, 5);

        this.elements.recentOrdersTable.innerHTML = '';

        if (recentOrders.length === 0) {
            this.elements.recentOrdersTable.innerHTML = `
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-[#6a7681]">No recent orders</td>
                </tr>
            `;
            return;
        }

        recentOrders.forEach(order => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-[#d1e6d9] hover:bg-[#f8fafc] cursor-pointer';
            
            const statusClass = order.status === 'Completed' ? 
                'bg-[#ecfdf5] text-[#10b981]' : 
                (order.status === 'Cancelled' ? 
                    'bg-[#fef2f2] text-[#ef4444]' : 
                    'bg-[#fffbeb] text-[#f59e0b]');
            
            tr.innerHTML = `
                <td class="px-4 py-3 text-[#121416] text-sm font-medium">#${order.id}</td>
                <td class="px-4 py-3 text-[#121416] text-sm">${order.customerName || order.customer}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${order.status}
                    </span>
                </td>
                <td class="px-4 py-3 text-[#121416] text-sm">${this.formatDate(order.trialDate) || 'N/A'}</td>
                <td class="px-4 py-3 text-[#121416] text-sm">${this.formatDate(order.deliveryDate) || 'N/A'}</td>
            `;

            tr.addEventListener('click', () => {
                if (window.app) {
                    window.app.navigate('orders');
                    setTimeout(() => this.highlightOrder(order.id), 100);
                }
            });

            this.elements.recentOrdersTable.appendChild(tr);
        });
    }

    // Update calendar with trial and delivery markings
    updateCalendarMarkings() {
        if (!this.elements.calendarContainer) return;

        const dataManager = window.dataManager;
        if (!dataManager) return;

        const orders = dataManager.getOrders();
        
        // Use class properties for current month/year instead of current date
        const currentMonth = this.currentMonth;
        const currentYear = this.currentYear;
        const today = new Date();
        
        // Update month label if it exists
        if (this.elements.currentMonthLabel) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            this.elements.currentMonthLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }

        // Get all trial and delivery dates for current month
        const monthEvents = [];
        
        orders.forEach(order => {
            if (order.trialDate) {
                const trialDate = new Date(order.trialDate);
                if (trialDate.getMonth() === currentMonth && trialDate.getFullYear() === currentYear) {
                    monthEvents.push({
                        date: trialDate.getDate(),
                        type: 'trial',
                        order: order,
                        urgent: this.isUrgent(trialDate, today)
                    });
                }
            }
            
            if (order.deliveryDate) {
                const deliveryDate = new Date(order.deliveryDate);
                if (deliveryDate.getMonth() === currentMonth && deliveryDate.getFullYear() === currentYear) {
                    monthEvents.push({
                        date: deliveryDate.getDate(),
                        type: 'delivery',
                        order: order,
                        urgent: this.isUrgent(deliveryDate, today)
                    });
                }
            }
        });

        // Apply markings to calendar cells
        const calendarCells = this.elements.calendarContainer.querySelectorAll('.text-center');
        calendarCells.forEach(cell => {
            const dayNumber = parseInt(cell.textContent);
            if (!dayNumber) return;

            // Reset classes
            cell.className = 'text-center text-sm p-2';
            
            // Check for events on this day
            const dayEvents = monthEvents.filter(event => event.date === dayNumber);
            
            if (dayEvents.length > 0) {
                // Check for urgent events (1-2 days away)
                const hasUrgentEvents = dayEvents.some(event => event.urgent);
                
                // Priority: trial > delivery
                const hasTrials = dayEvents.some(event => event.type === 'trial');
                const hasDeliveries = dayEvents.some(event => event.type === 'delivery');
                
                if (hasTrials && hasDeliveries) {
                    cell.className += hasUrgentEvents
                        ? ' rounded-full bg-gradient-to-br from-[#ffe5e7] to-[#e6f7f0] text-[#ef4444] border-2 border-[#ef4444] font-bold animate-pulse'
                        : ' rounded-full bg-gradient-to-br from-[#fffbeb] to-[#ecfdf5] text-[#f59e0b] border-2 border-[#f59e0b] font-bold';
                    
                    cell.title = `Trial & Delivery: ${dayEvents.length} events${hasUrgentEvents ? ' (URGENT)' : ''}`;
                } else if (hasTrials) {
                    cell.className += hasUrgentEvents 
                        ? ' rounded-full bg-[#ffe5e7] text-[#ef4444] border-2 border-[#ef4444] font-bold animate-pulse'
                        : ' rounded-full bg-[#fffbeb] text-[#f59e0b] border-2 border-[#f59e0b] font-bold';
                    
                    cell.title = `Trial: ${dayEvents.filter(e => e.type === 'trial').length} event(s)${hasUrgentEvents ? ' (URGENT)' : ''}`;
                } else if (hasDeliveries) {
                    cell.className += hasUrgentEvents
                        ? ' rounded-full bg-[#ffe5e7] text-[#ef4444] border-2 border-[#ef4444] font-bold animate-pulse'
                        : ' rounded-full bg-[#ecfdf5] text-[#10b981] border-2 border-[#10b981] font-bold';
                    
                    cell.title = `Delivery: ${dayEvents.filter(e => e.type === 'delivery').length} event(s)${hasUrgentEvents ? ' (URGENT)' : ''}`;
                }
                
                // Add click handler to cell
                cell.style.cursor = 'pointer';
                cell.onclick = () => this.showEventsDialog(dayEvents);
            }
        });
    }
    
    // Check if an event is urgent (1-2 days away)
    isUrgent(eventDate, today) {
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 2;
    }
    
    // Show events dialog when clicking on a calendar cell
    showEventsDialog(events) {
        // Create modal for showing events
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const content = document.createElement('div');
        content.className = 'bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-auto';
        
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-4';
        
        const title = document.createElement('h3');
        title.className = 'text-lg font-bold text-[#121416]';
        title.textContent = 'Events for ' + this.formatDate(new Date(events[0].order.trialDate || events[0].order.deliveryDate));
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'text-[#67737d] hover:text-[#121416]';
        closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        closeBtn.onclick = () => document.body.removeChild(modal);
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        const eventsList = document.createElement('div');
        eventsList.className = 'space-y-3';
        
        events.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'p-3 rounded-lg border ' + 
                (event.type === 'trial' ? 'border-[#f59e0b] bg-[#fffbeb]' : 'border-[#10b981] bg-[#ecfdf5]');
            
            const eventType = event.type.charAt(0).toUpperCase() + event.type.slice(1);
            const orderLink = document.createElement('button');
            orderLink.className = 'underline font-medium ' + 
                (event.type === 'trial' ? 'text-[#f59e0b]' : 'text-[#10b981]');
            orderLink.textContent = 'View Order Details';
            orderLink.onclick = () => {
                document.body.removeChild(modal);
                if (window.app) {
                    window.app.navigate('orders');
                    setTimeout(() => this.highlightOrder(event.order.id), 100);
                }
            };
            
            eventItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <p class="font-medium ${event.urgent ? 'text-[#ef4444]' : ''}">${eventType} Date</p>
                    ${event.urgent ? '<span class="bg-[#ef4444] text-white px-2 py-1 text-xs rounded-full animate-pulse">URGENT</span>' : ''}
                </div>
                <p class="text-sm text-[#121416]">Order: ${event.order.id}</p>
                <p class="text-sm text-[#121416]">Customer: ${event.order.customerName || event.order.customer}</p>
                <p class="text-sm text-[#121416] mb-2">Date: ${this.formatDate(new Date(event.type === 'trial' ? event.order.trialDate : event.order.deliveryDate))}</p>
            `;
            
            eventItem.appendChild(orderLink);
            eventsList.appendChild(eventItem);
        });
        
        content.appendChild(header);
        content.appendChild(eventsList);
        modal.appendChild(content);
        
        document.body.appendChild(modal);
    }

    printDashboard() {
        const dataManager = window.dataManager;
        if (!dataManager) {
            window.utils?.showToast('Unable to generate report. Data not available.', 'error');
            return;
        }

        try {
            const orders = dataManager.getOrders();
            const customers = dataManager.getCustomers();
            
            // Generate dashboard report content
            const reportContent = this.generateDashboardReport(orders, customers);
            
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            printWindow.document.write(reportContent);
            printWindow.document.close();
            
            // Print after content loads
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };

            window.utils?.showToast('Dashboard report generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating dashboard report:', error);
            window.utils?.showToast('Error generating report. Please try again.', 'error');
        }
    }

    /**
     * Print dashboard as PDF
     */
    printDashboardAsPDF() {
        // Get current data for PDF
        const orders = this.data || [];
        const stats = this.calculateStats(orders);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        
        // Generate HTML content for the PDF
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Fashion Admin Dashboard Report</title>
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
                font-size: 28px;
                font-weight: bold;
                color: #0066cc;
              }
              .subtitle {
                font-size: 18px;
                margin-top: 5px;
                color: #666;
              }
              .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
              }
              .stat-card {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
              }
              .stat-value {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .stat-label {
                font-size: 14px;
                color: #666;
              }
              .trials-coming-up { color: #f59e0b; }
              .deliveries-coming-up { color: #10b981; }
              .total-orders { color: #0066cc; }
              .pending-orders { color: #6366f1; }
              .section {
                margin-bottom: 30px;
              }
              .section-title {
                font-size: 20px;
                font-weight: bold;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
                margin-bottom: 15px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
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
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: bold;
              }
              .status-completed { background-color: #d1fae5; color: #065f46; }
              .status-progress { background-color: #dbeafe; color: #1e40af; }
              .status-cancelled { background-color: #fee2e2; color: #b91c1c; }
              .status-pending { background-color: #fef3c7; color: #92400e; }
              .footer {
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #eee;
                padding-top: 20px;
                margin-top: 40px;
              }
              @media print {
                body {
                  padding: 0;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .section {
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Fashion Admin Dashboard</div>
              <div class="subtitle">Business Overview Report</div>
              <div>Generated: ${new Date().toLocaleString()}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Key Metrics</div>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value trials-coming-up">${stats.trialsComingUp}</div>
                  <div class="stat-label">Trials Coming Up (Next 7 Days)</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value deliveries-coming-up">${stats.deliveriesComingUp}</div>
                  <div class="stat-label">Deliveries Coming Up (Next 7 Days)</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value total-orders">${stats.totalOrders}</div>
                  <div class="stat-label">Total Orders</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value pending-orders">${stats.pendingOrders}</div>
                  <div class="stat-label">Pending Orders</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Upcoming Trials (Next 7 Days)</div>
              ${this.generateTrialsTableForPDF(this.getUpcomingTrials(orders))}
            </div>
            
            <div class="section">
              <div class="section-title">Upcoming Deliveries (Next 7 Days)</div>
              ${this.generateDeliveriesTableForPDF(this.getUpcomingDeliveries(orders))}
            </div>
            
            <div class="section">
              <div class="section-title">Recent Orders</div>
              ${this.generateRecentOrdersTableForPDF(orders.slice(0, 10))}
            </div>
            
            <div class="footer">
              <p>Fashion Admin Dashboard &copy; 2025</p>
              <p>This is a computer-generated report. All data is current as of ${new Date().toLocaleDateString()}.</p>
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
     * Calculate dashboard statistics
     * @param {Array} orders - Array of orders
     */
    calculateDashboardStats(orders) {
        const trialsComingUp = this.getUpcomingTrials(orders).length;
        const deliveriesComingUp = this.getUpcomingDeliveries(orders).length;
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'Pending' || order.status === 'In Progress').length;
        
        return {
            trialsComingUp,
            deliveriesComingUp,
            totalOrders,
            pendingOrders
        };
    }

    /**
     * Generate trials table for PDF
     * @param {Array} trials - Array of upcoming trials
     */
    generateTrialsTableForPDF(trials) {
        if (trials.length === 0) {
            return '<p>No upcoming trials in the next 7 days.</p>';
        }
        
        const rows = trials.map(order => `
          <tr>
            <td>${order.orderId}</td>
            <td>${order.customerName}</td>
            <td>${this.formatDate(order.trialDate)}</td>
            <td><span class="status status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></td>
            <td>${this.getDaysUntilDate(order.trialDate)} days</td>
          </tr>
        `).join('');
        
        return `
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Trial Date</th>
                <th>Status</th>
                <th>Days Until</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        `;
    }

    /**
     * Generate deliveries table for PDF
     * @param {Array} deliveries - Array of upcoming deliveries
     */
    generateDeliveriesTableForPDF(deliveries) {
        if (deliveries.length === 0) {
            return '<p>No upcoming deliveries in the next 7 days.</p>';
        }
        
        const rows = deliveries.map(order => `
          <tr>
            <td>${order.orderId}</td>
            <td>${order.customerName}</td>
            <td>${this.formatDate(order.deliveryDate)}</td>
            <td><span class="status status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></td>
            <td>${this.getDaysUntilDate(order.deliveryDate)} days</td>
          </tr>
        `).join('');
        
        return `
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Days Until</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        `;
    }

    /**
     * Generate recent orders table for PDF
     * @param {Array} orders - Array of recent orders
     */
    generateRecentOrdersTableForPDF(orders) {
        if (orders.length === 0) {
            return '<p>No recent orders to display.</p>';
        }
        
        const rows = orders.map(order => `
          <tr>
            <td>${order.orderId}</td>
            <td>${order.customerName}</td>
            <td>${order.category || 'N/A'}</td>
            <td><span class="status status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></td>
            <td>${this.formatDate(order.createdAt)}</td>
          </tr>
        `).join('');
        
        return `
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        `;
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
          window.dashboardController = new DashboardController();
      });
  } else {
      window.dashboardController = new DashboardController();
  }
}

// Export for modular use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardController;
}

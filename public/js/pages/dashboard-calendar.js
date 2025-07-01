/**
 * Calendar Component for Dashboard
 * Handles calendar generation, navigation, and event marking
 */
class DashboardCalendar {
    constructor(options = {}) {
        this.options = {
            container: '.calendar-grid',
            monthLabelEl: '#currentMonthLabel',
            prevMonthBtn: '#prevMonthBtn',
            nextMonthBtn: '#nextMonthBtn',
            ...options
        };
        
        this.today = new Date();
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        
        this.container = document.querySelector(this.options.container);
        this.monthLabel = document.querySelector(this.options.monthLabelEl);
        this.prevMonthBtn = document.querySelector(this.options.prevMonthBtn);
        this.nextMonthBtn = document.querySelector(this.options.nextMonthBtn);
        
        if (!this.container) {
            console.error('Calendar container not found');
            return;
        }
        
        this.initialize();
    }
    
    initialize() {
        // Bind navigation events
        if (this.prevMonthBtn) {
            this.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
        }
        
        if (this.nextMonthBtn) {
            this.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));
        }
        
        // Generate initial calendar
        this.generateCalendar();
    }
    
    navigateMonth(direction) {
        // Update current month/year
        this.currentMonth += direction;
        
        // Handle year change
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        
        // Re-render calendar
        this.generateCalendar();
    }
    
    generateCalendar() {
        if (!this.container) return;
        
        // Update month label
        this.updateMonthLabel();
        
        // Get first day of month and number of days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Check if current month/year matches today's date
        const isCurrentMonth = this.today.getMonth() === this.currentMonth && 
                               this.today.getFullYear() === this.currentYear;
        const currentDate = this.today.getDate();
        
        // Generate calendar HTML
        let calendarHTML = `
            <!-- Calendar header -->
            <div class="text-center text-[#67737d] text-sm p-2">Sun</div>
            <div class="text-center text-[#67737d] text-sm p-2">Mon</div>
            <div class="text-center text-[#67737d] text-sm p-2">Tue</div>
            <div class="text-center text-[#67737d] text-sm p-2">Wed</div>
            <div class="text-center text-[#67737d] text-sm p-2">Thu</div>
            <div class="text-center text-[#67737d] text-sm p-2">Fri</div>
            <div class="text-center text-[#67737d] text-sm p-2">Sat</div>
        `;
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += `<div class="text-center text-sm p-2"></div>`;
        }
        
        // Add calendar days
        for (let day = 1; day <= daysInMonth; day++) {
            // Highlight today
            const isToday = isCurrentMonth && day === currentDate;
            const todayClass = isToday ? 'bg-[#edf2ff] text-[#4f46e5] font-bold' : '';
            
            calendarHTML += `<div class="text-center text-sm p-2 ${todayClass}" data-date="${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}">${day}</div>`;
        }
        
        // Set calendar HTML
        this.container.innerHTML = calendarHTML;
        
        // Apply event markings
        this.updateEventMarkings();
    }
    
    updateMonthLabel() {
        if (!this.monthLabel) return;
        
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.monthLabel.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
    }
    
    updateEventMarkings() {
        // Get orders data from window context
        const orders = window.dataManager?.getOrders() || window.orders || [];
        if (!orders.length) return;
        
        // Get all trial and delivery dates for current month
        const monthEvents = [];
        const today = new Date();
        
        orders.forEach(order => {
            if (order.status === 'Completed' || order.status === 'Cancelled') return;
            
            if (order.trialDate) {
                const trialDate = new Date(order.trialDate);
                if (trialDate.getMonth() === this.currentMonth && trialDate.getFullYear() === this.currentYear) {
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
                if (deliveryDate.getMonth() === this.currentMonth && deliveryDate.getFullYear() === this.currentYear) {
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
        const calendarCells = this.container.querySelectorAll('[data-date]');
        calendarCells.forEach(cell => {
            const dateStr = cell.getAttribute('data-date');
            if (!dateStr) return;
            
            const day = parseInt(cell.textContent);
            if (isNaN(day)) return;
            
            // Check for events on this day
            const dayEvents = monthEvents.filter(event => event.date === day);
            
            if (dayEvents.length > 0) {
                // Check for urgent events
                const hasUrgentEvents = dayEvents.some(event => event.urgent);
                
                // Check event types
                const hasTrials = dayEvents.some(event => event.type === 'trial');
                const hasDeliveries = dayEvents.some(event => event.type === 'delivery');
                
                if (hasTrials && hasDeliveries) {
                    cell.className = hasUrgentEvents
                        ? 'text-center text-sm p-2 rounded-full bg-gradient-to-br from-[#ffe5e7] to-[#e6f7f0] text-[#ef4444] border-2 border-[#ef4444] font-bold animate-pulse'
                        : 'text-center text-sm p-2 rounded-full bg-gradient-to-br from-[#fffbeb] to-[#ecfdf5] text-[#f59e0b] border-2 border-[#f59e0b] font-bold';
                    
                    cell.title = `Trial & Delivery: ${dayEvents.length} events${hasUrgentEvents ? ' (URGENT)' : ''}`;
                } else if (hasTrials) {
                    cell.className = hasUrgentEvents 
                        ? 'text-center text-sm p-2 rounded-full bg-[#ffe5e7] text-[#ef4444] border-2 border-[#ef4444] font-bold animate-pulse'
                        : 'text-center text-sm p-2 rounded-full bg-[#fffbeb] text-[#f59e0b] border-2 border-[#f59e0b] font-bold';
                    
                    cell.title = `Trial: ${dayEvents.filter(e => e.type === 'trial').length} event(s)${hasUrgentEvents ? ' (URGENT)' : ''}`;
                } else if (hasDeliveries) {
                    cell.className = hasUrgentEvents
                        ? 'text-center text-sm p-2 rounded-full bg-[#ffe5e7] text-[#ef4444] border-2 border-[#ef4444] font-bold animate-pulse'
                        : 'text-center text-sm p-2 rounded-full bg-[#ecfdf5] text-[#10b981] border-2 border-[#10b981] font-bold';
                    
                    cell.title = `Delivery: ${dayEvents.filter(e => e.type === 'delivery').length} event(s)${hasUrgentEvents ? ' (URGENT)' : ''}`;
                }
                
                // Add click handler to cell
                cell.style.cursor = 'pointer';
                cell.onclick = () => this.showEventsDialog(dayEvents);
            }
        });
    }
    
    isUrgent(eventDate, today) {
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 2;
    }
    
    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }
    
    showEventsDialog(events) {
        // Remove any existing event dialog
        const existingDialog = document.getElementById('calendarEventsDialog');
        if (existingDialog) {
            document.body.removeChild(existingDialog);
        }
        
        // Create modal for showing events
        const modal = document.createElement('div');
        modal.id = 'calendarEventsDialog';
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
            
            eventItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <p class="font-medium ${event.urgent ? 'text-[#ef4444]' : ''}">${eventType} Date</p>
                    ${event.urgent ? '<span class="bg-[#ef4444] text-white px-2 py-1 text-xs rounded-full animate-pulse">URGENT</span>' : ''}
                </div>
                <p class="text-sm text-[#121416]">Order: #${event.order.id}</p>
                <p class="text-sm text-[#121416]">Customer: ${event.order.customerName || event.order.customer}</p>
                <p class="text-sm text-[#121416] mb-2">Date: ${this.formatDate(new Date(event.type === 'trial' ? event.order.trialDate : event.order.deliveryDate))}</p>
            `;
            
            const orderLink = document.createElement('button');
            orderLink.className = 'underline font-medium ' + 
                (event.type === 'trial' ? 'text-[#f59e0b]' : 'text-[#10b981]');
            orderLink.textContent = 'View Order Details';
            orderLink.onclick = () => {
                document.body.removeChild(modal);
                if (window.app) {
                    window.app.navigate('orders');
                    setTimeout(() => {
                        const orderId = event.order.id;
                        if (window.displayOrderPreview) {
                            window.displayOrderPreview(orderId);
                        }
                    }, 100);
                }
            };
            
            eventItem.appendChild(orderLink);
            eventsList.appendChild(eventItem);
        });
        
        content.appendChild(header);
        content.appendChild(eventsList);
        modal.appendChild(content);
        
        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
}

// Export for usage in other files
window.DashboardCalendar = DashboardCalendar;

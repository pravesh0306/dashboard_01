/**
 * Dashboard Integration Test Script
 * This script helps test the new dashboard features programmatically
 * Run in browser console after loading the dashboard page
 */

class DashboardTester {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            details: []
        };
        this.testData = this.createTestData();
    }

    /**
     * Create test order data for validation
     */
    createTestData() {
        // Today is June 12, 2025 for testing
        return [
            { id: 'ORD-001', customerName: 'Sarah Johnson', status: 'In Progress', trialDate: '2025-06-13', deliveryDate: '2025-07-10' },
            { id: 'ORD-002', customerName: 'Mark Wilson', status: 'In Progress', trialDate: '2025-06-14', deliveryDate: '2025-07-15' },
            { id: 'ORD-003', customerName: 'Lisa Cooper', status: 'In Progress', trialDate: '2025-06-19', deliveryDate: '2025-07-20' },
            { id: 'ORD-004', customerName: 'John Davis', status: 'In Progress', trialDate: '2025-07-15', deliveryDate: '2025-08-10' },
            { id: 'ORD-005', customerName: 'Emily Brown', status: 'Completed', trialDate: '2025-06-14', deliveryDate: '2025-06-30' },
            { id: 'ORD-006', customerName: 'Michael Lee', status: 'Cancelled', trialDate: '2025-06-13', deliveryDate: '2025-07-05' },
        ];
    }

    /**
     * Run all dashboard tests
     */
    runTests() {
        console.log('🧪 Starting Dashboard Integration Tests');
        
        // 1. Load test data
        this.loadTestData();
        
        // 2. Test status cards
        this.testStatusCards();
        
        // 3. Test calendar markings
        this.testCalendarMarkings();
        
        // 4. Test interactive features
        this.testInteractiveFeatures();
        
        // 5. Test error handling
        this.testErrorHandling();
        
        // Output test results
        this.reportResults();
    }
    
    /**
     * Load test data into the application
     */
    loadTestData() {
        try {
            // Check if dataManager exists
            if (!window.dataManager) {
                console.error('⚠️ Unable to load test data: dataManager not found');
                return;
            }
            
            // Store original orders for restoration
            this.originalOrders = [...window.dataManager.getOrders()];
            
            // Override orders with test data
            window.dataManager.setOrders(this.testData);
            
            // Refresh dashboard to reflect test data
            if (window.dashboardController) {
                window.dashboardController.refresh();
            }
            
            this.recordTestResult('Load test data', true, 'Successfully loaded test data');
        } catch (error) {
            this.recordTestResult('Load test data', false, `Error loading test data: ${error.message}`);
        }
    }
    
    /**
     * Test status cards display correct counts and styling
     */
    testStatusCards() {
        try {
            // Test Trial Coming Up count
            const expectedTrialCount = 2; // ORD-001, ORD-002 (within 7 days, not completed/cancelled)
            const trialElement = document.getElementById('trialsComingUp') || 
                                document.getElementById('trialComingUpStat');
            
            if (!trialElement) {
                throw new Error('Trial Coming Up element not found');
            }
            
            const actualTrialCount = parseInt(trialElement.textContent);
            const trialTestPassed = actualTrialCount === expectedTrialCount;
            
            this.recordTestResult(
                'Trial Coming Up count', 
                trialTestPassed, 
                `Expected: ${expectedTrialCount}, Actual: ${actualTrialCount}`
            );
            
            // Test Delivery Coming Up count
            const expectedDeliveryCount = 0; // No deliveries within next 7 days
            const deliveryElement = document.getElementById('deliveriesComingUp') || 
                                   document.getElementById('deliveryComingUpStat');
            
            if (!deliveryElement) {
                throw new Error('Delivery Coming Up element not found');
            }
            
            const actualDeliveryCount = parseInt(deliveryElement.textContent);
            const deliveryTestPassed = actualDeliveryCount === expectedDeliveryCount;
            
            this.recordTestResult(
                'Delivery Coming Up count', 
                deliveryTestPassed, 
                `Expected: ${expectedDeliveryCount}, Actual: ${actualDeliveryCount}`
            );
            
            // Test card styling
            const trialCard = trialElement.closest('.border-[#f59e0b]');
            const deliveryCard = deliveryElement.closest('.border-[#10b981]');
            
            this.recordTestResult(
                'Trial card styling',
                !!trialCard,
                'Trial card should have orange styling'
            );
            
            this.recordTestResult(
                'Delivery card styling',
                !!deliveryCard,
                'Delivery card should have green styling'
            );
            
        } catch (error) {
            this.recordTestResult('Status Cards Test', false, `Error testing status cards: ${error.message}`);
        }
    }
    
    /**
     * Test calendar markings for dates
     */
    testCalendarMarkings() {
        try {
            const calendarContainer = document.querySelector('.calendar-grid');
            if (!calendarContainer) {
                throw new Error('Calendar container not found');
            }
            
            // Find today's cell (June 12)
            const todayCell = this.findCalendarCell(12);
            this.recordTestResult(
                'Today highlighting',
                todayCell && todayCell.classList.contains('bg-[#edf2ff]'),
                'Today should be highlighted with blue background'
            );
            
            // Test trial date markings (June 13, 14, 19)
            [13, 14, 19].forEach(day => {
                const cell = this.findCalendarCell(day);
                this.recordTestResult(
                    `Trial marking for day ${day}`,
                    cell && (cell.classList.contains('border-[#f59e0b]') || 
                           cell.classList.contains('border-[#ef4444]')),
                    `Day ${day} should be marked with orange or red border`
                );
            });
            
            // Test urgent event styling (June 13, 14)
            [13, 14].forEach(day => {
                const cell = this.findCalendarCell(day);
                this.recordTestResult(
                    `Urgent styling for day ${day}`,
                    cell && cell.classList.contains('animate-pulse'),
                    `Day ${day} should have urgent styling (animate-pulse)`
                );
            });
            
            // Test month navigation
            if (window.dashboardController) {
                // Navigate to next month
                window.dashboardController.navigateCalendar(1);
                
                // Check if month label updated
                const monthLabel = document.getElementById('currentMonthLabel');
                const isJuly = monthLabel && monthLabel.textContent.includes('July 2025');
                
                this.recordTestResult(
                    'Month navigation - forward',
                    isJuly,
                    'Calendar should navigate to July 2025'
                );
                
                // Check July 15 marking (should have trial date)
                const julyCell = this.findCalendarCell(15);
                this.recordTestResult(
                    'July calendar marking',
                    julyCell && julyCell.classList.contains('border-[#f59e0b]'),
                    'July 15 should be marked with orange border'
                );
                
                // Navigate back to current month
                window.dashboardController.navigateCalendar(-1);
            }
            
        } catch (error) {
            this.recordTestResult('Calendar Markings Test', false, `Error testing calendar markings: ${error.message}`);
        }
    }
    
    /**
     * Test interactive features (clicks and navigation)
     */
    testInteractiveFeatures() {
        try {
            // Test calendar cell click
            const cell = this.findCalendarCell(13); // June 13
            if (cell) {
                // Simulate click (can't fully test as it creates a modal)
                this.recordTestResult(
                    'Calendar cell click',
                    cell.style.cursor === 'pointer' && typeof cell.onclick === 'function',
                    'Calendar cell should be clickable'
                );
            }
            
            // Status card click (can only check if handler exists)
            const trialElement = document.getElementById('trialsComingUp') || 
                               document.getElementById('trialComingUpStat');
            
            if (trialElement && trialElement.parentElement) {
                this.recordTestResult(
                    'Status card click',
                    trialElement.parentElement.style.cursor === 'pointer',
                    'Status card should be clickable'
                );
            }
            
        } catch (error) {
            this.recordTestResult('Interactive Features Test', false, `Error testing interactive features: ${error.message}`);
        }
    }
    
    /**
     * Test error handling cases
     */
    testErrorHandling() {
        try {
            // Test handling with no data
            const emptyData = [];
            window.dataManager.setOrders(emptyData);
            
            if (window.dashboardController) {
                window.dashboardController.refresh();
            }
            
            // Check if status cards handle zero state
            const trialElement = document.getElementById('trialsComingUp') || 
                               document.getElementById('trialComingUpStat');
            
            this.recordTestResult(
                'No data handling - status cards',
                trialElement && trialElement.textContent === '0',
                'Status card should show 0 when no data available'
            );
            
            // Restore original data
            window.dataManager.setOrders(this.originalOrders || []);
            
            if (window.dashboardController) {
                window.dashboardController.refresh();
            }
            
        } catch (error) {
            this.recordTestResult('Error Handling Test', false, `Error testing error handling: ${error.message}`);
            // Restore original data
            if (this.originalOrders) {
                window.dataManager.setOrders(this.originalOrders);
                if (window.dashboardController) {
                    window.dashboardController.refresh();
                }
            }
        }
    }
    
    /**
     * Find calendar cell with specific day number
     */
    findCalendarCell(day) {
        const cells = document.querySelectorAll('.calendar-grid .text-center');
        for (let cell of cells) {
            if (cell.textContent.trim() === day.toString()) {
                return cell;
            }
        }
        return null;
    }
    
    /**
     * Record a test result
     */
    recordTestResult(testName, passed, message) {
        if (passed) {
            this.testResults.passed++;
            console.log(`✅ ${testName}: ${message}`);
        } else {
            this.testResults.failed++;
            console.error(`❌ ${testName}: ${message}`);
        }
        
        this.testResults.details.push({
            name: testName,
            passed: passed,
            message: message
        });
    }
    
    /**
     * Report final test results
     */
    reportResults() {
        console.log('=== Dashboard Integration Test Results ===');
        console.log(`Total Tests: ${this.testResults.passed + this.testResults.failed}`);
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log('=======================================');
        
        return {
            success: this.testResults.failed === 0,
            results: this.testResults
        };
    }
    
    /**
     * Cleanup after testing
     */
    cleanup() {
        // Restore original data
        if (this.originalOrders) {
            window.dataManager.setOrders(this.originalOrders);
            if (window.dashboardController) {
                window.dashboardController.refresh();
            }
        }
        console.log('🧹 Test cleanup completed');
    }
}

// Execute tests
const dashboardTester = new DashboardTester();
const testResults = dashboardTester.runTests();

// Add global access for manual testing
window.dashboardTester = dashboardTester;

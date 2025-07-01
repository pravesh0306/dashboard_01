# Dashboard Integration Test Plan

This document outlines the testing plan for the new dashboard features including Trial Coming Up Status, Delivery Coming Up Status, and Calendar Markings.

## 1. Test Environment Setup

- **Date**: June 12, 2025 (Current date for testing)
- **Browser**: Chrome/Firefox/Safari (test across all major browsers)
- **Screen Sizes**: Desktop, Tablet, Mobile (responsive design testing)

## 2. Test Data Setup

Create a set of test orders with varying dates:

| Order ID | Customer | Status | Trial Date | Delivery Date |
|---------|----------|--------|------------|---------------|
| ORD-001 | Sarah Johnson | In Progress | 2025-06-13 | 2025-07-10 | 
| ORD-002 | Mark Wilson | In Progress | 2025-06-14 | 2025-07-15 |
| ORD-003 | Lisa Cooper | In Progress | 2025-06-19 | 2025-07-20 |
| ORD-004 | John Davis | In Progress | 2025-07-15 | 2025-08-10 |
| ORD-005 | Emily Brown | Completed | 2025-06-14 | 2025-06-30 |
| ORD-006 | Michael Lee | Cancelled | 2025-06-13 | 2025-07-05 |

## 3. Test Cases

### 3.1 Status Card Display Tests

1. **Trial Coming Up Count Test**:
   - **Expected**: Status card should display "2" (ORD-001, ORD-002)
   - **Reason**: Only count In Progress orders with trial dates within next 7 days
   
2. **Delivery Coming Up Count Test**:
   - **Expected**: Status card should display "0"
   - **Reason**: No delivery dates within next 7 days that aren't completed or cancelled

3. **Status Card Color Test**:
   - **Expected**: Trial Coming Up card has orange accents, Delivery Coming Up card has green accents
   - **Validation**: Visual inspection of gradient colors and border colors

### 3.2 Calendar Marking Tests

1. **Today's Highlight Test**:
   - **Expected**: June 12 should be highlighted as today (blue background)
   
2. **Trial Date Markings Test**:
   - **Expected**: June 13, 14, 19 should have orange border/background
   - **Validation**: Visual inspection of calendar cells

3. **Urgent Event Test (1-2 days away)**:
   - **Expected**: June 13 and 14 should have red/urgent styling (animate-pulse class)
   - **Validation**: Visual inspection of calendar cells with animation

4. **Multi-event Date Test**:
   - **Expected**: If a date has both trial and delivery events, should show gradient styling
   - **Validation**: Visual inspection of any dates with both events

5. **Month Navigation Test**:
   - **Action**: Click next month button
   - **Expected**: Calendar should show July with July 15 marked for both trial and delivery dates
   - **Action**: Click previous month button twice
   - **Expected**: Calendar should show May with no marked dates

### 3.3 Dynamic Updating Tests

1. **Order Status Change Test**:
   - **Action**: Change status of ORD-001 from In Progress to Completed
   - **Expected**: Trial Coming Up count should decrease to 1, calendar marking should remain but not count toward status

2. **Date Change Test**:
   - **Action**: Change trial date of ORD-003 from 2025-06-19 to 2025-06-16
   - **Expected**: Trial Coming Up count should increase to 3, calendar marking should update

### 3.4 Interactive Feature Tests

1. **Status Card Click Navigation Test**:
   - **Action**: Click Trial Coming Up status card
   - **Expected**: Page should navigate to Orders view with filter applied for upcoming trials

2. **Calendar Event Click Test**:
   - **Action**: Click on a calendar cell with event(s)
   - **Expected**: Modal dialog should appear showing event details
   - **Action**: Click "View Order Details" in modal
   - **Expected**: Should navigate to Orders view with that order highlighted

### 3.5 Mobile Responsiveness Tests

1. **Mobile View Status Cards Test**:
   - **Action**: Resize browser to mobile width (<768px)
   - **Expected**: Status cards should stack vertically, maintain proper spacing and appearance

2. **Mobile Calendar Test**:
   - **Action**: Resize browser to mobile width (<768px)
   - **Expected**: Calendar should adapt to smaller screen, maintain usability and appearance

### 3.6 Error Handling Tests

1. **No Data Test**:
   - **Action**: Clear all orders data
   - **Expected**: Status cards should show "0", calendar should render without markings
   - **Expected**: "No upcoming trials/deliveries" should appear in tables

2. **Invalid Date Test**:
   - **Action**: Add order with invalid date format
   - **Expected**: Application should handle gracefully, not crash

## 4. Cross-browser Testing

Repeat key tests in:
- Chrome
- Firefox
- Safari
- Edge

## 5. Performance Testing

1. **Large Dataset Test**:
   - **Action**: Load dashboard with 100+ orders
   - **Expected**: Status cards and calendar should render within 2 seconds
   - **Expected**: No lag when navigating months

## Test Results

Document test results with:
- Screenshots of passed/failed tests
- Description of any bugs found
- Performance metrics

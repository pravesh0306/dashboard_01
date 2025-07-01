/**
 * Data Management Module
 * Handles sample data and data operations
 */
class DataManager {
  constructor() {
    this.orders = this.getOrdersFromStorage();
    this.customers = this.getCustomersFromStorage();
    this.measurements = this.getMeasurementsFromStorage();
  }

  /**
   * Get orders from localStorage or return sample data
   */
  getOrdersFromStorage() {
    const stored = localStorage.getItem('orders');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored orders:', error);
      }
    }
    return this.getSampleOrders();
  }

  /**
   * Get customers from localStorage or return sample data
   */
  getCustomersFromStorage() {
    const stored = localStorage.getItem('customers');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored customers:', error);
      }
    }
    return this.getSampleCustomers();
  }

  /**
   * Get measurements from localStorage or return empty object
   */
  getMeasurementsFromStorage() {
    const stored = localStorage.getItem('measurements');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored measurements:', error);
      }
    }
    return {};
  }

  /**
   * Sample orders data
   */
  getSampleOrders() {    return [
      {
        id: 'ORD-001',
        customerName: 'Sarah Johnson',
        phone: '+1 234 567 8901',
        category: 'Bridal Gown',
        type: 'Custom',
        description: 'Elegant A-line wedding dress with lace bodice and flowing chiffon skirt',
        trialDate: '2025-06-15',
        deliveryDate: '2025-07-15',
        status: 'In Progress',
        createdAt: '2025-06-01',
        measurements: {
          chest: 36,
          waist: 28,
          hip: 38
        },
        price: 2500,
        canvaUrl: ''
      },
      {
        id: 'ORD-002',
        customerName: 'Emily Chen',
        phone: '+1 234 567 8902',
        category: 'Evening Dress',
        type: 'Standard',
        description: 'Black cocktail dress with sequin details',
        trialDate: '2025-06-18',
        deliveryDate: '2025-06-20',
        status: 'Completed',
        createdAt: '2025-05-15',
        measurements: {
          chest: 34,
          waist: 26,
          hip: 36
        },
        price: 800,
        canvaUrl: ''
      },
      {
        id: 'ORD-003',
        customerName: 'Maria Rodriguez',
        phone: '+1 234 567 8903',
        category: 'Formal Wear',
        type: 'Alteration',
        description: 'Hemming and taking in waist of navy blue gown',
        trialDate: '2025-06-16',
        deliveryDate: '2025-06-25',
        status: 'Pending',
        createdAt: '2025-06-05',
        measurements: {
          chest: 38,
          waist: 32,
          hip: 40
        },
        price: 150,
        canvaUrl: ''
      },
      {
        id: 'ORD-004',
        customerName: 'Jessica Williams',
        phone: '+1 234 567 8904',
        category: 'Cocktail Dress',
        type: 'Custom',
        description: 'Red silk cocktail dress with off-shoulder design',
        trialDate: '2025-06-14',
        deliveryDate: '2025-07-01',
        status: 'In Progress',
        createdAt: '2025-05-28',
        measurements: {
          chest: 35,
          waist: 27,
          hip: 37
        },
        price: 1200,
        canvaUrl: ''
      },
      {
        id: 'ORD-005',
        customerName: 'Ashley Brown',
        phone: '+1 234 567 8905',
        category: 'Bridal Gown',
        type: 'Custom',
        description: 'Vintage-inspired wedding dress with pearl embellishments',
        trialDate: '2025-06-17',
        deliveryDate: '2025-08-10',
        status: 'Pending',
        createdAt: '2025-06-03',
        measurements: {
          chest: 33,
          waist: 25,
          hip: 35
        },
        price: 3000,
        canvaUrl: ''
      }
    ];
  }

  /**
   * Sample customers data
   */
  getSampleCustomers() {
    return [
      {
        id: 'CUST-001',
        name: 'Sarah Johnson',
        phone: '+1 234 567 8901',
        email: 'sarah.johnson@email.com',
        orders: ['ORD-001'],
        createdAt: '2025-06-01'
      },
      {
        id: 'CUST-002',
        name: 'Emily Chen',
        phone: '+1 234 567 8902',
        email: 'emily.chen@email.com',
        orders: ['ORD-002'],
        createdAt: '2025-05-15'
      },
      {
        id: 'CUST-003',
        name: 'Maria Rodriguez',
        phone: '+1 234 567 8903',
        email: 'maria.rodriguez@email.com',
        orders: ['ORD-003'],
        createdAt: '2025-06-05'
      },
      {
        id: 'CUST-004',
        name: 'Jessica Williams',
        phone: '+1 234 567 8904',
        email: 'jessica.williams@email.com',
        orders: ['ORD-004'],
        createdAt: '2025-05-28'
      },
      {
        id: 'CUST-005',
        name: 'Ashley Brown',
        phone: '+1 234 567 8905',
        email: 'ashley.brown@email.com',
        orders: ['ORD-005'],
        createdAt: '2025-06-03'
      }
    ];
  }

  /**
   * Get all orders
   */
  getOrders() {
    return [...this.orders];
  }

  /**
   * Get order by ID
   */
  getOrderById(id) {
    return this.orders.find(order => order.id === id);
  }

  /**
   * Add new order
   */
  addOrder(orderData) {
    const order = {
      id: this.generateOrderId(),
      ...orderData,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    this.orders.unshift(order);
    this.saveOrders();
    return order;
  }

  /**
   * Update order
   */
  updateOrder(id, updates) {
    const index = this.orders.findIndex(order => order.id === id);
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], ...updates };
      this.saveOrders();
      return this.orders[index];
    }
    return null;
  }

  /**
   * Delete order
   */
  deleteOrder(id) {
    const index = this.orders.findIndex(order => order.id === id);
    if (index !== -1) {
      const deleted = this.orders.splice(index, 1)[0];
      this.saveOrders();
      return deleted;
    }
    return null;
  }

  /**
   * Get all customers
   */
  getCustomers() {
    return [...this.customers];
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id) {
    return this.customers.find(customer => customer.id === id);
  }

  /**
   * Add new customer
   */
  addCustomer(customerData) {
    const customer = {
      id: this.generateCustomerId(),
      ...customerData,
      orders: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    this.customers.unshift(customer);
    this.saveCustomers();
    return customer;
  }

  /**
   * Update customer
   */
  updateCustomer(id, updates) {
    const index = this.customers.findIndex(customer => customer.id === id);
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], ...updates };
      this.saveCustomers();
      return this.customers[index];
    }
    return null;
  }

  /**
   * Delete customer
   */
  deleteCustomer(id) {
    const index = this.customers.findIndex(customer => customer.id === id);
    if (index !== -1) {
      const deleted = this.customers.splice(index, 1)[0];
      this.saveCustomers();
      return deleted;
    }
    return null;
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStats() {
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(order => order.status === 'Pending').length;
    const completedOrders = this.orders.filter(order => order.status === 'Completed').length;
    const totalCustomers = this.customers.length;
    
    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers
    };
  }

  /**
   * Get recent orders (last 5)
   */
  getRecentOrders() {
    return this.orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }

  /**
   * Generate unique order ID
   */
  generateOrderId() {
    const lastOrder = this.orders
      .map(order => parseInt(order.id.split('-')[1]))
      .filter(num => !isNaN(num))
      .sort((a, b) => b - a)[0] || 0;
    
    return `ORD-${String(lastOrder + 1).padStart(3, '0')}`;
  }

  /**
   * Generate unique customer ID
   */
  generateCustomerId() {
    const lastCustomer = this.customers
      .map(customer => parseInt(customer.id.split('-')[1]))
      .filter(num => !isNaN(num))
      .sort((a, b) => b - a)[0] || 0;
    
    return `CUST-${String(lastCustomer + 1).padStart(3, '0')}`;
  }

  /**
   * Save orders to localStorage
   */
  saveOrders() {
    localStorage.setItem('orders', JSON.stringify(this.orders));
  }

  /**
   * Save customers to localStorage
   */
  saveCustomers() {
    localStorage.setItem('customers', JSON.stringify(this.customers));
  }

  /**
   * Save measurements to localStorage
   */
  saveMeasurements() {
    localStorage.setItem('measurements', JSON.stringify(this.measurements));
  }

  /**
   * Clear all data
   */
  clearAllData() {
    this.orders = [];
    this.customers = [];
    this.measurements = {};
    
    localStorage.removeItem('orders');
    localStorage.removeItem('customers');
    localStorage.removeItem('measurements');
  }

  /**
   * Export data as JSON
   */
  exportData() {
    return {
      orders: this.orders,
      customers: this.customers,
      measurements: this.measurements,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import data from JSON
   */
  importData(data) {
    if (data.orders) {
      this.orders = data.orders;
      this.saveOrders();
    }
    
    if (data.customers) {
      this.customers = data.customers;
      this.saveCustomers();
    }
    
    if (data.measurements) {
      this.measurements = data.measurements;
      this.saveMeasurements();
    }
  }
}

// Create global instance
window.dataManager = new DataManager();

// Export for use in other modules
window.DataManager = DataManager;

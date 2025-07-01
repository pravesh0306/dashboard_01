// Sample data for testing the Fashion Admin Dashboard
// This script adds sample orders to localStorage for testing

(function() {
  const sampleOrders = [
    {
      orderId: 'ORD-2025-001',
      customerName: 'Sarah Johnson',
      category: 'Bridal Gown',
      type: 'Custom',
      status: 'In Progress',
      description: 'Elegant A-line wedding dress with lace bodice and flowing chiffon skirt',
      deliveryDate: '2025-07-15',
      trialDate: '2025-06-20',
      createdAt: '2025-06-01T10:00:00.000Z',
      canvaUrl: '',
      fabricAttachment: null,
      styleReferenceAttachment: null,
      additionalAttachments: []
    },
    {
      orderId: 'ORD-2025-002',
      customerName: 'Emily Chen',
      category: 'Evening Dress',
      type: 'Standard',
      status: 'Completed',
      description: 'Black cocktail dress with sequin details for formal event',
      deliveryDate: '2025-06-20',
      trialDate: '2025-06-18',
      createdAt: '2025-05-15T14:30:00.000Z',
      canvaUrl: '',
      fabricAttachment: null,
      styleReferenceAttachment: null,
      additionalAttachments: []
    },
    {
      orderId: 'ORD-2025-003',
      customerName: 'Maria Rodriguez',
      category: 'Formal Wear',
      type: 'Alteration',
      status: 'Pending',
      description: 'Hemming and taking in waist of navy blue gown',
      deliveryDate: '2025-06-25',
      trialDate: '2025-06-22',
      createdAt: '2025-06-05T09:15:00.000Z',
      canvaUrl: '',
      fabricAttachment: null,
      styleReferenceAttachment: null,
      additionalAttachments: []
    },
    {
      orderId: 'ORD-2025-004',
      customerName: 'Jessica Williams',
      category: 'Cocktail Dress',
      type: 'Custom',
      status: 'In Progress',
      description: 'Red silk cocktail dress with off-shoulder design',
      deliveryDate: '2025-07-01',
      trialDate: '2025-06-24',
      createdAt: '2025-05-28T16:45:00.000Z',
      canvaUrl: '',
      fabricAttachment: null,
      styleReferenceAttachment: null,
      additionalAttachments: []
    },
    {
      orderId: 'ORD-2025-005',
      customerName: 'Ashley Brown',
      category: 'Bridal Gown',
      type: 'Custom',
      status: 'Cancelled',
      description: 'Vintage-inspired wedding dress with pearl embellishments',
      deliveryDate: '2025-08-10',
      trialDate: '2025-06-26',
      createdAt: '2025-06-03T11:20:00.000Z',
      canvaUrl: '',
      fabricAttachment: null,
      styleReferenceAttachment: null,
      additionalAttachments: []
    }
  ];

  // Store sample data in localStorage
  localStorage.setItem('fashionOrders', JSON.stringify(sampleOrders));
  
  console.log('✅ Sample orders data loaded successfully!');
  console.log(`📊 ${sampleOrders.length} orders added to localStorage`);
  
  // Show notification if available
  if (typeof window !== 'undefined' && document.body) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 px-4 py-3 rounded-lg shadow-md bg-green-100 text-green-800 z-50';
    notification.textContent = `✅ Sample data loaded! ${sampleOrders.length} orders added.`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('opacity-0');
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }
})();

// Global variables
let currentCompany = '';
let currentUser = '';
let userRole = '';

// Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbydinl-4WLr2pPF0xH2ZDPmA0o57flRVdU-5RwcoUF8Db0j38LGEdP3Atnk6_51h4-c4Q/exec';

// Initialize the system
$(document).ready(function() {
  // Check if user is logged in
  const loggedInUser = localStorage.getItem('currentUser');
  if (loggedInUser) {
    currentUser = loggedInUser;
    userRole = localStorage.getItem('userRole');
    currentCompany = localStorage.getItem('currentCompany');
    showMainContainer();
    loadDashboard();
  }

  // Login form submission
  $('#login-form').submit(function(e) {
    e.preventDefault();
    const username = $('#login-username').val();
    const password = $('#login-password').val();
    const company = $('#login-company').val();
    
    // Show loading indicator
    $('#login-message').html('<div class="alert alert-info">Logging in...</div>');
    
    // Authenticate user
    callGoogleScript('authenticateUser', [username, password], function(result) {
      if (result.success) {
        currentUser = username;
        userRole = result.role;
        currentCompany = company;
        localStorage.setItem('currentUser', currentUser);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('currentCompany', currentCompany);
        showMainContainer();
        loadDashboard();
      } else {
        $('#login-message').html('<div class="alert alert-danger">' + (result.message || 'Invalid username or password') + '</div>');
      }
    });
  });

  // Logout link click
  $('#logout-link').click(function() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentCompany');
    location.reload();
  });

  // Navigation link clicks
  $('#dashboard-link').click(function() {
    showSection('dashboard');
    loadDashboard();
  });

  $('#inventory-link').click(function() {
    showSection('inventory');
    loadInventoryData();
  });

  $('#stock-out-link').click(function() {
    showSection('stock-out');
    loadStockOutData();
  });

  $('#sales-order-link').click(function() {
    showSection('sales-order');
    loadSalesOrderData();
  });

  $('#purchase-link').click(function() {
    showSection('purchase');
    loadPurchaseData();
  });

  $('#forecast-link').click(function() {
    showSection('forecast');
    loadForecastData();
  });

  $('#settings-link').click(function() {
    showSection('settings');
    loadSettingsData();
  });

  $('#users-link').click(function() {
    showSection('users');
    loadUserData();
  });

// Add item form submission
$('#add-item-form').submit(function(e) {
  e.preventDefault();
  const itemId = $('#item-id').val();
  const itemName = $('#item-name').val();
  const quantity = parseInt($('#item-quantity').val());
  const unitPrice = parseFloat($('#item-price').val());
  
  // Validate inputs
  if (!itemId || !itemName || isNaN(quantity) || isNaN(unitPrice)) {
    alert('Please fill in all fields with valid values');
    return;
  }
  
  // Create a properly formatted array
  const itemData = [currentCompany, itemId, itemName, quantity, unitPrice];
  
  console.log('Sending item data:', itemData);
  
  callGoogleScript('addInventoryItem', itemData, function(result) {
    console.log('Received result:', result);
    alert(result);
    $('#add-item-modal').modal('hide');
    $('#add-item-form')[0].reset();
    loadInventoryData();
  });
});


  // Add stock out form submission
$('#add-stock-out-form').submit(function(e) {
  e.preventDefault();
  const orderId = $('#stock-out-order-id').val();
  const customer = $('#stock-out-customer').val();
  const quantity = parseInt($('#stock-out-quantity').val());
  const status = $('#stock-out-status').val();
  
  // Create a properly formatted array
  const stockOutData = [currentCompany, orderId, customer, quantity, status];
  
  callGoogleScript('addStockOutEntry', stockOutData, function(result) {
    alert(result);
    $('#add-stock-out-modal').modal('hide');
    $('#add-stock-out-form')[0].reset();
    loadStockOutData();
  });
});

// Add sales order form submission
$('#add-sales-order-form').submit(function(e) {
  e.preventDefault();
  const orderId = $('#sales-order-order-id').val();
  const customer = $('#sales-order-customer').val();
  const items = $('#sales-order-items').val();
  const totalAmount = parseFloat($('#sales-order-amount').val());
  const status = $('#sales-order-status').val();
  
  // Create a properly formatted array
  const salesOrderData = [currentCompany, orderId, customer, items, totalAmount, status];
  
  callGoogleScript('addSalesOrder', salesOrderData, function(result) {
    alert(result);
    $('#add-sales-order-modal').modal('hide');
    $('#add-sales-order-form')[0].reset();
    loadSalesOrderData();
  });
});

// Add purchase form submission
$('#add-purchase-form').submit(function(e) {
  e.preventDefault();
  const orderId = $('#purchase-order-id').val();
  const supplier = $('#purchase-supplier').val();
  const items = $('#purchase-items').val();
  const totalAmount = parseFloat($('#purchase-amount').val());
  const status = $('#purchase-status').val();
  
  // Create a properly formatted array
  const purchaseData = [currentCompany, orderId, supplier, items, totalAmount, status];
  
  callGoogleScript('addPurchaseEntry', purchaseData, function(result) {
    alert(result);
    $('#add-purchase-modal').modal('hide');
    $('#add-purchase-form')[0].reset();
    loadPurchaseData();
  });
});

// Add user form submission
$('#add-user-form').submit(function(e) {
  e.preventDefault();
  const username = $('#add-user-username').val();
  const email = $('#add-user-email').val();
  const role = $('#add-user-role').val();
  const password = $('#add-user-password').val();
  
  // Create a properly formatted array
  const userData = [username, email, role, password];
  
  callGoogleScript('addUser', userData, function(result) {
    alert(result);
    $('#add-user-modal').modal('hide');
    $('#add-user-form')[0].reset();
    loadUserData();
  });
});


  // Update status form submission
  $('#update-status-form').submit(function(e) {
    e.preventDefault();
    const orderId = $('#update-order-id').val();
    const newStatus = $('#new-status').val();
    const orderType = $('#update-order-type').val();
    
    if (orderType === 'stock-out') {
      callGoogleScript('updateStockOutStatus', [orderId, newStatus], function(result) {
        alert(result);
        $('#update-status-modal').modal('hide');
        loadStockOutData();
      });
    } else if (orderType === 'sales-order') {
      callGoogleScript('updateSalesOrderStatus', [orderId, newStatus], function(result) {
        alert(result);
        $('#update-status-modal').modal('hide');
        loadSalesOrderData();
      });
    } else if (orderType === 'purchase') {
      callGoogleScript('updatePurchaseStatus', [orderId, newStatus], function(result) {
        alert(result);
        $('#update-status-modal').modal('hide');
        loadPurchaseData();
      });
    }
  });

  // Settings form submission
  $('#settings-form').submit(function(e) {
    e.preventDefault();
    const settings = [
      ['orderNotification', $('#order-notification').prop('checked')],
      ['stockNotification', $('#stock-notification').prop('checked')],
      ['lowStockNotification', $('#low-stock-notification').prop('checked')],
      ['lowStockThreshold', parseInt($('#low-stock-threshold').val())],
      ['currency', $('#currency').val()]
    ];
    
    callGoogleScript('updateSettings', [settings], function(result) {
      alert(result);
    });
  });

  // Search functionality
  $('#inventory-search').on('keyup', function() {
    $('#inventory-table').DataTable().search(this.value).draw();
  });

  $('#stock-out-search').on('keyup', function() {
    $('#stock-out-table').DataTable().search(this.value).draw();
  });

  $('#sales-order-search').on('keyup', function() {
    $('#sales-order-table').DataTable().search(this.value).draw();
  });

  $('#purchase-search').on('keyup', function() {
    $('#purchase-table').DataTable().search(this.value).draw();
  });

  $('#forecast-search').on('keyup', function() {
    $('#forecast-table').DataTable().search(this.value).draw();
  });
});

// Show main container
function showMainContainer() {
  $('#login-container').hide();
  $('#main-container').show();
  $('#current-company').text(currentCompany);
  
  // Hide admin features if user is not admin
  if (userRole !== 'admin') {
    $('#users-link').parent().hide();
  }
}

// Show section
function showSection(section) {
  $('.content-section').hide();
  $('#' + section + '-content').show();
  $('.nav-link').removeClass('active');
  $('#' + section + '-link').addClass('active');
}

// Switch company
function switchCompany(company) {
  currentCompany = company;
  localStorage.setItem('currentCompany', currentCompany);
  $('#current-company').text(currentCompany);
  loadDashboard();
}

// Load dashboard data
function loadDashboard() {
  callGoogleScript('getDashboardData', [currentCompany], function(data) {
    if (data.error) {
      console.error('Error loading dashboard data:', data.error);
      $('#inventory-value').text('0.00');
      $('#stock-out-value').text('0');
      $('#sales-orders-value').text('0');
      $('#purchase-orders-value').text('0');
      
      // Show error message
      $('#recent-activities').html('<div class="alert alert-danger">Error loading dashboard data: ' + data.error + '</div>');
      return;
    }
    
    $('#inventory-value').text(data.inventoryValue.toFixed(2));
    $('#stock-out-value').text(data.totalStockOut);
    $('#sales-orders-value').text(data.pendingSalesOrders);
    $('#purchase-orders-value').text(data.pendingPurchaseOrders);
    
    // Load charts
    loadStockChart();
    loadInventoryChart();
    
    // Load recent activities
    callGoogleScript('getRecentActivities', [currentCompany], function(activities) {
      if (activities.length === 0) {
        $('#recent-activities').html('<div class="alert alert-info">No recent activities found.</div>');
        return;
      }
      
      const activitiesHtml = activities.map(activity => `
        <div class="activity-item">
          <small class="text-muted">${new Date(activity.timestamp).toLocaleString()}</small>
          <p>${activity.description}</p>
        </div>
      `).join('');
      
      $('#recent-activities').html(activitiesHtml);
    });
  });
}


// Load stock chart
function loadStockChart() {
  const ctx = document.getElementById('stock-chart').getContext('2d');
  
  // Destroy existing chart instance if it exists
  if (window.stockChartInstance) {
    window.stockChartInstance.destroy();
  }
  
  // Create new chart instance
  window.stockChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Stock In',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }, {
        label: 'Stock Out',
        data: [28, 48, 40, 19, 86, 27],
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Load inventory chart
function loadInventoryChart() {
  const ctx = document.getElementById('inventory-chart').getContext('2d');
  
  // Destroy existing chart instance if it exists
  if (window.inventoryChartInstance) {
    window.inventoryChartInstance.destroy();
  }
  
  // Create new chart instance
  window.inventoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['In Stock', 'Low Stock', 'Out of Stock'],
      datasets: [{
        data: [300, 50, 10],
        backgroundColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)',
          'rgb(255, 99, 132)'
        ]
      }]
    },
    options: {}
  });
}


// Load inventory data
function loadInventoryData() {
  callGoogleScript('getInventoryData', [currentCompany], function(data) {
    const inventoryTable = $('#inventory-table tbody');
    inventoryTable.empty();
    data.forEach(function(row) {
      inventoryTable.append(`
        <tr>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
          <td>${row[4]}</td>
          <td>${row[5]}</td>
          <td>${new Date(row[6]).toLocaleString()}</td>
        </tr>
      `);
    });
    
    // Initialize DataTable
    if ($.fn.DataTable.isDataTable('#inventory-table')) {
      $('#inventory-table').DataTable().destroy();
    }
    $('#inventory-table').DataTable();
  });
}

// Load stock out data
function loadStockOutData() {
  callGoogleScript('getStockOutData', [currentCompany], function(data) {
    const stockOutTable = $('#stock-out-table tbody');
    stockOutTable.empty();
    data.forEach(function(row) {
      stockOutTable.append(`
        <tr>
          <td>${new Date(row[1]).toLocaleDateString()}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
          <td>${row[4]}</td>
          <td>${row[5]}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="updateStatus('${row[2]}', 'stock-out')">Update Status</button>
          </td>
        </tr>
      `);
    });
    
    // Initialize DataTable
    if ($.fn.DataTable.isDataTable('#stock-out-table')) {
      $('#stock-out-table').DataTable().destroy();
    }
    $('#stock-out-table').DataTable();
  });
}

// Load sales order data
function loadSalesOrderData() {
  callGoogleScript('getSalesOrderData', [currentCompany], function(data) {
    const salesOrderTable = $('#sales-order-table tbody');
    salesOrderTable.empty();
    data.forEach(function(row) {
      salesOrderTable.append(`
        <tr>
          <td>${new Date(row[1]).toLocaleDateString()}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
          <td>${row[4]}</td>
          <td>${row[5]}</td>
          <td>${row[6]}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="updateStatus('${row[2]}', 'sales-order')">Update Status</button>
          </td>
        </tr>
      `);
    });
    
    // Initialize DataTable
    if ($.fn.DataTable.isDataTable('#sales-order-table')) {
      $('#sales-order-table').DataTable().destroy();
    }
    $('#sales-order-table').DataTable();
  });
}

// Load purchase data
function loadPurchaseData() {
  callGoogleScript('getPurchaseData', [currentCompany], function(data) {
    const purchaseTable = $('#purchase-table tbody');
    purchaseTable.empty();
    data.forEach(function(row) {
      purchaseTable.append(`
        <tr>
          <td>${new Date(row[1]).toLocaleDateString()}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
          <td>${row[4]}</td>
          <td>${row[5]}</td>
          <td>${row[6]}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="updateStatus('${row[2]}', 'purchase')">Update Status</button>
          </td>
        </tr>
      `);
    });
    
    // Initialize DataTable
    if ($.fn.DataTable.isDataTable('#purchase-table')) {
      $('#purchase-table').DataTable().destroy();
    }
    $('#purchase-table').DataTable();
  });
}

// Load forecast data
function loadForecastData() {
  callGoogleScript('getForecastData', [currentCompany], function(data) {
    const forecastTable = $('#forecast-table tbody');
    forecastTable.empty();
    data.forEach(function(item) {
      forecastTable.append(`
        <tr>
          <td>${item.itemId}</td>
          <td>${item.itemName}</td>
          <td>${item.currentStock}</td>
          <td>${item.avgStockOutPerMonth.toFixed(2)}</td>
          <td>${item.daysUntilStockOut === Infinity ? 'N/A' : item.daysUntilStockOut}</td>
          <td>
            ${item.daysUntilStockOut <= 7 ? '<span class="badge badge-danger">Critical</span>' : 
              item.daysUntilStockOut <= 30 ? '<span class="badge badge-warning">Warning</span>' : 
              '<span class="badge badge-success">Normal</span>'}
          </td>
        </tr>
      `);
    });
    
    // Initialize DataTable
    if ($.fn.DataTable.isDataTable('#forecast-table')) {
      $('#forecast-table').DataTable().destroy();
    }
    $('#forecast-table').DataTable();
  });
}

// Load settings data
function loadSettingsData() {
  callGoogleScript('getSettingsData', [], function(data) {
    data.forEach(function(setting) {
      if (setting[0] === 'orderNotification') {
        $('#order-notification').prop('checked', setting[1]);
      } else if (setting[0] === 'stockNotification') {
        $('#stock-notification').prop('checked', setting[1]);
      } else if (setting[0] === 'lowStockNotification') {
        $('#low-stock-notification').prop('checked', setting[1]);
      } else if (setting[0] === 'lowStockThreshold') {
        $('#low-stock-threshold').val(setting[1]);
      } else if (setting[0] === 'currency') {
        $('#currency').val(setting[1]);
      }
    });
  });
}

// Load user data
function loadUserData() {
  callGoogleScript('getUserData', [], function(data) {
    const usersTable = $('#users-table tbody');
    usersTable.empty();
    data.forEach(function(row) {
      usersTable.append(`
        <tr>
          <td>${row[0]}</td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>
            <button class="btn btn-sm btn-danger" onclick="deleteUser('${row[0]}')">Delete</button>
          </td>
        </tr>
      `);
    });
    
    // Initialize DataTable
    if ($.fn.DataTable.isDataTable('#users-table')) {
      $('#users-table').DataTable().destroy();
    }
    $('#users-table').DataTable();
  });
}

// Add inventory item
function addInventoryItem() {
  const modal = $('#add-item-modal');
  
  // Reset the form
  $('#add-item-form')[0].reset();
  
  // Show the modal
  modal.modal({
    backdrop: 'static',
    keyboard: false
  });
  
  // Set focus to the first input when modal opens
  modal.on('shown.bs.modal', function () {
    $('#item-id').focus();
  });
  
  // Hide the modal when it's closed
  modal.on('hidden.bs.modal', function () {
    modal.removeAttr('tabindex').removeAttr('role').removeAttr('aria-labelledby').removeAttr('aria-hidden');
  });
}

// Add stock out entry
function addStockOutEntry() {
  const modal = $('#add-stock-out-modal');
  
  // Reset the form
  $('#add-stock-out-form')[0].reset();
  
  // Show the modal
  modal.modal({
    backdrop: 'static',
    keyboard: false
  });
  
  // Set focus to the first input when modal opens
  modal.on('shown.bs.modal', function () {
    $('#stock-out-order-id').focus();
  });
  
  // Hide the modal when it's closed
  modal.on('hidden.bs.modal', function () {
    modal.removeAttr('tabindex').removeAttr('role').removeAttr('aria-labelledby').removeAttr('aria-hidden');
  });
}

// Add sales order
function addSalesOrder() {
  const modal = $('#add-sales-order-modal');
  
  // Reset the form
  $('#add-sales-order-form')[0].reset();
  
  // Show the modal
  modal.modal({
    backdrop: 'static',
    keyboard: false
  });
  
  // Set focus to the first input when modal opens
  modal.on('shown.bs.modal', function () {
    $('#sales-order-order-id').focus();
  });
  
  // Hide the modal when it's closed
  modal.on('hidden.bs.modal', function () {
    modal.removeAttr('tabindex').removeAttr('role').removeAttr('aria-labelledby').removeAttr('aria-hidden');
  });
}

// Add purchase entry
function addPurchaseEntry() {
  const modal = $('#add-purchase-modal');
  
  // Reset the form
  $('#add-purchase-form')[0].reset();
  
  // Show the modal
  modal.modal({
    backdrop: 'static',
    keyboard: false
  });
  
  // Set focus to the first input when modal opens
  modal.on('shown.bs.modal', function () {
    $('#purchase-order-id').focus();
  });
  
  // Hide the modal when it's closed
  modal.on('hidden.bs.modal', function () {
    modal.removeAttr('tabindex').removeAttr('role').removeAttr('aria-labelledby').removeAttr('aria-hidden');
  });
}

// Add user
function addUser() {
  const modal = $('#add-user-modal');
  
  // Reset the form
  $('#add-user-form')[0].reset();
  
  // Show the modal
  modal.modal({
    backdrop: 'static',
    keyboard: false
  });
  
  // Set focus to the first input when modal opens
  modal.on('shown.bs.modal', function () {
    $('#add-user-username').focus();
  });
  
  // Hide the modal when it's closed
  modal.on('hidden.bs.modal', function () {
    modal.removeAttr('tabindex').removeAttr('role').removeAttr('aria-labelledby').removeAttr('aria-hidden');
  });
}


// Update status
function updateStatus(orderId, orderType) {
  const modal = $('#update-status-modal');
  
  // Set the order ID and type
  $('#update-order-id').val(orderId);
  $('#update-order-type').val(orderType);
  
  // Show the modal
  modal.modal({
    backdrop: 'static',
    keyboard: false
  });
  
  // Set focus to the status dropdown when modal opens
  modal.on('shown.bs.modal', function () {
    $('#new-status').focus();
  });
  
  // Hide the modal when it's closed
  modal.on('hidden.bs.modal', function () {
    modal.removeAttr('tabindex').removeAttr('role').removeAttr('aria-labelledby').removeAttr('aria-hidden');
  });
}

// Delete user
function deleteUser(username) {
  if (confirm('Are you sure you want to delete this user?')) {
    callGoogleScript('deleteUser', [username], function(result) {
      alert(result);
      loadUserData();
    });
  }
}

// Test connection to Google Apps Script
function testConnection() {
  $('#login-message').html('<div class="alert alert-info">Testing connection...</div>');
  
  callGoogleScript('testFunction', [], function(result) {
    if (result.message) {
      $('#login-message').html('<div class="alert alert-success">Connection successful: ' + result.message + '</div>');
    } else {
      $('#login-message').html('<div class="alert alert-danger">Connection test failed</div>');
    }
  });
}

// Function to call Google Script using JSONP
function callGoogleScript(functionName, params, callback) {
  console.log('Calling Google Script:', functionName, params);
  
  // Create a unique callback function name
  const callbackName = 'callback_' + Math.floor(Math.random() * 1000000);
  
  // Create a script element
  const script = document.createElement('script');
  
  // Set up the callback function
  window[callbackName] = function(response) {
    console.log('Response from Google Script:', response);
    
    if (response.error) {
      console.error('Error from Google Script:', response.error);
      if (functionName === 'authenticateUser') {
        $('#login-message').html('<div class="alert alert-danger">Error: ' + response.error + '</div>');
      } else {
        alert('Error: ' + response.error);
      }
    } else {
      callback(response);
    }
    
    // Clean up
    delete window[callbackName];
    document.body.removeChild(script);
  };
  
  // Build the URL with properly encoded parameters
  const url = WEB_APP_URL + '?function=' + encodeURIComponent(functionName) + 
               '&params=' + encodeURIComponent(JSON.stringify(params)) + 
               '&callback=' + encodeURIComponent(callbackName);
  
  console.log('Request URL:', url);
  
  // Set the script source
  script.src = url;
  
  // Add the script to the document
  document.body.appendChild(script);
  
  // Set a timeout in case we don't get a response
  setTimeout(function() {
    if (window[callbackName]) {
      delete window[callbackName];
      document.body.removeChild(script);
      console.warn('No response received from Google Script');
      if (functionName === 'authenticateUser') {
        $('#login-message').html('<div class="alert alert-warning">No response from server. Please try again.</div>');
      } else {
        alert('No response from server. Please try again.');
      }
    }
  }, 15000); // 15 seconds timeout
}

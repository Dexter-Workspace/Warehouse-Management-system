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
  
  // Build the URL
  const url = WEB_APP_URL + '?function=' + encodeURIComponent(functionName) + 
               '&params=' + encodeURIComponent(JSON.stringify(params)) + 
               '&callback=' + encodeURIComponent(callbackName);
  
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

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

// Function to call Google Script
function callGoogleScript(functionName, params, callback) {
  console.log('Calling Google Script:', functionName, params);
  
  // Create a form element
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = WEB_APP_URL;
  form.target = 'hidden-iframe';
  
  // Create a hidden input for the function name
  const functionInput = document.createElement('input');
  functionInput.type = 'hidden';
  functionInput.name = 'function';
  functionInput.value = functionName;
  form.appendChild(functionInput);
  
  // Create a hidden input for the parameters
  const paramsInput = document.createElement('input');
  paramsInput.type = 'hidden';
  paramsInput.name = 'params';
  paramsInput.value = JSON.stringify(params);
  form.appendChild(paramsInput);
  
  // Create a hidden iframe to handle the response
  let iframe = document.getElementById('hidden-iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'hidden-iframe';
    iframe.style.display = 'none';
    iframe.name = 'hidden-iframe';
    document.body.appendChild(iframe);
  }
  
  // Handle the response using postMessage
  const messageHandler = function(event) {
    // Check if the message is from the iframe
    if (event.origin === 'https://script.google.com' && event.source === iframe.contentWindow) {
      try {
        const response = JSON.parse(event.data);
        console.log('Response from Google Script:', response);
        
        if (response.error) {
          console.error('Error from Google Script:', response.error);
          alert('Error: ' + response.error);
        } else {
          callback(response);
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        alert('An error occurred. Please try again.');
      }
      
      // Remove the event listener
      window.removeEventListener('message', messageHandler);
    }
  };
  
  // Add the event listener
  window.addEventListener('message', messageHandler, false);
  
  // Submit the form
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
  
  // Set a timeout in case we don't get a response
  setTimeout(function() {
    window.removeEventListener('message', messageHandler);
    console.warn('No response received from Google Script');
    $('#login-message').html('<div class="alert alert-warning">No response from server. Please try again.</div>');
  }, 15000); // 15 seconds timeout
}

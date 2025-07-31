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

// Function to call Google Script using fetch
function callGoogleScript(functionName, params, callback) {
  console.log('Calling Google Script:', functionName, params);
  
  // Create a form data object
  const formData = new FormData();
  formData.append('function', functionName);
  formData.append('params', JSON.stringify(params));
  
  // Show loading message if it's a login request
  if (functionName === 'authenticateUser') {
    $('#login-message').html('<div class="alert alert-info">Processing request...</div>');
  }
  
  // Send the request
  fetch(WEB_APP_URL, {
    method: 'POST',
    body: formData,
    mode: 'cors'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(data => {
    console.log('Response from Google Script:', data);
    
    try {
      const parsedData = JSON.parse(data);
      
      if (parsedData.error) {
        console.error('Error from Google Script:', parsedData.error);
        if (functionName === 'authenticateUser') {
          $('#login-message').html('<div class="alert alert-danger">Error: ' + parsedData.error + '</div>');
        } else {
          alert('Error: ' + parsedData.error);
        }
      } else {
        callback(parsedData);
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      if (functionName === 'authenticateUser') {
        $('#login-message').html('<div class="alert alert-danger">An error occurred. Please try again.</div>');
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
    if (functionName === 'authenticateUser') {
      $('#login-message').html('<div class="alert alert-danger">Network error. Please check your connection and try again.</div>');
    } else {
      alert('Network error. Please check your connection and try again.');
    }
  });
}

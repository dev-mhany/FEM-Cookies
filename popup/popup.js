console.log("Popup script loaded!");

document.addEventListener("DOMContentLoaded", () => {
  const showCookiesButton = document.getElementById("show-cookies");
  const cookieListDiv = document.getElementById("cookie-list");
  const fetchCredentialsButton = document.getElementById("fetch-credentials");
  const credentialsStatusDiv = document.getElementById("credentials-status");
  const passwordSection = document.getElementById("password-section");
  const passwordInput = document.getElementById("password-input");
  const submitPasswordButton = document.getElementById("submit-password");
  const passwordErrorDiv = document.getElementById("password-error");

  function showButtons() {
    passwordSection.style.display = "none";
    showCookiesButton.style.display = "block";
    fetchCredentialsButton.style.display = "block";
  }

  function checkPassword() {
    const hardcodedPassword = "HelloWorld";
    if (passwordInput.value === hardcodedPassword) {
      chrome.storage.local.set({ authenticated: true }, () => {
        showButtons();
      });
    } else {
      passwordErrorDiv.textContent = "Incorrect password.";
    }
  }

  // Check if the user is already authenticated
  chrome.storage.local.get(["authenticated"], function (result) {
    if (result.authenticated) {
      showButtons();
    }
  });

  submitPasswordButton.addEventListener("click", () => {
    checkPassword();
  });

  // Event Listener for Showing Cookies
  showCookiesButton.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { action: "applyCookiesFromCloudFlare" },
      (response) => {
        cookieListDiv.textContent =
          response && response.success
            ? "Cookies applied successfully!"
            : `Failed to apply cookies. Error: ${
                response.error || "Unknown error"
              }`;
      }
    );
  });

  // Event Listener for Fetching Credentials
  fetchCredentialsButton.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { action: "fetchCredentialsFromCloudflare" },
      (response) => {
        if (response && response.success) {
          credentialsStatusDiv.textContent =
            "Credentials fetched successfully!";
          setCredentialsInActiveTab(response.credentials);
        } else {
          credentialsStatusDiv.textContent = `Failed to fetch credentials. Error: ${
            response.error || "Unknown error"
          }`;
        }
      }
    );
  });
});

// Function to set credentials in the active tab
function setCredentialsInActiveTab(credentials) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: setCredentialsInPage,
        args: [credentials.username, credentials.password],
      },
      (results) => {
        if (chrome.runtime.lastError || results[0].result === false) {
          console.error("Error injecting script", chrome.runtime.lastError);
        }
      }
    );
  });
}

// Function to be injected into the page to set credentials
function setCredentialsInPage(username, password) {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  if (usernameInput && passwordInput) {
    usernameInput.value = username;
    passwordInput.value = password;
    return true;
  } else {
    console.error("Username or Password input fields not found in the page.");
    return false;
  }
}

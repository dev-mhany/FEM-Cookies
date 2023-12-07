console.log("Content script running");

// This function checks if a "Logout" link exists on the page
function isLoggedIn() {
  // Use querySelector to find the logout link. The 'a' element must contain the text 'Logout'
  const logoutLink = Array.from(document.querySelectorAll("a")).find((el) =>
    el.textContent.includes("Logout")
  );
  return !!logoutLink; // Cast the found element to a boolean to return true if found, false if not
}

// This function requests the cookie if the user is logged in
function requestCookie(name, callback) {
  if (isLoggedIn()) {
    console.log(`User is logged in. Requesting cookie with name: ${name}`);
    chrome.runtime.sendMessage(
      { action: "getCookie", name: name },
      (response) => {
        console.log(`Received response for cookie request: ${name}`, response);
        callback(response);
      }
    );
  } else {
    console.log("User is not logged in, not requesting cookie.");
  }
}

// Only attempt to get the cookie if the user is logged in
requestCookie("fem_auth_mod", (response) => {
  if (response && response.cookie) {
    console.log("Cookie value:", response.cookie.value);
    // You might want to send this cookie value to your background script from here
  } else {
    console.log("Cookie not found or response is empty");
  }
});

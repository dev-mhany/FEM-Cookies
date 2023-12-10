console.log("Popup script loaded!");

document.addEventListener("DOMContentLoaded", () => {
  const showCookiesButton = document.getElementById("show-cookies");
  const cookieListDiv = document.getElementById("cookie-list");

  showCookiesButton.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { action: "applyCookiesFromCloudFlare" },
      (response) => {
        if (response.success) {
          cookieListDiv.textContent = "Cookies applied successfully!";
        } else {
          cookieListDiv.textContent =
            "Failed to apply cookies. Error: " +
            (response.error || "Unknown error");
        }
      }
    );
  });
});
console.log("Popup script loaded!");

// document.addEventListener("DOMContentLoaded", () => {
//   const fetchCredentialsButton = document.getElementById("fetch-credentials");
//   const credentialsStatusDiv = document.getElementById("credentials-status");

//   fetchCredentialsButton.addEventListener("click", () => {
//     chrome.runtime.sendMessage(
//       { action: "fetchCredentialsFromCloudflare" },
//       (response) => {
//         if (response.success) {
//           credentialsStatusDiv.textContent =
//             "Credentials fetched successfully!";
//           // Populate the credentials in the input fields
//           document.getElementById("username").value =
//             response.credentials.username;
//           document.getElementById("password").value =
//             response.credentials.password;
//         } else {
//           credentialsStatusDiv.textContent =
//             "Failed to fetch credentials. Error: " +
//             (response.error || "Unknown error");
//         }
//       }
//     );
//   });
// });

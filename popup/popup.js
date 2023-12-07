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

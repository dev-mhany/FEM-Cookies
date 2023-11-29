// // Save the Firebase config to local storage
// console.log("Options script loaded");
// function saveOptions() {
//   var firebaseConfig = document.getElementById("firebase-config").value;
//   chrome.storage.local.set({ firebaseConfig: firebaseConfig }, function () {
//     console.log("Firebase config saved");
//   });
// }

// // Load the Firebase config from local storage
// function restoreOptions() {
//   chrome.storage.local.get("firebaseConfig", function (data) {
//     document.getElementById("firebase-config").value =
//       data.firebaseConfig || "";
//   });
// }

// document.addEventListener("DOMContentLoaded", restoreOptions);
// document
//   .getElementById("options-form")
//   .addEventListener("submit", function (event) {
//     event.preventDefault();
//     saveOptions();
//   });

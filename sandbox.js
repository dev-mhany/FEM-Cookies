// sandbox.js
console.log("sandbox is running");
// TODOO: replace these with your actual firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyDqpoZOG_0NsEyR6kptHCO176RwNkIV6Co",
  authDomain: "fem-cookies.firebaseapp.com",
  projectId: "fem-cookies",
  storageBucket: "fem-cookies.appspot.com",
  messagingSenderId: "644451757006",
  appId: "1:644451757006:web:04f1dcfd387a4af995199f",
  measurementId: "G-VMVTXBH608",
};

window.addEventListener("message", (event) => {
  if (event.data === "init") {
    const app = firebase.initializeApp(config);
    console.log("Initialized Firebase!", app);
  }
});
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to Firestore
const db = firebase.firestore();

// Function to send messages back to the content script or background script
function sendMessageToExtension(data) {
  window.postMessage(data, "*");
}

// Listen for messages from the content script or background script
window.addEventListener("message", (event) => {
  // Make sure to validate the origin of the message for security purposes
  if (event.origin !== "https://your-extension-origin") {
    return;
  }

  // Perform Firebase operations based on the message received
  if (event.data && event.data.action === "saveCookieToFirestore") {
    // Extract the cookie data from the event
    const cookieData = event.data.cookieData;

    // Save the cookie to Firestore
    const userId = "some-user-id"; // TODO: Replace with actual logic to get the user ID
    const cookiesRef = db.collection("cookies").doc(userId);

    // ... Your logic to save cookieData to Firestore ...

    // After saving to Firestore, send a message back
    sendMessageToExtension({ status: "Cookie saved to Firestore" });
  }
  // Add more actions as needed
});

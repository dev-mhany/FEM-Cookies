console.log("Background script loaded");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqpoZOG_0NsEyR6kptHCO176RwNkIV6Co",
  authDomain: "fem-cookies.firebaseapp.com",
  projectId: "fem-cookies",
  storageBucket: "fem-cookies.appspot.com",
  messagingSenderId: "644451757006",
  appId: "1:644451757006:web:04f1dcfd387a4af995199f",
  measurementId: "G-VMVTXBH608",
};

// Background Script for Chrome Extension

// Initialize Firebase (Uncomment if Firebase is needed)
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

// Utility Functionsfunction getUserId(callback) {
// chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (userInfo) => {
//   if (chrome.runtime.lastError) {
//     console.error(
//       "Error retrieving user info:",
//       chrome.runtime.lastError.message
//     );
//     callback(null);
//   } else {
//     callback(userInfo.id);
//   }
// });

function fetchCookieFromFirestore(userId, callback) {
  const cookiesRef = db.collection("cookies").doc("latest");
  cookiesRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        callback({ cookies: doc.data().cookies || [] });
      } else {
        callback({ error: "No cookies found" });
      }
    })
    .catch((error) => {
      console.error("Error fetching cookies:", error);
      callback({ error: error.message });
    });
}

function applyFirestoreCookie(userId) {
  const cookiesRef = db.collection("cookies").doc(latest);
  cookiesRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const cookieData = doc.data();
        chrome.cookies.set(
          {
            url: "https://www.frontendmasters.com/",
            name: cookieData.name,
            value: cookieData.value,
            // Other cookie properties...
          },
          (cookie) => {
            if (chrome.runtime.lastError) {
              console.error("Error setting cookie:", chrome.runtime.lastError);
            } else {
              console.log("Cookie set successfully:", cookie);
            }
          }
        );
      } else {
        console.log("No cookie found in Firestore for the user:", userId);
      }
    })
    .catch((error) => {
      console.error("Error applying cookie:", error);
    });
}

function saveCookieToFirestore(cookie, userId) {
  const cookiesRef = db.collection("cookies");
  const expirationTimestamp = firebase.firestore.Timestamp.fromDate(
    new Date(cookie.expirationDate)
  );
  cookiesRef
    .doc(latest)
    .set({
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      expirationDate: expirationTimestamp,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      // ... any other properties you want to save
    })
    .then(() => {
      console.log("Cookie saved to Firestore");
    })
    .catch((error) => {
      console.error("Error writing cookie to Firestore:", error);
    });
}

// Event Listeners
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (
    !changeInfo.removed &&
    changeInfo.cookie.domain.includes("frontendmasters.com")
  ) {
    if (changeInfo.cookie.name === "fem_auth_mod") {
      getUserId((userId) => {
        if (userId) {
          saveCookieToFirestore(changeInfo.cookie, userId);
        }
      });
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "fetchCookieFromFirestore":
      getUserId((userId) => {
        if (userId) {
          fetchCookieFromFirestore(userId, sendResponse);
        } else {
          sendResponse({ error: "User ID not found." });
        }
      });
      return true; // Indicate asynchronous response

    case "applyFirestoreCookie":
      getUserId((userId) => {
        if (userId) {
          applyFirestoreCookie(userId, sendResponse);
        } else {
          sendResponse({ error: "User ID not found." });
        }
      });
      return true; // Indicate asynchronous response

    case "getCookiesFromFirestore":
      db.collection("cookies")
        .doc("latest")
        .get()
        .then((doc) => {
          if (!doc.exists) {
            sendResponse({ error: "No cookies document found in Firestore." });
            return;
          }
          // Retrieve all fields as cookies
          const cookiesData = doc.data();
          const cookies = Object.keys(cookiesData).map((key) => ({
            name: key,
            value: cookiesData[key],
          }));
          sendResponse({ cookies: cookies });
        })
        .catch((error) => {
          console.error("Error getting cookies from Firestore:", error);
          sendResponse({ error: error.message });
        });
      return true; // Indicate asynchronous response

    case "saveCookieToFirestore":
      getUserId((userId) => {
        if (userId) {
          saveCookieToFirestore(message.cookie, userId);
          sendResponse({ status: "success" });
        } else {
          sendResponse({ status: "error", error: "User ID not found." });
        }
      });
      return true; // Indicate asynchronous response

    case "getCookie":
      chrome.cookies.get(
        {
          url: "https://www.frontendmasters.com/",
          name: message.name,
        },
        (cookie) => {
          if (cookie) {
            sendResponse({ cookie: cookie });
          } else {
            sendResponse({ error: "Cookie not found" });
          }
        }
      );
      return true; // Indicate asynchronous response

    default:
      sendResponse({ error: "Unknown action" });
      return false; // No asynchronous response expected
  }
});

// chrome.runtime.onInstalled.addListener(() => {
//   getUserId((userId) => {
//     if (userId) applyFirestoreCookie(userId);
//   });
// });

console.log("Background script loaded");

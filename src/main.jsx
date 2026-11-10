import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import "leaflet/dist/leaflet.css";

// Get Clerk Publishable Key from environment (with fallback to avoid white-screen crashes)
const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_test_Y2xlcmsuYmhhcmF0dmVyc2UuZGV2JA";

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  console.warn(
    "⚠️ Missing VITE_CLERK_PUBLISHABLE_KEY in environment. Using fallback Clerk key. Add your key in .env or Vercel settings for production Clerk auth."
  );
}

// Clean up any legacy service workers that cause stale bundle cache issues
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
  if ("caches" in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        if (name.startsWith("bharatverse")) {
          caches.delete(name);
        }
      }
    });
  }
}

// Render React App with Clerk Provider
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";  // Updated import for React 18
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

// Create a root using React 18's createRoot API
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

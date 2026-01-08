import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const mount = document.getElementById("vault-root");
if (!mount) throw new Error("Missing #vault-root. Ensure page-vault.hbs includes <div id='vault-root'></div>.");

// In Ghost, app is mounted at /vault. Standalone (Cloudflare Pages), it's at root.
const basename = window.location.hostname.includes("bookshook.com") ? "/vault" : "/";

ReactDOM.createRoot(mount).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

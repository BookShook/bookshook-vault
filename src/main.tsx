import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const mount = document.getElementById("vault-root");
if (!mount) throw new Error("Missing #vault-root. Ensure page-vault.hbs includes <div id='vault-root'></div>.");

// All routes live under /vault/* for canonical architecture compliance.
// This ensures consistent routing whether served from Ghost theme or Pages.
const basename = "/vault";

ReactDOM.createRoot(mount).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

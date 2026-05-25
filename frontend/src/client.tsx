import "./shim";
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";
const rootElement = document.getElementById("root");

if (rootElement) {
  if (rootElement.children.length > 0) {
    hydrateRoot(rootElement, <StartClient />);
  } else {
    createRoot(rootElement).render(<StartClient />);
  }
}

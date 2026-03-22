import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Cuando un usuario viene de la función OG (/u/slug → /?_u=slug),
// reescribimos la URL a /u/slug antes de que React Router monte.
const params = new URLSearchParams(window.location.search);
const profileSlug = params.get("_u");
if (profileSlug) {
  const cleanUrl = `/u/${profileSlug}`;
  window.history.replaceState(null, "", cleanUrl);
}

createRoot(document.getElementById("root")!).render(<App />);

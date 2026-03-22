import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Cuando un usuario viene de la función OG (/u/slug → /?_u=slug),
// hacemos un replace real a /u/slug ANTES de que React monte,
// así React Router arranca directamente en la ruta correcta.
const params = new URLSearchParams(window.location.search);
const profileSlug = params.get("_u");
if (profileSlug) {
  window.location.replace(`/u/${profileSlug}`);
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}

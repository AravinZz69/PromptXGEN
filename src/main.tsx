import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/animations.css";
import 'katex/dist/katex.min.css';

// Handle SPA redirect from 404.html fallback (Hostinger compatibility)
const spaRedirect = sessionStorage.getItem('spa_redirect');
if (spaRedirect) {
  sessionStorage.removeItem('spa_redirect');
  window.history.replaceState(null, '', spaRedirect);
}

createRoot(document.getElementById("root")!).render(<App />);

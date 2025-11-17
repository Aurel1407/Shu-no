import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 * Place this component inside a Router. It will scroll the window to top
 * whenever the location.pathname changes.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use native scroll to top for full page jump. Smooth optional.
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    } catch (e) {
      // Fallback for older browsers/environments
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

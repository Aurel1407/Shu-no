import { useCallback } from "react";

// Preload function for routes
const preloadRoute = (importFn: () => Promise<unknown>) => {
  // Use requestIdleCallback if available, otherwise setTimeout
  const preload = () => importFn();

  if ("requestIdleCallback" in window) {
    requestIdleCallback(preload);
  } else {
    setTimeout(preload, 100);
  }
};

// Hook for intelligent route preloading
export const useRoutePreloader = () => {
  const preloadAdminRoutes = useCallback(() => {
    // Preload admin pages when user logs in as admin
    preloadRoute(() => import("../pages/AdminDashboard"));
    preloadRoute(() => import("../pages/ManageProperties"));
    preloadRoute(() => import("../pages/ManageBookings"));
    preloadRoute(() => import("../pages/ManageUsers"));
  }, []);

  const preloadUserRoutes = useCallback(() => {
    // Preload user account pages when user logs in
    preloadRoute(() => import("../pages/UserAccount"));
  }, []);

  const preloadPropertyRoutes = useCallback(() => {
    // Preload property-related pages when user interacts with properties
    preloadRoute(() => import("../pages/PropertyDetail"));
    preloadRoute(() => import("../pages/Booking"));
  }, []);

  return {
    preloadAdminRoutes,
    preloadUserRoutes,
    preloadPropertyRoutes,
  };
};

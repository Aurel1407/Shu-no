import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactQueryProvider } from "@/lib/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";
import CookieConsent from "@/components/CookieConsent";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const Booking = lazy(() => import("./pages/Booking"));
const Contact = lazy(() => import("./pages/Contact"));
const ReservationSummary = lazy(() => import("./pages/ReservationSummary"));
const Payment = lazy(() => import("./pages/Payment"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Legal pages
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const Cgu = lazy(() => import("./pages/CGU"));
const Confidentialite = lazy(() => import("./pages/Confidentialite"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ManageProperties = lazy(() => import("./pages/ManageProperties"));
const ManageBookings = lazy(() => import("./pages/ManageBookings"));
const ManageUsers = lazy(() => import("./pages/ManageUsers"));
const ManagePricePeriods = lazy(() => import("./pages/ManagePricePeriods"));
const ManageContacts = lazy(() => import("./pages/ManageContacts"));
const PropertyForm = lazy(() => import("./pages/PropertyForm"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const RevenueStats = lazy(() => import("./pages/RevenueStats"));
const OccupancyCharts = lazy(() => import("./pages/OccupancyCharts"));

// User pages
const UserAccount = lazy(() => import("./pages/UserAccount"));
const UserLogin = lazy(() => import("./pages/UserLogin"));
const UserRegister = lazy(() => import("./pages/UserRegister"));

// Loading component with better UX
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background">
    <div className="relative">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 bg-gradient-to-br from-bleu-clair to-bleu-profond rounded-full flex items-center justify-center">
          <span className="text-white font-playfair font-bold text-sm">SN</span>
        </div>
      </div>
    </div>
    <p className="mt-4 text-muted-foreground animate-pulse">Chargement...</p>
  </div>
);

const App = () => (
  <ReactQueryProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Région live pour annonces accessibles */}
        <output
          id="aria-live-region"
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <main role="main">
              <Routes>
                <Route path="/" element={<Index />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/reservation-summary" element={<ReservationSummary />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/contact" element={<Contact />} />
              {/* Routes Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/properties" element={<ManageProperties />} />
              <Route path="/admin/properties/new" element={<PropertyForm />} />
              <Route path="/admin/properties/:id/edit" element={<PropertyForm />} />
              <Route path="/admin/bookings" element={<ManageBookings />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/contacts" element={<ManageContacts />} />
              <Route path="/admin/price-periods" element={<ManagePricePeriods />} />
              <Route path="/admin/revenue" element={<RevenueStats />} />
              <Route path="/admin/occupancy" element={<OccupancyCharts />} />
              <Route path="/login" element={<UserLogin />} />
              <Route path="/register" element={<UserRegister />} />
              <Route path="/account" element={<UserAccount />} />
              {/* Legal routes */}
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/cgu" element={<Cgu />} />
              <Route path="/confidentialite" element={<Confidentialite />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
              </main>
            </Suspense>
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );

export default App;

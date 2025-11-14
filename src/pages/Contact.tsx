import { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";

const Contact = () => {
  const mainContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = "Shu-no - Contact";
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Liens de navigation rapide pour l'accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller au contenu principal
      </a>

      <Header />

      {/* Hero */}
      <section
        id="main-content"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bleu-clair/30 via-background to-bleu-profond/20"
        aria-labelledby="contact-title"
        tabIndex={-1}
        ref={mainContentRef}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1
              id="contact-title"
              className="text-5xl md:text-6xl font-playfair font-bold mb-6 text-foreground"
            >
              Contactez-nous
            </h1>
            <p className="text-xl md:text-2xl font-light mb-4 text-muted-foreground max-w-3xl mx-auto">
              N'hésitez pas à nous contacter pour toute question concernant nos gîtes ou votre
              réservation sur la Côte de Goëlo.
            </p>
          </div>
        </div>
      </section>

      {/* Contenu principal - démarcation visible */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <ContactInfo />

          <div className="mt-12">
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;

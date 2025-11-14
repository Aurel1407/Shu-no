import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Utilisation des cookies</h3>
            <p className="text-sm text-muted-foreground">
              Nous utilisons des cookies pour améliorer votre expérience de navigation, analyser le trafic du site et personnaliser le contenu.
              En cliquant sur "Accepter", vous consentez à l'utilisation de tous les cookies.
              {' '}
              <Link to="/confidentialite" className="underline hover:text-primary">
                Politique de confidentialité
              </Link>
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={declineCookies}
              className="flex-1 md:flex-none"
            >
              Refuser
            </Button>
            <Button
              onClick={acceptCookies}
              className="flex-1 md:flex-none"
            >
              Accepter
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;

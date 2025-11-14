import React from 'react';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CGU: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <h1 className="text-3xl font-bold mb-6">Conditions Générales d'Utilisation</h1>
      
      <Card className="p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Objet</h2>
          <p className="text-muted-foreground">
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du site Shu-no 
            et de ses services de réservation de gîtes et chambres d'hôtes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Accès au site</h2>
          <p className="text-muted-foreground">
            Le site Shu-no est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. 
            Tous les frais liés à l'accès au site (matériel informatique, connexion Internet, etc.) sont 
            à la charge de l'utilisateur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Réservations</h2>
          <p className="text-muted-foreground mb-2">
            <strong>3.1 Processus de réservation :</strong> Les utilisateurs peuvent effectuer des réservations 
            en ligne via le formulaire dédié. Une confirmation de réservation sera envoyée par email.
          </p>
          <p className="text-muted-foreground mb-2">
            <strong>3.2 Confirmation :</strong> La réservation n'est définitive qu'après confirmation écrite 
            du propriétaire et réception du paiement.
          </p>
          <p className="text-muted-foreground">
            <strong>3.3 Annulation :</strong> Les conditions d'annulation sont spécifiques à chaque propriété 
            et sont communiquées lors de la réservation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Prix et paiement</h2>
          <p className="text-muted-foreground">
            Les prix sont indiqués en euros TTC. Le paiement s'effectue selon les modalités définies lors de 
            la réservation. Les tarifs peuvent être modifiés à tout moment, mais seul le tarif en vigueur au 
            moment de la réservation s'applique.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Responsabilité</h2>
          <p className="text-muted-foreground">
            Shu-no met en relation les propriétaires de gîtes et chambres d'hôtes avec les utilisateurs. 
            La responsabilité de Shu-no ne saurait être engagée en cas de litige entre un utilisateur et 
            un propriétaire.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Propriété intellectuelle</h2>
          <p className="text-muted-foreground">
            Tous les contenus du site (textes, images, graphismes, logo, etc.) sont protégés par le droit 
            d'auteur. Toute reproduction non autorisée est interdite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Données personnelles</h2>
          <p className="text-muted-foreground">
            Les données collectées sont traitées conformément à notre politique de confidentialité et au RGPD.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Modification des CGU</h2>
          <p className="text-muted-foreground">
            Shu-no se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront 
            informés de toute modification substantielle.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Droit applicable et litiges</h2>
          <p className="text-muted-foreground">
            Les présentes CGU sont régies par le droit français. En cas de litige, une solution amiable sera 
            recherchée avant toute action judiciaire.
          </p>
        </section>
      </Card>
      </div>
      <Footer />
    </div>
  );
};

export default CGU;

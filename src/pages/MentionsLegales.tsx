import React from 'react';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const MentionsLegales: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <h1 className="text-3xl font-bold mb-6">Mentions Légales</h1>
      
      <Card className="p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Éditeur du site</h2>
          <p className="text-muted-foreground">
            <strong>Nom de l'entreprise :</strong> Shu-no<br />
            <strong>Forme juridique :</strong> [À compléter]<br />
            <strong>Adresse :</strong> [À compléter]<br />
            <strong>Email :</strong> contact@shu-no.fr<br />
            <strong>Téléphone :</strong> [À compléter]<br />
            <strong>SIRET :</strong> [À compléter]<br />
            <strong>Directeur de la publication :</strong> [À compléter]
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Hébergeur du site</h2>
          <p className="text-muted-foreground">
            <strong>Nom :</strong> [Nom de l'hébergeur]<br />
            <strong>Adresse :</strong> [Adresse de l'hébergeur]<br />
            <strong>Téléphone :</strong> [Téléphone de l'hébergeur]
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Propriété intellectuelle</h2>
          <p className="text-muted-foreground">
            L'ensemble du contenu de ce site (textes, images, vidéos, logos) est protégé par le droit d'auteur. 
            Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments 
            du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Données personnelles</h2>
          <p className="text-muted-foreground">
            Conformément au RGPD (Règlement Général sur la Protection des Données), vous disposez d'un droit d'accès, 
            de rectification et de suppression des données vous concernant. Pour exercer ces droits, vous pouvez nous 
            contacter à l'adresse : contact@shu-no.fr
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
          <p className="text-muted-foreground">
            Ce site utilise des cookies pour améliorer l'expérience utilisateur. Pour plus d'informations, 
            consultez notre politique de confidentialité.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Responsabilité</h2>
          <p className="text-muted-foreground">
            L'éditeur du site ne saurait être tenu responsable des erreurs, d'une absence de disponibilité des 
            informations et/ou de la présence de virus sur son site.
          </p>
        </section>
      </Card>
      </div>
      <Footer />
    </div>
  );
};

export default MentionsLegales;

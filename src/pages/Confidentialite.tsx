import React from 'react';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Confidentialite: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
      
      <Card className="p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p className="text-muted-foreground">
            Shu-no s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité 
            explique comment nous collectons, utilisons et protégeons vos données personnelles conformément 
            au Règlement Général sur la Protection des Données (RGPD).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Données collectées</h2>
          <p className="text-muted-foreground mb-2">
            Nous collectons les données suivantes :
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Informations d'identification (nom, prénom, email)</li>
            <li>Données de contact (téléphone, adresse)</li>
            <li>Informations de réservation (dates, nombre de personnes)</li>
            <li>Données de navigation (cookies, adresse IP)</li>
            <li>Messages envoyés via le formulaire de contact</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Finalité du traitement</h2>
          <p className="text-muted-foreground mb-2">
            Vos données sont utilisées pour :
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Gérer vos réservations</li>
            <li>Vous contacter concernant votre séjour</li>
            <li>Améliorer nos services</li>
            <li>Répondre à vos demandes</li>
            <li>Analyser le trafic du site (cookies analytiques)</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Base légale du traitement</h2>
          <p className="text-muted-foreground">
            Le traitement de vos données repose sur :
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Votre consentement (formulaires, cookies)</li>
            <li>L'exécution du contrat de réservation</li>
            <li>Le respect d'obligations légales</li>
            <li>Notre intérêt légitime (amélioration des services)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Conservation des données</h2>
          <p className="text-muted-foreground">
            Vos données sont conservées pendant :
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Données de réservation : 3 ans après la fin du séjour</li>
            <li>Données de contact : jusqu'à votre demande de suppression</li>
            <li>Cookies : 13 mois maximum</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Destinataires des données</h2>
          <p className="text-muted-foreground">
            Vos données peuvent être transmises :
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Aux propriétaires des logements réservés</li>
            <li>À nos prestataires techniques (hébergement, emailing)</li>
            <li>Aux autorités légales sur demande</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Vos droits</h2>
          <p className="text-muted-foreground mb-2">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
            <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
            <li><strong>Droit à l'effacement :</strong> supprimer vos données (sous conditions)</li>
            <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
            <li><strong>Droit de retirer votre consentement :</strong> à tout moment</li>
          </ul>
          <p className="text-muted-foreground mt-3">
            Pour exercer ces droits, contactez-nous à : <strong>contact@shu-no.fr</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
          <p className="text-muted-foreground">
            Nous utilisons des cookies pour améliorer votre expérience de navigation. Vous pouvez gérer vos 
            préférences de cookies via notre bandeau de consentement ou les paramètres de votre navigateur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Sécurité</h2>
          <p className="text-muted-foreground">
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos 
            données contre tout accès non autorisé, modification, divulgation ou destruction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Modifications</h2>
          <p className="text-muted-foreground">
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
            Les modifications seront publiées sur cette page avec une date de mise à jour.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Contact et réclamation</h2>
          <p className="text-muted-foreground">
            Pour toute question concernant vos données personnelles, contactez-nous à : <strong>contact@shu-no.fr</strong>
            <br /><br />
            Vous avez également le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale 
            de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline text-primary">www.cnil.fr</a>
          </p>
        </section>

        <p className="text-sm text-muted-foreground italic mt-6">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Confidentialite;

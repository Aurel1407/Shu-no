/**
 * Page de test pour ErrorBoundary
 * 
 * Cette page permet de tester les différents scénarios d'erreur
 * et de visualiser le rendu de l'ErrorBoundary.
 */

import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bug } from 'lucide-react';

/**
 * Composant qui génère une erreur au clic
 */
function ErrorTrigger({ errorType }: { errorType: string }) {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    switch (errorType) {
      case 'render':
        throw new Error('💥 Erreur de rendu React simulée');
      case 'network':
        throw new Error('fetch failed: network error - Unable to connect to the server');
      case 'auth':
        throw new Error('401 unauthorized: Session expired');
      case 'permission':
        throw new Error('403 forbidden: Access denied to this resource');
      case 'notfound':
        throw new Error('404 not found: Resource does not exist');
      case 'server':
        throw new Error('500 internal server error: Database connection failed');
      default:
        throw new Error('Une erreur inconnue s\'est produite');
    }
  }

  return (
    <Button
      onClick={() => setShouldError(true)}
      variant="destructive"
      className="w-full"
    >
      <Bug className="h-4 w-4 mr-2" />
      Déclencher l'erreur
    </Button>
  );
}

/**
 * Page de test ErrorBoundary
 */
export default function ErrorBoundaryTest() {
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
  };

  const errorScenarios = [
    {
      id: 'render',
      title: 'Erreur de rendu React',
      description: 'Erreur générique dans le composant'
    },
    {
      id: 'network',
      title: 'Erreur réseau',
      description: 'Échec de connexion au serveur'
    },
    {
      id: 'auth',
      title: 'Erreur d\'authentification',
      description: 'Session expirée (401)'
    },
    {
      id: 'permission',
      title: 'Erreur de permission',
      description: 'Accès refusé (403)'
    },
    {
      id: 'notfound',
      title: 'Ressource introuvable',
      description: 'Erreur 404'
    },
    {
      id: 'server',
      title: 'Erreur serveur',
      description: 'Erreur 500'
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Test ErrorBoundary</h1>
          <p className="text-muted-foreground text-lg">
            Testez les différents scénarios d'erreur pour visualiser le comportement de l'ErrorBoundary
          </p>
        </div>

        {/* Avertissement */}
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <CardTitle className="text-yellow-900 dark:text-yellow-100">
                Attention : Page de test
              </CardTitle>
            </div>
            <CardDescription className="text-yellow-800 dark:text-yellow-200">
              Cette page est destinée au développement et aux tests. Les erreurs déclenchées sont
              volontaires et permettent de vérifier le bon fonctionnement de l'ErrorBoundary.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Grille de scénarios */}
        <div className="grid md:grid-cols-2 gap-4">
          {errorScenarios.map((scenario) => (
            <Card key={scenario.id}>
              <CardHeader>
                <CardTitle className="text-lg">{scenario.title}</CardTitle>
                <CardDescription>{scenario.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary
                  key={`${scenario.id}-${resetKey}`}
                  onReset={handleReset}
                >
                  <ErrorTrigger errorType={scenario.id} />
                </ErrorBoundary>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Comment tester ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">1. Déclencher une erreur</h3>
              <p className="text-sm text-muted-foreground">
                Cliquez sur un des boutons "Déclencher l'erreur" ci-dessus pour simuler une erreur.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Observer l'ErrorBoundary</h3>
              <p className="text-sm text-muted-foreground">
                Vous verrez apparaître l'interface d'erreur avec le message adapté au type d'erreur.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Tester les actions</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><strong>Réessayer</strong> : Réinitialise le composant sans recharger la page</li>
                <li><strong>Retour à l'accueil</strong> : Navigue vers la page d'accueil</li>
                <li><strong>Recharger la page</strong> : Recharge complètement la page</li>
                <li><strong>Détails techniques</strong> : Affiche la stack trace complète</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">4. Vérifier les messages</h3>
              <p className="text-sm text-muted-foreground">
                Chaque type d'erreur affiche un message personnalisé et des conseils adaptés.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fonctionnalités */}
        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités de l'ErrorBoundary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                  ✅ Messages personnalisés
                </h4>
                <p className="text-sm text-muted-foreground">
                  Détection automatique du type d'erreur et affichage d'un message adapté
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                  ✅ Bouton Réessayer
                </h4>
                <p className="text-sm text-muted-foreground">
                  Réinitialise le composant sans recharger toute la page
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                  ✅ Retour à l'accueil
                </h4>
                <p className="text-sm text-muted-foreground">
                  Navigation vers la page d'accueil pour récupérer l'utilisateur
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                  ✅ Détails techniques
                </h4>
                <p className="text-sm text-muted-foreground">
                  Stack trace complète pour le debugging (développeurs)
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                  ✅ Design responsive
                </h4>
                <p className="text-sm text-muted-foreground">
                  Interface adaptée mobile/desktop avec shadcn/ui
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                  ✅ Mode sombre
                </h4>
                <p className="text-sm text-muted-foreground">
                  Support complet du thème sombre
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

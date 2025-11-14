import React, { Component, ErrorInfo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { errorService } from "@/lib/error-service";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Logger l'erreur avec le service d'erreurs
    errorService.handleError(error, "React Error Boundary");

    // Stocker les informations d'erreur pour l'affichage
    this.setState({ errorInfo });

    // Log détaillé pour le debugging
    console.error("React Error Boundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: "ErrorBoundary",
    });

    // Callback personnalisé si fourni
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      showDetails: false 
    });
    this.props.onReset?.();
  };

  toggleDetails = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  getErrorMessage = (error?: Error): { title: string; description: string } => {
    if (!error) {
      return {
        title: "Une erreur inattendue s'est produite",
        description: "Nous nous excusons pour la gêne occasionnée."
      };
    }

    // Erreurs réseau
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
      };
    }

    // Erreurs d'authentification
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return {
        title: "Session expirée",
        description: "Votre session a expiré. Veuillez vous reconnecter."
      };
    }

    // Erreurs de permission
    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return {
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource."
      };
    }

    // Erreurs 404
    if (error.message.includes('404') || error.message.includes('not found')) {
      return {
        title: "Ressource introuvable",
        description: "La ressource demandée n'existe pas ou a été supprimée."
      };
    }

    // Erreurs serveur
    if (error.message.includes('500') || error.message.includes('server')) {
      return {
        title: "Erreur serveur",
        description: "Le serveur a rencontré une erreur. Nos équipes ont été notifiées."
      };
    }

    // Erreur par défaut
    return {
      title: "Une erreur s'est produite",
      description: error.message || "Nous nous excusons pour la gêne occasionnée."
    };
  };

  render() {
    if (this.state.hasError) {
      // Rendu du fallback personnalisé ou par défaut
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { title, description } = this.getErrorMessage(this.state.error);

      // Fallback par défaut amélioré
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <Card className="max-w-2xl w-full shadow-xl">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{title}</CardTitle>
                  <CardDescription className="text-base">
                    {description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Code d'erreur si disponible */}
              {this.state.error && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-mono text-muted-foreground">
                    <span className="font-semibold">Code:</span> {this.state.error.name}
                  </p>
                </div>
              )}

              {/* Bouton pour afficher/masquer les détails */}
              {(this.state.error || this.state.errorInfo) && (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.toggleDetails}
                    className="w-full justify-between"
                  >
                    <span>Détails techniques</span>
                    {this.state.showDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {this.state.showDetails && (
                    <div className="mt-3 p-4 bg-slate-900 dark:bg-slate-950 rounded-lg overflow-auto max-h-64">
                      {this.state.error && (
                        <div className="mb-4">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
                            Message d'erreur:
                          </p>
                          <p className="text-xs text-red-400 font-mono">
                            {this.state.error.message}
                          </p>
                        </div>
                      )}

                      {this.state.error?.stack && (
                        <div className="mb-4">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
                            Stack trace:
                          </p>
                          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}

                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
                            Component stack:
                          </p>
                          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Conseils pour l'utilisateur */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
                  Que faire maintenant ?
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Cliquez sur "Réessayer" pour tenter à nouveau l'opération</li>
                  <li>Retournez à l'accueil et recommencez</li>
                  <li>Si le problème persiste, contactez le support</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3">
              {/* Bouton Réessayer */}
              <Button
                onClick={this.handleReset}
                className="flex-1 gap-2"
                variant="default"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>

              {/* Bouton Retour à l'accueil */}
              <ErrorBoundaryHomeButton />

              {/* Bouton Recharger la page (en dernier recours) */}
              <Button
                onClick={() => globalThis.location.reload()}
                variant="outline"
                className="flex-1 gap-2"
              >
                Recharger la page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Composant bouton pour retourner à l'accueil
 * Séparé car il utilise le hook useNavigate
 */
function ErrorBoundaryHomeButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/')}
      variant="outline"
      className="flex-1 gap-2"
    >
      <Home className="h-4 w-4" />
      Retour à l'accueil
    </Button>
  );
}

/**
 * Hook pour utiliser Error Boundary dans les composants fonctionnels
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    errorService.handleError(error, "useErrorHandler");

    if (errorInfo?.componentStack) {
      console.error("Component stack:", errorInfo.componentStack);
    }
  };
}

/**
 * HOC pour envelopper les composants avec Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

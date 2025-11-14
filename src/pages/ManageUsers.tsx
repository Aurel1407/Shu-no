import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Users, UserPlus, Edit, Trash2, Eye, AlertCircle, RefreshCw, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePageFocus } from "@/hooks/use-page-focus";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAsyncOperation } from "@/hooks/use-async-operation";
import { useSuccessMessage } from "@/hooks/use-success-message";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { TableSkeleton } from "@/components/ui/skeletons";

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<string>("all");

  // Hooks personnalisés
  const mainContentRef = usePageFocus();
  usePageTitle("Gestion des utilisateurs");
  const { showSuccessMessage } = useSuccessMessage();
  const { apiCall } = useAuthenticatedApi();

  const loadUsersOperation = useAsyncOperation(async () => {
    const response = await apiCall("/api/users");
    setUsers(response.data || []);
  });

  useEffect(() => {
    loadUsersOperation.execute();
  }, []);

  // Changer le rôle d'un utilisateur
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await apiCall(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          role: newRole,
        }),
      });

      // Recharger la liste après modification
      await loadUsersOperation.execute();
      showSuccessMessage("Rôle modifié avec succès");
    } catch (err) {
      console.error("Erreur lors de la modification du rôle:", err);
      loadUsersOperation.setError(
        err instanceof Error ? err.message : "Erreur lors de la modification du rôle"
      );
    }
  };

  // Supprimer un utilisateur (soft delete)
  const handleDelete = async (userId: number) => {
    try {
      await apiCall(`/api/users/${userId}`, {
        method: "DELETE",
      });
      // Recharger la liste après suppression
      await loadUsersOperation.execute();
      showSuccessMessage("Utilisateur supprimé avec succès");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      loadUsersOperation.setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    }
  };

  // Restaurer un utilisateur supprimé
  const handleRestore = async (userId: number) => {
    try {
      await apiCall(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: true }),
      });
      // Recharger la liste après restauration
      await loadUsersOperation.execute();
      showSuccessMessage("Utilisateur restauré avec succès");
    } catch (err) {
      console.error("Erreur lors de la restauration:", err);
      loadUsersOperation.setError(
        err instanceof Error ? err.message : "Erreur lors de la restauration"
      );
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    return user.role === filter;
  });

  const getRoleBadge = (role: string, isActive?: boolean) => {
    if (isActive === false) {
      return (
        <Badge variant="destructive">
          <X className="mr-1 h-3 w-3" aria-hidden="true" />
          Supprimé
        </Badge>
      );
    }
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Administrateur</Badge>;
      case "user":
        return <Badge variant="default">Utilisateur</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loadUsersOperation.loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">
              Gestion des Utilisateurs
            </h1>
            <p className="text-muted-foreground">Gérez les comptes utilisateurs</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs</CardTitle>
              <CardDescription>Liste de tous les utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={6} />
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Liens de navigation rapide pour l'accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller au contenu principal
      </a>
      <a
        href="#filters"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller aux filtres
      </a>
      <a
        href="#users-table"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-bleu-moyen text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-bleu-clair"
      >
        Aller au tableau des utilisateurs
      </a>

      <Header />

      {/* Contenu principal */}
      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        role="main"
        aria-label="Page de gestion des utilisateurs"
      >
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Administration', href: '/admin' },
              { label: 'Utilisateurs', current: true }
            ]}
            className="mb-6"
          />
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-bleu-profond mb-2">
                Gestion des Utilisateurs
              </h1>
              <p className="text-muted-foreground">Gérez les comptes utilisateurs et leurs rôles</p>
            </div>
            <div className="flex gap-3 items-center">
              <Button
                variant="outline"
                onClick={() => loadUsersOperation.execute()}
                disabled={loadUsersOperation.loading}
                aria-label="Actualiser la liste des utilisateurs"
                size="lg"
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Actualiser
              </Button>
              <Link to="/admin">
                <Button
                  variant="outline"
                  aria-label="Retourner au tableau de bord administrateur"
                  size="lg"
                  className="flex items-center"
                >
                  <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                  Tableau de Bord
                </Button>
              </Link>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {loadUsersOperation.error && (
            <Alert variant="destructive" className="mb-6" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{loadUsersOperation.error}</AlertDescription>
            </Alert>
          )}

          {/* Filtre */}
          <div id="filters" className="mb-6" role="region" aria-labelledby="filters-title">
            <h2 id="filters-title" className="sr-only">
              Filtres de recherche
            </h2>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48" aria-label="Filtrer les utilisateurs par rôle">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
                <SelectItem value="user">Utilisateurs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste des Utilisateurs</CardTitle>
              <CardDescription>
                {filteredUsers.filter((u) => u.isActive !== false).length} utilisateur
                {filteredUsers.filter((u) => u.isActive !== false).length > 1 ? "s" : ""} actif
                {filteredUsers.filter((u) => u.isActive !== false).length > 1 ? "s" : ""}
                {filteredUsers.some((u) => u.isActive === false) && (
                  <>
                    {" "}
                    • {filteredUsers.filter((u) => u.isActive === false).length} supprimé
                    {filteredUsers.filter((u) => u.isActive === false).length > 1 ? "s" : ""}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8" role="status" aria-live="polite">
                  <Users
                    className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <p className="text-muted-foreground mb-4">Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <div
                  id="users-table"
                  role="region"
                  aria-labelledby="table-title"
                  aria-describedby="table-description"
                >
                  <h3 id="table-title" className="sr-only">
                    Tableau des utilisateurs
                  </h3>
                  <p id="table-description" className="sr-only">
                    Liste des utilisateurs avec informations détaillées et actions disponibles
                  </p>
                  <Table aria-describedby="table-description">
                    <TableCaption>Liste complète des utilisateurs de la plateforme</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          ID
                        </TableHead>
                        <TableHead>
                          Nom complet
                        </TableHead>
                        <TableHead>
                          Email
                        </TableHead>
                        <TableHead>
                          Rôle
                        </TableHead>
                        <TableHead>
                          Date d'inscription
                        </TableHead>
                        <TableHead>
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className={!user.isActive ? "opacity-60 bg-muted/50" : ""}
                        >
                          <TableCell>{user.id}</TableCell>
                          <TableCell className="font-medium">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : "Non spécifié"}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role, user.isActive)}</TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {user.isActive ? (
                                <>
                                  <Select
                                    value={user.role}
                                    onValueChange={(value) => handleRoleChange(user.id, value)}
                                  >
                                    <SelectTrigger
                                      className="w-32"
                                      aria-label={`Changer le rôle de ${user.firstName || ""} ${user.lastName || user.email}`}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">Utilisateur</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        aria-label={`Supprimer ${user.firstName || ""} ${user.lastName || user.email}`}
                                      >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Confirmer la suppression
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Êtes-vous sûr de vouloir supprimer l'utilisateur "
                                          {user.email}" ? L'utilisateur sera marqué comme supprimé
                                          mais pourra être restauré ultérieurement.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(user.id)}>
                                          Supprimer
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestore(user.id)}
                                  disabled={loadUsersOperation.loading}
                                  className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                                  aria-label={`Restaurer ${user.firstName || ""} ${user.lastName || user.email}`}
                                >
                                  Restaurer
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default ManageUsers;

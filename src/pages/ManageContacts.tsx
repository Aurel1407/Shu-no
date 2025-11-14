import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Phone,
  Eye,
  Trash2,
  CheckCircle,
  Circle,
  Search,
  MessageSquare,
  User,
  Clock,
  Home,
  RefreshCw,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_URLS } from "@/config/api";
import { usePageFocus } from "@/hooks/use-page-focus";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { useAsyncOperation } from "@/hooks/use-async-operation";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface ContactStats {
  total: number;
  unread: number;
  read: number;
}

const ManageContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ContactStats>({ total: 0, unread: 0, read: 0 });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "subject">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Hooks personnalisés
  const mainContentRef = usePageFocus();
  usePageTitle("Gestion des Messages de Contact");
  const { apiCall } = useAuthenticatedApi();

  const loadContactsOperation = useAsyncOperation(async () => {
    const response = await apiCall(API_URLS.CONTACTS);
    const contactsData = response.data || [];
    setContacts(contactsData);
    setFilteredContacts(contactsData);

    // Calculer les statistiques
    const total = contactsData.length;
    const unread = contactsData.filter((c: Contact) => !c.isRead).length;
    const read = total - unread;
    setStats({ total, unread, read });
  });

  const markAsReadOperation = useAsyncOperation(async (contactId: number) => {
    await apiCall(`${API_URLS.CONTACTS}/${contactId}/read`, {
      method: "PUT",
    });

    // Mettre à jour localement
    setContacts((prev) => prev.map((c) => (c.id === contactId ? { ...c, isRead: true } : c)));
    setFilteredContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, isRead: true } : c))
    );

    // Recalculer les stats
    setStats((prev) => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1),
      read: prev.read + 1,
    }));
  });

  const deleteContactOperation = useAsyncOperation(async (contactId: number) => {
    await apiCall(`${API_URLS.CONTACTS}/${contactId}`, {
      method: "DELETE",
    });

    // Supprimer localement
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    setFilteredContacts((prev) => prev.filter((c) => c.id !== contactId));

    // Recalculer les stats
    const deletedContact = contacts.find((c) => c.id === contactId);
    if (deletedContact) {
      setStats((prev) => ({
        total: prev.total - 1,
        unread: deletedContact.isRead ? prev.unread : prev.unread - 1,
        read: deletedContact.isRead ? prev.read - 1 : prev.read,
      }));
    }
  });

  // Filtrage et tri des contacts
  useEffect(() => {
    let filtered = [...contacts];

    // Filtre par statut
    if (filterStatus === "unread") {
      filtered = filtered.filter((c) => !c.isRead);
    } else if (filterStatus === "read") {
      filtered = filtered.filter((c) => c.isRead);
    }

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.firstName.toLowerCase().includes(term) ||
          c.lastName.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.subject.toLowerCase().includes(term) ||
          c.message.toLowerCase().includes(term)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "name":
          aValue = `${a.lastName} ${a.firstName}`.toLowerCase();
          bValue = `${b.lastName} ${b.firstName}`.toLowerCase();
          break;
        case "subject":
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        case "date":
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, filterStatus, sortBy, sortOrder]);

  useEffect(() => {
    loadContactsOperation.execute();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContactFullName = (contact: Contact) => {
    return `${contact.firstName} ${contact.lastName}`;
  };

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

      <main ref={mainContentRef} id="main-content" className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Actions principales */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Messages</h1>
              <p className="text-muted-foreground">
                Consultez et gérez les messages de contact reçus
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <Button
                variant="outline"
                onClick={loadContactsOperation.execute}
                disabled={loadContactsOperation.loading}
                aria-label="Actualiser la liste des messages"
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

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Non Lus</CardTitle>
                <Circle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lus</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.read}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et recherche */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtres et Recherche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nom, email, sujet..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter">Statut</Label>
                  <Select
                    value={filterStatus}
                    onValueChange={(value: any) => setFilterStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="unread">Non lus</SelectItem>
                      <SelectItem value="read">Lus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort-by">Trier par</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Nom</SelectItem>
                      <SelectItem value="subject">Sujet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort-order">Ordre</Label>
                  <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Décroissant</SelectItem>
                      <SelectItem value="asc">Croissant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des messages */}
          <Card>
            <CardHeader>
              <CardTitle>Messages ({filteredContacts.length})</CardTitle>
              <CardDescription>
                {loadContactsOperation.loading && "Chargement en cours..."}
                {loadContactsOperation.error && (
                  <Alert className="mt-2">
                    <AlertDescription>
                      Erreur lors du chargement : {String(loadContactsOperation.error)}
                    </AlertDescription>
                  </Alert>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || filterStatus !== "all"
                    ? "Aucun message ne correspond aux critères de recherche"
                    : "Aucun message de contact pour le moment"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Statut</TableHead>
                      <TableHead>Expéditeur</TableHead>
                      <TableHead>Sujet</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Badge variant={contact.isRead ? "secondary" : "default"}>
                            {contact.isRead ? "Lu" : "Non lu"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{getContactFullName(contact)}</div>
                              <div className="text-sm text-muted-foreground">{contact.email}</div>
                              {contact.phone && (
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {contact.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={contact.subject}>
                            {contact.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(contact.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedContact(contact)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Voir
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{contact.subject}</DialogTitle>
                                  <DialogDescription>
                                    Message de {getContactFullName(contact)} -{" "}
                                    {formatDate(contact.createdAt)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Nom complet</Label>
                                      <p className="text-sm">{getContactFullName(contact)}</p>
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <p className="text-sm">{contact.email}</p>
                                    </div>
                                    {contact.phone && (
                                      <>
                                        <div>
                                          <Label>Téléphone</Label>
                                          <p className="text-sm">{contact.phone}</p>
                                        </div>
                                        <div>
                                          <Label>Statut</Label>
                                          <Badge variant={contact.isRead ? "secondary" : "default"}>
                                            {contact.isRead ? "Lu" : "Non lu"}
                                          </Badge>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <div>
                                    <Label>Message</Label>
                                    <Textarea
                                      value={contact.message}
                                      readOnly
                                      className="min-h-32"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    {!contact.isRead && (
                                      <Button
                                        onClick={() => markAsReadOperation.execute(contact.id)}
                                        disabled={markAsReadOperation.loading}
                                      >
                                        Marquer comme lu
                                      </Button>
                                    )}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Supprimer
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Confirmer la suppression
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Êtes-vous sûr de vouloir supprimer ce message ? Cette
                                            action est irréversible.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              deleteContactOperation.execute(contact.id)
                                            }
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Supprimer
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {!contact.isRead && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsReadOperation.execute(contact.id)}
                                disabled={markAsReadOperation.loading}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer le message de{" "}
                                    {getContactFullName(contact)} ? Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteContactOperation.execute(contact.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ManageContacts;

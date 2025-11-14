import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

// Mock pour tous les composants - liste complète des icônes utilisées
vi.mock("lucide-react", () => {
  const icons = [
    "Home",
    "User",
    "Users",
    "Mail",
    "Phone",
    "MapPin",
    "Calendar",
    "CreditCard",
    "Settings",
    "Edit",
    "Save",
    "Delete",
    "Plus",
    "Minus",
    "Search",
    "Filter",
    "Sort",
    "Download",
    "Upload",
    "Eye",
    "EyeOff",
    "Lock",
    "Unlock",
    "Star",
    "Heart",
    "Share",
    "Bell",
    "Check",
    "X",
    "Info",
    "AlertCircle",
    "CheckCircle",
    "XCircle",
    "RefreshCw",
    "ArrowLeft",
    "ArrowRight",
    "ChevronLeft",
    "ChevronRight",
    "ChevronUp",
    "ChevronDown",
    // Icônes manquantes identifiées dans les erreurs
    "Menu",
    "Sun",
    "Moon",
    "Loader2",
    "Trash2",
    "Circle",
    "MessageSquare",
    "DollarSign",
    "TrendingUp",
    "BarChart3",
    "Clock",
    "UserPlus",
    "LogIn",
    "LogOut",
    "Facebook",
    "Instagram",
    "Bed",
    "Bath",
    "Wifi",
    "Car",
    "Image",
    "Swimming",
    "Utensils",
    "Tv",
    "Wind",
    "Coffee",
    "Camera",
    "Mountain",
    "Dot",
    "MoreHorizontal",
  ];

  const mockIcons: any = {};
  icons.forEach((icon) => {
    mockIcons[icon] = () => <span>{icon} Icon</span>;
  });

  return mockIcons;
});

vi.mock("../hooks/use-authenticated-api", () => ({
  useAuthenticatedApi: () => ({
    user: { id: 1, username: "test", role: "user" },
    logout: vi.fn(),
  }),
}));

vi.mock("../hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.fetch = vi.fn();

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("Component Rendering Coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: "test" }),
    });
  });

  it("should render basic UI components", async () => {
    const Button = (await import("../components/ui/button")).Button;
    const Input = (await import("../components/ui/input")).Input;
    const Label = (await import("../components/ui/label")).Label;

    render(
      <div>
        <Button>Test Button</Button>
        <Label htmlFor="test">Test Label</Label>
        <Input id="test" placeholder="Test Input" />
      </div>
    );

    expect(screen.getByText("Test Button")).toBeInTheDocument();
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Test Input")).toBeInTheDocument();
  });

  it("should render card components", async () => {
    const { Card, CardHeader, CardTitle, CardContent } = await import("../components/ui/card");

    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card content</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText("Test Card")).toBeInTheDocument();
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("should render alert components", async () => {
    const { Alert, AlertDescription } = await import("../components/ui/alert");

    render(
      <Alert>
        <AlertDescription>Test alert message</AlertDescription>
      </Alert>
    );

    expect(screen.getByText("Test alert message")).toBeInTheDocument();
  });

  it("should render table components", async () => {
    const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } = await import(
      "../components/ui/table"
    );

    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Cell")).toBeInTheDocument();
  });

  it("should render dialog components", async () => {
    const { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } = await import(
      "../components/ui/dialog"
    );

    render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Dialog Title")).toBeInTheDocument();
  });

  it("should render basic pages", async () => {
    const NotFound = (await import("../pages/NotFound")).default;

    renderWithProviders(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("should render contact page", async () => {
    const Contact = (await import("../pages/Contact")).default;

    renderWithProviders(<Contact />);

    // Chercher le titre principal de la page par son ID
    expect(screen.getByText("Contactez-nous")).toBeInTheDocument();
  });

  it("should test theme toggle", async () => {
    const ThemeToggle = (await import("../components/ThemeToggle")).default;

    render(<ThemeToggle />);

    // Le bouton de toggle a un role "switch"
    const themeSwitch = screen.getByRole("switch");
    expect(themeSwitch).toBeInTheDocument();
  });

  it("should render loading components", async () => {
    const LoadingSpinner = (await import("../components/ui/loading-spinner")).LoadingSpinner;

    render(<LoadingSpinner />);

    // Chercher l'icône Loader2 mockée
    expect(screen.getByText("Loader2 Icon")).toBeInTheDocument();
  });

  it("should render skeleton components", async () => {
    const { Skeleton } = await import("../components/ui/skeleton");

    render(<Skeleton className="h-4 w-20" />);

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should render form components", async () => {
    const { Form, FormField, FormItem, FormLabel, FormControl } = await import(
      "../components/ui/form"
    );
    const { useForm } = await import("react-hook-form");

    const TestForm = () => {
      const form = useForm();
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="test"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Field</FormLabel>
                <FormControl>
                  <input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      );
    };

    render(<TestForm />);

    expect(screen.getByText("Test Field")).toBeInTheDocument();
  });
});

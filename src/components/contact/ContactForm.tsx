import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { API_URLS } from "@/config/api";

// Schéma de validation avec Zod
const contactSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[\d\s\-+().]{10,20}$/.test(val), {
      message: "Format de numéro de téléphone invalide",
    }),
  subject: z
    .string()
    .min(5, "Le sujet doit contenir au moins 5 caractères")
    .max(100, "Le sujet ne peut pas dépasser 100 caractères"),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères"),
});

type ContactFormData = z.infer<typeof contactSchema>;

type FormStatus = "idle" | "loading" | "success" | "error";

const ContactForm = () => {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(API_URLS.CONTACTS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        reset(); // Réinitialiser le formulaire
      } else {
        throw new Error(result.message || "Erreur lors de l'envoi du message");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Une erreur inattendue s'est produite"
      );
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setErrorMessage("");
    reset();
  };

  return (
    <Card className="bg-gradient-to-br from-bleu-clair/20 to-bleu-profond/10 border-bleu-moyen/30 shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair text-center text-card-foreground dark:text-white">
          Formulaire de contact
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground dark:text-gray-300">
          N'hésitez pas à nous contacter pour toute question concernant nos gîtes ou votre
          réservation sur la Côte de Goëlo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "success" && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs
              délais.
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-card-foreground dark:text-white">
                Prénom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Votre prénom"
                className={`bg-background border-bleu-moyen/30 ${errors.firstName ? "border-red-500" : ""}`}
                aria-label="Votre prénom"
                aria-describedby="firstName-help firstName-error"
                disabled={status === "loading"}
              />
              <span id="firstName-help" className="sr-only">
                Entrez votre prénom pour nous permettre de vous contacter personnellement
              </span>
              {errors.firstName && (
                <span
                  id="firstName-error"
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errors.firstName.message}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-card-foreground dark:text-white">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Votre nom"
                className={`bg-background border-bleu-moyen/30 ${errors.lastName ? "border-red-500" : ""}`}
                aria-label="Votre nom de famille"
                aria-describedby="lastName-help lastName-error"
                disabled={status === "loading"}
              />
              <span id="lastName-help" className="sr-only">
                Entrez votre nom de famille pour compléter vos coordonnées
              </span>
              {errors.lastName && (
                <span
                  id="lastName-error"
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground dark:text-white">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="votre.email@exemple.com"
              className={`bg-background border-bleu-moyen/30 ${errors.email ? "border-red-500" : ""}`}
              aria-label="Votre adresse email"
              aria-describedby="email-help email-error"
              autoComplete="email"
              disabled={status === "loading"}
            />
            <span id="email-help" className="sr-only">
              Votre adresse email nous permettra de vous répondre
            </span>
            {errors.email && (
              <span
                id="email-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-card-foreground dark:text-white">
              Téléphone
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="Votre numéro de téléphone"
              className={`bg-background border-bleu-moyen/30 ${errors.phone ? "border-red-500" : ""}`}
              aria-label="Votre numéro de téléphone"
              aria-describedby="phone-help phone-error"
              autoComplete="tel"
              disabled={status === "loading"}
            />
            <span id="phone-help" className="sr-only">
              Numéro de téléphone optionnel pour un contact plus rapide
            </span>
            {errors.phone && (
              <span
                id="phone-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.phone.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-card-foreground dark:text-white">
              Sujet <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              {...register("subject")}
              placeholder="Sujet de votre message"
              className={`bg-background border-bleu-moyen/30 ${errors.subject ? "border-red-500" : ""}`}
              aria-label="Sujet de votre message"
              aria-describedby="subject-help subject-error"
              disabled={status === "loading"}
            />
            <span id="subject-help" className="sr-only">
              Précisez le sujet de votre demande
            </span>
            {errors.subject && (
              <span
                id="subject-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.subject.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-card-foreground dark:text-white">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Votre message..."
              className={`min-h-32 bg-background border-bleu-moyen/30 ${errors.message ? "border-red-500" : ""}`}
              aria-label="Votre message"
              aria-describedby="message-help message-error"
              disabled={status === "loading"}
            />
            <span id="message-help" className="sr-only">
              Décrivez votre demande en détail
            </span>
            {errors.message && (
              <span
                id="message-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.message.message}
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-bleu-moyen hover:bg-bleu-profond text-white transition-colors disabled:opacity-50"
              aria-label="Envoyer le message de contact"
              disabled={status === "loading" || !isValid}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer le message de contact"
              )}
            </Button>

            {status === "success" && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-bleu-moyen text-bleu-moyen hover:bg-bleu-moyen hover:text-white"
              >
                Nouveau message
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;

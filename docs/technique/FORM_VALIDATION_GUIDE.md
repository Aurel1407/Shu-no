# Guide d'Utilisation - Validation de Formulaires Accessible

> Guide rapide pour implémenter la validation accessible dans vos formulaires React/TypeScript

---

## 🎯 Pattern de Base

### Structure Minimale

```tsx
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function MonFormulaire() {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setError("Email invalide");
      return;
    }

    // Traitement...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 1. Message d'erreur avec role="alert" */}
      {error && (
        <Alert id="form-error" variant="destructive" role="alert" aria-live="assertive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 2. Champ avec aria-invalid et aria-describedby */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "form-error email-help" : "email-help"}
        />
        <div id="email-help" className="sr-only">
          Entrez votre adresse email valide
        </div>
      </div>

      <button type="submit">Envoyer</button>
    </form>
  );
}
```

---

## 🔧 Hook Réutilisable (Recommandé)

### Avec `useFormValidation`

```tsx
import { useFormValidation, validationRules } from "@/hooks/use-form-validation";

function MonFormulaire() {
  const {
    values,
    errors,
    touched,
    isValid,
    setFieldValue,
    setFieldTouched,
    validateAll,
    getFieldProps, // 🆕 Helper ARIA
  } = useFormValidation(
    // Valeurs initiales
    { email: "", password: "" },

    // Règles de validation
    {
      email: [validationRules.required("Email requis"), validationRules.email("Email invalide")],
      password: [
        validationRules.required("Mot de passe requis"),
        validationRules.minLength(6, "Minimum 6 caractères"),
      ],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAll();

    if (!validation.isValid) return;

    // Traitement...
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => setFieldValue("email", e.target.value)}
          onBlur={() => setFieldTouched("email")}
          {...getFieldProps("email", "email-help")} // 🎯 Accessibilité automatique
        />
        <div id="email-help" className="sr-only">
          Entrez votre adresse email
        </div>
        {errors.email && touched.email && (
          <div id="email-error" role="alert" className="text-destructive">
            {errors.email}
          </div>
        )}
      </div>

      <button type="submit" disabled={!isValid}>
        Envoyer
      </button>
    </form>
  );
}
```

---

## 📋 Checklist d'Implémentation

### Obligatoire (WCAG Level A)

- [ ] **Message d'erreur global** :

  ```tsx
  <Alert id="form-error" role="alert" aria-live="assertive">
    {error}
  </Alert>
  ```

- [ ] **aria-invalid sur champs** :

  ```tsx
  <Input aria-invalid={!!error} />
  ```

- [ ] **aria-describedby dynamique** :

  ```tsx
  <Input aria-describedby={error ? "form-error field-help" : "field-help"} />
  ```

- [ ] **Texte d'aide sr-only** :
  ```tsx
  <div id="field-help" className="sr-only">
    Instructions pour ce champ
  </div>
  ```

### Recommandé (WCAG Level AA)

- [ ] **Messages d'erreur par champ** :

  ```tsx
  {
    fieldError && (
      <div id="field-error" role="alert">
        {fieldError}
      </div>
    );
  }
  ```

- [ ] **Validation au blur** :

  ```tsx
  <Input onBlur={() => validateField("email")} />
  ```

- [ ] **Focus sur premier champ invalide** :

  ```tsx
  const firstInvalid = formRef.current?.querySelector('[aria-invalid="true"]');
  (firstInvalid as HTMLElement)?.focus();
  ```

- [ ] **Icons avec aria-hidden** :
  ```tsx
  <AlertCircle className="h-4 w-4" aria-hidden="true" />
  ```

---

## 🎨 Exemples par Type de Formulaire

### 1. Formulaire de Connexion

```tsx
function UserLogin() {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert id="login-error" variant="destructive" role="alert" aria-live="assertive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={!!error}
          aria-describedby={error ? "login-error email-help" : "email-help"}
          autoComplete="email"
        />
        <div id="email-help" className="sr-only">
          Entrez votre adresse email pour vous connecter
        </div>
      </div>

      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-invalid={!!error}
          aria-describedby={error ? "login-error password-help" : "password-help"}
          autoComplete="current-password"
        />
        <div id="password-help" className="sr-only">
          Entrez votre mot de passe
        </div>
      </div>

      <Button type="submit">Se connecter</Button>
    </form>
  );
}
```

### 2. Formulaire avec Plusieurs Erreurs

```tsx
function PropertyForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    location: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Effacer l'erreur du champ modifié
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const hasError = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit}>
      {hasError && (
        <Alert id="property-form-error" variant="destructive" role="alert" aria-live="assertive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>Veuillez corriger les erreurs ci-dessous</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="name">Nom de la propriété *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "property-form-error name-help name-error" : "name-help"}
        />
        <div id="name-help" className="sr-only">
          Entrez le nom de votre propriété
        </div>
        {errors.name && (
          <div id="name-error" role="alert" className="text-destructive text-sm">
            {errors.name}
          </div>
        )}
      </div>

      {/* Répéter pour price, location... */}

      <Button type="submit">Enregistrer</Button>
    </form>
  );
}
```

### 3. Formulaire avec Messages de Succès

```tsx
function ReservationSummary() {
  const [submitMessage, setSubmitMessage] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  return (
    <form onSubmit={handleSubmit}>
      {submitMessage && (
        <Alert
          id="reservation-message"
          role="alert"
          aria-live={submitMessage.type === "error" ? "assertive" : "polite"}
          className={
            submitMessage.type === "error"
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }
        >
          {submitMessage.type === "error" ? (
            <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
          )}
          <AlertDescription
            className={submitMessage.type === "error" ? "text-red-800" : "text-green-800"}
          >
            {submitMessage.message}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="guests">Nombre de voyageurs</Label>
        <Input
          id="guests"
          type="number"
          min="1"
          max={10}
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
          aria-invalid={submitMessage?.type === "error" && guests > 10}
          aria-describedby={submitMessage?.type === "error" ? "reservation-message" : undefined}
        />
      </div>

      <Button type="submit">Réserver</Button>
    </form>
  );
}
```

---

## 🧪 Tests Manuels

### 1. Test Lecteur d'Écran (NVDA/JAWS)

1. **Activer NVDA** : `Ctrl + Alt + N`
2. **Soumettre formulaire avec erreurs** : `Enter`
3. **Vérifier annonce** :
   - ✅ Entendre "Alerte. [Message d'erreur]"
4. **Tabuler vers champ invalide** : `Tab`
5. **Vérifier annonce** :
   - ✅ Entendre "Nom du champ, modification, invalide, décrit par [IDs]"
6. **Écouter texte d'aide** : `NVDA + Tab`
   - ✅ Entendre le texte d'aide sr-only

### 2. Test Clavier

- [ ] `Tab` : Navigation fluide entre champs
- [ ] `Enter` sur submit : Erreur annoncée sans rechargement page
- [ ] `Esc` : Aucun piège clavier
- [ ] Focus visible : Outline autour du champ actif

### 3. Test Zoom 200%

1. **Zoomer** : `Ctrl + +` (jusqu'à 200%)
2. **Vérifier** :
   - [ ] Messages d'erreur visibles
   - [ ] Champs alignés correctement
   - [ ] Pas de texte tronqué

---

## ❌ Erreurs Fréquentes

### 1. Oublier `role="alert"`

```tsx
// ❌ MAUVAIS
<Alert variant="destructive">
  {error}
</Alert>

// ✅ BON
<Alert variant="destructive" role="alert" aria-live="assertive">
  {error}
</Alert>
```

### 2. `aria-invalid` statique

```tsx
// ❌ MAUVAIS (toujours true)
<Input aria-invalid={true} />

// ✅ BON (dynamique)
<Input aria-invalid={!!error} />
```

### 3. `aria-describedby` manquant

```tsx
// ❌ MAUVAIS (pas de lien vers l'erreur)
<Input id="email" />
{error && <div id="email-error">{error}</div>}

// ✅ BON (lien explicite)
<Input
  id="email"
  aria-describedby={error ? "email-error email-help" : "email-help"}
/>
<div id="email-help" className="sr-only">Instructions</div>
{error && <div id="email-error" role="alert">{error}</div>}
```

### 4. Icons sans `aria-hidden`

```tsx
// ❌ MAUVAIS (icon annoncée par lecteur d'écran)
<AlertCircle className="h-4 w-4" />

// ✅ BON (icon purement décorative)
<AlertCircle className="h-4 w-4" aria-hidden="true" />
```

### 5. Pas de texte d'aide

```tsx
// ❌ MAUVAIS (pas d'instructions)
<Label htmlFor="email">Email</Label>
<Input id="email" />

// ✅ BON (aide contextuelle)
<Label htmlFor="email">Email</Label>
<Input id="email" aria-describedby="email-help" />
<div id="email-help" className="sr-only">
  Entrez votre adresse email au format exemple@domaine.com
</div>
```

---

## 📚 Ressources

### Documentation WCAG

- [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html)
- [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion.html)
- [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)

### Outils de Test

- **NVDA** (Windows) : [nvaccess.org](https://www.nvaccess.org/)
- **VoiceOver** (Mac) : `Cmd + F5`
- **WAVE** : [wave.webaim.org](https://wave.webaim.org/)
- **axe DevTools** : Extension navigateur

### Projets Shu-no

- Rapport détaillé : `docs/technique/PHASE2_P2.6_RAPPORT.md`
- Hook validation : `src/hooks/use-form-validation.ts`
- Exemples : `src/pages/UserLogin.tsx`, `UserRegister.tsx`

---

## 🎯 Résumé 1 Minute

**3 Règles d'Or** :

1. **Alert avec ARIA** :

   ```tsx
   <Alert id="error" role="alert" aria-live="assertive">
     {error}
   </Alert>
   ```

2. **Input avec aria-invalid** :

   ```tsx
   <Input aria-invalid={!!error} aria-describedby="error" />
   ```

3. **Texte d'aide sr-only** :
   ```tsx
   <div id="help" className="sr-only">
     Instructions
   </div>
   ```

**Pattern Complet** :

```tsx
{error && <Alert id="err" role="alert" aria-live="assertive">{error}</Alert>}
<Input
  aria-invalid={!!error}
  aria-describedby={error ? "err help" : "help"}
/>
<div id="help" className="sr-only">Aide</div>
```

✅ **WCAG 3.3.1 compliant !**

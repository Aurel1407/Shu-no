# ⚠️ Phase 2 – Plan de Correction Détaillé

## 📊 Informations d'Audit

**Date d'audit:** 29 octobre 2025  
**Version:** Production v1.0  
**Score actuel Phase 1:** 75/100  
**Score cible Phase 2:** 88/100  
**Conformité:** WCAG 2.1 AA

---

## 🎯 Vue d'Ensemble des Écarts

| ID    | Problème                            | Sévérité    | Temps  | Fichiers            | Status |
| ----- | ----------------------------------- | ----------- | ------ | ------------------- | ------ |
| P2.1  | Alt textes insuffisants             | 🔴 MAJEUR   | 30 min | 3 fichiers          | ⏳     |
| P2.2  | Icônes SVG sans aria-hidden         | 🟡 MINEUR   | 1h     | ~15 composants      | ⏳     |
| P2.3  | Éléments interactifs non labellisés | 🔴 CRITIQUE | 2h     | À auditer           | ⏳     |
| P2.4  | Modales/Dialogs                     | 🔴 MAJEUR   | 2-3h   | Tous modals         | ⏳     |
| P2.5  | Tables                              | 🔴 MAJEUR   | 1-2h   | Tables stats        | ⏳     |
| P2.6  | Validation formulaires              | 🔴 MAJEUR   | 2h     | Tous forms          | ⏳     |
| P2.7  | Fil d'Ariane                        | 🟡 MINEUR   | 1h     | Pages multi-niveaux | ⏳     |
| P2.8  | États de chargement                 | 🔴 MAJEUR   | 1h     | 3-4 pages           | ⏳     |
| P2.9  | Listes HTML                         | 🟡 MINEUR   | 1h     | ~20 listes          | ⏳     |
| P2.10 | Couleur seule                       | 🟡 MINEUR   | 30 min | Badges/statuts      | ⏳     |

**Temps total estimé:** 10-15 heures  
**Timeline:** 2-3 semaines

---

## 🔴 P2.1: Alt Textes Insuffisants - MAJEUR

### Critère d'Acceptation

✅ **100% des images non décoratives** ont un alt contextuel  
✅ **Images décoratives** ont `alt=""` ou `aria-hidden="true"`  
✅ **Alt text descriptif** incluant localisation/contexte

### Fichiers à Corriger

#### 1. `src/pages/Booking.tsx:427`

**❌ Code actuel:**

```tsx
<img src={property.imageUrl} alt={property.name} className="w-full h-64 object-cover rounded-lg" />
```

**✅ Correction:**

```tsx
<img
  src={property.imageUrl}
  alt={`${property.name} – hébergement à ${property.location}`}
  className="w-full h-64 object-cover rounded-lg"
/>
```

**Justification:** Ajoute contexte géographique pour utilisateurs malvoyants.

---

#### 2. `src/pages/Payment.tsx:306`

**❌ Code actuel:**

```tsx
<img src={property.imageUrl} alt={property.name} className="h-24 w-24 object-cover rounded" />
```

**✅ Correction:**

```tsx
<img
  src={property.imageUrl}
  alt={`${property.name} – gîte situé à ${property.location}`}
  className="h-24 w-24 object-cover rounded"
/>
```

**Justification:** Renforce contexte pour confirmation de réservation.

---

#### 3. `src/pages/PropertyForm.tsx:629`

**❌ Code actuel:**

```tsx
<img
  src={preview}
  alt={`${index + 1} de la propriété`}
  className="w-full h-32 object-cover rounded"
/>
```

**✅ Correction:**

```tsx
<img
  src={preview}
  alt={`Photo ${index + 1}/${images.length} – ${watch("name") || "nouvelle propriété"}`}
  className="w-full h-32 object-cover rounded"
/>
```

**Justification:** Indique position dans la série + nom propriété.

---

### Script de Vérification

```bash
# Rechercher tous les alt génériques
grep -rn "alt={" src/pages/ src/components/ | grep -E "alt=\{[a-z]+\.(name|title)\}"

# Vérifier images décoratives sans alt="" ou aria-hidden
grep -rn "<img" src/ | grep -v "alt=" | grep -v "aria-hidden"
```

### Checklist

- [ ] Booking.tsx:427 corrigé
- [ ] Payment.tsx:306 corrigé
- [ ] PropertyForm.tsx:629 corrigé
- [ ] Audit complet des autres images
- [ ] Tests visuels + screen reader (NVDA)

---

## 🟡 P2.2: Icônes SVG Sans aria-hidden - MINEUR

### Critère d'Acceptation

✅ **Icônes décoratives:** `aria-hidden="true"`  
✅ **Icônes informatives:** `aria-label` ou titre lié  
✅ **ESLint règle:** jsx-a11y activée

### Pattern de Correction

#### Icône Décorative (avec texte adjacent)

**❌ Avant:**

```tsx
<Button>
  <Calendar className="w-4 h-4 mr-2" />
  Réserver
</Button>
```

**✅ Après:**

```tsx
<Button>
  <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
  Réserver
</Button>
```

**Règle:** Si l'icône est redondante avec le texte → `aria-hidden="true"`

---

#### Icône Informative (sans texte)

**❌ Avant:**

```tsx
<button onClick={handleDelete}>
  <Trash2 className="w-4 h-4" />
</button>
```

**✅ Après:**

```tsx
<button onClick={handleDelete} aria-label="Supprimer la réservation">
  <Trash2 className="w-4 h-4" aria-hidden="true" />
</button>
```

**Règle:** Si l'icône est seule → `aria-label` sur le bouton + `aria-hidden` sur l'icône

---

### Composants Lucide à Auditer

```typescript
// Liste des icônes Lucide utilisées (à vérifier)
import {
  Calendar, // Décoration si avec texte
  MapPin, // Décoration si avec adresse
  Users, // Décoration si avec "X personnes"
  Bed, // Décoration si avec "X chambres"
  Home, // Logo - peut être décoratif
  Search, // Interactif - besoin aria-label
  Filter, // Interactif - besoin aria-label
  X, // Interactif - "Fermer"
  Check, // Décoration si avec "Confirmé"
  AlertCircle, // Alerte - besoin aria-label
  Info, // Info - peut être décoratif
  Star, // Rating - besoin aria-label
  Heart, // Favoris - besoin aria-label
  Share2, // Partager - besoin aria-label
  Trash2, // Supprimer - besoin aria-label
} from "lucide-react";
```

### Script d'Audit

```bash
# Rechercher toutes les icônes Lucide sans aria-hidden ni aria-label
grep -rn "from 'lucide-react'" src/ -A 50 | \
  grep -E "<[A-Z][a-zA-Z]+\s" | \
  grep -v "aria-hidden" | \
  grep -v "aria-label"

# Compter les occurrences
grep -r "lucide-react" src/ | wc -l
```

### Configuration ESLint

**Fichier: `eslint.config.js`**

```javascript
// Ajouter règles jsx-a11y
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // Forcer aria-hidden sur icônes décoratives
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/aria-role": "error",

      // Warning pour images sans alt
      "jsx-a11y/alt-text": [
        "warn",
        {
          elements: ["img", "object", "area", 'input[type="image"]'],
        },
      ],

      // Vérifier accessibilité interactive
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
    },
  },
];
```

### Checklist

- [ ] Audit de tous les imports Lucide
- [ ] Corriger icônes décoratives (aria-hidden)
- [ ] Corriger icônes informatives (aria-label)
- [ ] Installer eslint-plugin-jsx-a11y
- [ ] Configurer règles ESLint
- [ ] Tests avec NVDA (aucune annonce inutile)

---

## 🔴 P2.3: Éléments Interactifs Non Labellisés - CRITIQUE

### Critère d'Acceptation

✅ **0 bouton/lien** sans nom accessible  
✅ **`getComputedAccessibleName() !== ""`** pour tous les interactifs  
✅ **Tests automatisés** avec jest-axe

### Script d'Audit

```bash
# Rechercher onClick sans aria-label ni texte
grep -R "onClick=" src/ | grep -v "aria-label" | grep -v "title=" | grep -v ">.*</"

# Rechercher boutons vides
grep -rn "<button" src/ | grep -E "<button[^>]*>\s*<[^/]" | grep -v "aria-label"

# Rechercher liens vides
grep -rn "<a" src/ | grep -E "<a[^>]*>\s*<[^/]" | grep -v "aria-label"
```

### Patterns de Correction

#### 1. Bouton avec Icône Seule

**❌ Avant:**

```tsx
<button onClick={handleEdit}>
  <Pencil className="w-4 h-4" />
</button>
```

**✅ Après:**

```tsx
<button onClick={handleEdit} aria-label="Modifier la propriété">
  <Pencil className="w-4 h-4" aria-hidden="true" />
</button>
```

---

#### 2. Lien avec Icône Seule

**❌ Avant:**

```tsx
<Link to={`/property/${id}`}>
  <ExternalLink className="w-4 h-4" />
</Link>
```

**✅ Après:**

```tsx
<Link to={`/property/${id}`} aria-label={`Voir détails de ${propertyName}`}>
  <ExternalLink className="w-4 h-4" aria-hidden="true" />
</Link>
```

---

#### 3. Bouton Toggle (ex: Favoris)

**❌ Avant:**

```tsx
<button onClick={toggleFavorite}>{isFavorite ? <Heart fill="red" /> : <Heart />}</button>
```

**✅ Après:**

```tsx
<button
  onClick={toggleFavorite}
  aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
  aria-pressed={isFavorite}
>
  <Heart className="w-4 h-4" fill={isFavorite ? "red" : "none"} aria-hidden="true" />
</button>
```

---

#### 4. Div Cliquable (À ÉVITER - utiliser button)

**❌ Avant:**

```tsx
<div onClick={handleClick} className="cursor-pointer">
  <Settings />
</div>
```

**✅ Après:**

```tsx
<button onClick={handleClick} aria-label="Ouvrir les paramètres" className="cursor-pointer">
  <Settings aria-hidden="true" />
</button>
```

---

### Tests Automatisés avec jest-axe

**Fichier: `src/__tests__/accessibility/interactive-elements.test.tsx`**

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

expect.extend(toHaveNoViolations);

describe('Interactive Elements Accessibility', () => {
  test('All buttons have accessible names', async () => {
    const { container } = render(
      <MemoryRouter>
        <YourComponent />
      </MemoryRouter>
    );

    const results = await axe(container, {
      rules: {
        'button-name': { enabled: true },
        'link-name': { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  test('Interactive elements have correct roles', async () => {
    const { container } = render(<YourComponent />);

    const results = await axe(container, {
      rules: {
        'aria-allowed-role': { enabled: true },
        'aria-required-children': { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });
});
```

### Checklist

- [ ] Audit complet avec scripts grep
- [ ] Corriger tous les boutons sans label
- [ ] Corriger tous les liens sans label
- [ ] Remplacer div cliquables par boutons
- [ ] Setup jest-axe tests
- [ ] Tests NVDA (tous les éléments annoncés)

---

## 🔴 P2.4: Modales/Dialogs - MAJEUR

### Critère d'Acceptation

✅ **`aria-modal="true"`** sur tous les dialogs  
✅ **Focus trap:** Focus reste dans le modal  
✅ **Retour du focus:** Focus revient après fermeture  
✅ **Labellisation:** `aria-labelledby` + `aria-describedby`  
✅ **Fermeture clavier:** Escape key fonctionne

### Solution Recommandée: Radix UI Dialog

**Installation:**

```bash
npm install @radix-ui/react-dialog
```

**Pattern Complet:**

```tsx
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function AccessibleModal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: AccessibleModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />

        {/* Modal Content */}
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     bg-white rounded-lg shadow-xl p-6 w-full max-w-md
                     focus:outline-none focus:ring-2 focus:ring-bleu-profond"
          aria-describedby={description ? "modal-description" : undefined}
        >
          {/* Title */}
          <Dialog.Title className="text-lg font-semibold mb-4">{title}</Dialog.Title>

          {/* Optional Description */}
          {description && (
            <Dialog.Description id="modal-description" className="text-sm text-gray-600 mb-4">
              {description}
            </Dialog.Description>
          )}

          {/* Content */}
          <div className="mb-6">{children}</div>

          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100"
              aria-label="Fermer la fenêtre"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Migrations des Modales Existantes

#### Exemple: Confirmation Dialog

**❌ Avant (Modal custom non accessible):**

```tsx
{
  showModal && (
    <div className="fixed inset-0 bg-black/50">
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6">
        <h2>Confirmer la suppression</h2>
        <p>Êtes-vous sûr ?</p>
        <button onClick={onConfirm}>Oui</button>
        <button onClick={onCancel}>Non</button>
      </div>
    </div>
  );
}
```

**✅ Après (Radix Dialog accessible):**

```tsx
<AccessibleModal
  open={showModal}
  onOpenChange={setShowModal}
  title="Confirmer la suppression"
  description="Cette action est irréversible."
>
  <div className="flex gap-4">
    <Button onClick={onConfirm} variant="destructive">
      Confirmer
    </Button>
    <Button onClick={onCancel} variant="outline">
      Annuler
    </Button>
  </div>
</AccessibleModal>
```

### Tests Focus Trap

**Fichier: `src/__tests__/accessibility/modal-focus.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibleModal } from '@/components/AccessibleModal';

describe('Modal Focus Management', () => {
  test('Focus trap works correctly', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <button>Outside Button</button>
        <AccessibleModal open={true} title="Test Modal">
          <button>First Button</button>
          <button>Second Button</button>
        </AccessibleModal>
      </div>
    );

    // Focus should start inside modal
    const firstButton = screen.getByRole('button', { name: 'First Button' });
    expect(firstButton).toHaveFocus();

    // Tab should cycle within modal
    await user.tab();
    const secondButton = screen.getByRole('button', { name: 'Second Button' });
    expect(secondButton).toHaveFocus();

    // Tab should not escape modal
    await user.tab();
    expect(document.activeElement).not.toBe(screen.getByText('Outside Button'));
  });

  test('Focus returns after closing', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <div>
        <button id="trigger">Open Modal</button>
        <AccessibleModal open={false} title="Test" />
      </div>
    );

    const trigger = screen.getByRole('button', { name: 'Open Modal' });
    trigger.focus();
    expect(trigger).toHaveFocus();

    // Open modal
    rerender(
      <div>
        <button id="trigger">Open Modal</button>
        <AccessibleModal open={true} title="Test">
          <button>Close</button>
        </AccessibleModal>
      </div>
    );

    // Close modal
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    await user.click(closeBtn);

    // Focus should return to trigger
    expect(trigger).toHaveFocus();
  });

  test('Escape key closes modal', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <AccessibleModal open={true} onOpenChange={onClose} title="Test">
        Content
      </AccessibleModal>
    );

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledWith(false);
  });
});
```

### Checklist

- [ ] Installer @radix-ui/react-dialog
- [ ] Créer composant AccessibleModal réutilisable
- [ ] Migrer tous les modaux existants
- [ ] Tests focus trap automatisés
- [ ] Tests manuels clavier (Tab, Escape)
- [ ] Tests NVDA (annonces correctes)

---

## 🔴 P2.5: Tables - MAJEUR

### Critère d'Acceptation

✅ **Caption présent** sur toutes les tables  
✅ **Structure:** `<thead>`, `<tbody>`, `<tfoot>` si applicable  
✅ **Headers:** `<th scope="col/row">`  
✅ **Associations:** Data cells liées aux headers

### Pattern de Table Accessible

```tsx
interface AccessibleTableProps {
  caption: string;
  captionSide?: "top" | "bottom";
  headers: string[];
  rows: Array<Record<string, React.ReactNode>>;
  sortable?: boolean;
}

export function AccessibleTable({
  caption,
  captionSide = "top",
  headers,
  rows,
  sortable = false,
}: AccessibleTableProps) {
  return (
    <table className="w-full border-collapse">
      {/* Caption - Description de la table */}
      <caption
        className={`text-sm font-medium mb-2 ${
          captionSide === "bottom" ? "caption-bottom" : "caption-top"
        }`}
      >
        {caption}
      </caption>

      {/* Headers */}
      <thead className="bg-gray-100">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              scope="col"
              className="px-4 py-2 text-left font-semibold"
              {...(sortable && {
                "aria-sort": "none",
                role: "columnheader",
              })}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>

      {/* Body */}
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="border-b hover:bg-gray-50">
            {headers.map((header, cellIndex) => (
              <td key={cellIndex} className="px-4 py-2" headers={`col-${cellIndex}`}>
                {row[header]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Exemple: Table des Réservations

**❌ Avant (div mal structurée):**

```tsx
<div className="space-y-2">
  <div className="flex gap-4 font-bold">
    <div>Date</div>
    <div>Propriété</div>
    <div>Statut</div>
    <div>Actions</div>
  </div>
  {reservations.map((r) => (
    <div className="flex gap-4" key={r.id}>
      <div>{r.date}</div>
      <div>{r.property}</div>
      <div>{r.status}</div>
      <div>
        <button>Voir</button>
      </div>
    </div>
  ))}
</div>
```

**✅ Après (table accessible):**

```tsx
<AccessibleTable
  caption="Liste des réservations actives"
  headers={["Date", "Propriété", "Statut", "Actions"]}
  rows={reservations.map((r) => ({
    Date: formatDate(r.date),
    Propriété: r.propertyName,
    Statut: (
      <Badge variant={getStatusVariant(r.status)} aria-label={`Statut: ${r.status}`}>
        {getStatusIcon(r.status)}
        {r.status}
      </Badge>
    ),
    Actions: (
      <Button size="sm" aria-label={`Voir détails de la réservation du ${formatDate(r.date)}`}>
        Voir
      </Button>
    ),
  }))}
/>
```

### Exemple: Table avec Row Headers

```tsx
<table>
  <caption>Statistiques mensuelles de revenus</caption>
  <thead>
    <tr>
      <th scope="col">Mois</th>
      <th scope="col">Réservations</th>
      <th scope="col">Revenus</th>
      <th scope="col">Taux d'occupation</th>
    </tr>
  </thead>
  <tbody>
    {stats.map((month) => (
      <tr key={month.id}>
        <th scope="row">{month.name}</th>
        <td>{month.bookings}</td>
        <td>{formatCurrency(month.revenue)}</td>
        <td>{month.occupancyRate}%</td>
      </tr>
    ))}
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">Total</th>
      <td>{totalBookings}</td>
      <td>{formatCurrency(totalRevenue)}</td>
      <td>{averageOccupancy}%</td>
    </tr>
  </tfoot>
</table>
```

### Checklist

- [ ] Identifier toutes les tables/listes tabulaires
- [ ] Créer composant AccessibleTable
- [ ] Migrer tables de réservations
- [ ] Migrer tables de statistiques
- [ ] Ajouter captions descriptifs
- [ ] Tests NVDA (navigation par cellule)

---

## 🔴 P2.6: Validation Formulaires - MAJEUR

### Critère d'Acceptation

✅ **`aria-invalid`** = true/false selon état  
✅ **`aria-describedby`** lie erreur au champ  
✅ **`role="alert"`** sur messages d'erreur  
✅ **Annonces dynamiques** via aria-live

### Pattern Complet avec React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});

type FormData = z.infer<typeof schema>;

export function AccessibleForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Email Field */}
      <div className="mb-4">
        <Label htmlFor="email">
          Email <span aria-label="requis">*</span>
        </Label>

        <Input
          id="email"
          type="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : "email-help"}
          {...register("email")}
        />

        {/* Help Text (always present) */}
        <div id="email-help" className="text-sm text-gray-600 mt-1">
          Nous ne partagerons jamais votre email.
        </div>

        {/* Error Message (conditional) */}
        {errors.email && (
          <div
            id="email-error"
            role="alert"
            className="text-sm text-red-600 mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            <span>{errors.email.message}</span>
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="mb-4">
        <Label htmlFor="password">
          Mot de passe <span className="sr-only">requis</span>*
        </Label>

        <Input
          id="password"
          type="password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : "password-help"}
          aria-required="true"
          {...register("password")}
        />

        <div id="password-help" className="text-sm text-gray-600 mt-1">
          Minimum 8 caractères avec lettres et chiffres.
        </div>

        {errors.password && (
          <div
            id="password-error"
            role="alert"
            aria-live="assertive"
            className="text-sm text-red-600 mt-1"
          >
            {errors.password.message}
          </div>
        )}
      </div>

      {/* Submit */}
      <Button type="submit">Se connecter</Button>
    </form>
  );
}
```

### Pattern: Validation en Temps Réel

```tsx
import { useState } from "react";

export function RealTimeValidation() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validate = (input: string) => {
    if (input.length < 3) {
      setError("Minimum 3 caractères");
    } else if (!/^[a-zA-Z]+$/.test(input)) {
      setError("Lettres uniquement");
    } else {
      setError(null);
    }
  };

  return (
    <div>
      <Label htmlFor="name">Nom</Label>

      <Input
        id="name"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          validate(e.target.value);
        }}
        aria-invalid={!!error}
        aria-describedby={error ? "name-error" : "name-help"}
      />

      {/* Live region for real-time announcements */}
      <div
        id="name-validation"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {error || "Saisie valide"}
      </div>

      {/* Visual error */}
      {error && (
        <div id="name-error" className="text-red-600 text-sm mt-1">
          {error}
        </div>
      )}
    </div>
  );
}
```

### Migrations des Formulaires

#### 1. UserRegister.tsx

- [ ] Ajouter aria-invalid sur tous les champs
- [ ] Lier aria-describedby aux erreurs
- [ ] role="alert" sur messages d'erreur
- [ ] Tester avec NVDA

#### 2. UserLogin.tsx

- [ ] Ajouter aria-invalid
- [ ] aria-describedby pour erreurs
- [ ] Feedback visuel + annonces

#### 3. PropertyForm.tsx

- [ ] Groupes de champs avec fieldset/legend
- [ ] aria-invalid sur champs requis
- [ ] Validation contextuelle

#### 4. ReservationSummary.tsx

- [ ] Date picker accessible
- [ ] Validation dates cohérentes
- [ ] Messages d'erreur clairs

### Checklist

- [ ] Audit de tous les formulaires
- [ ] Appliquer pattern aria-invalid + describedby
- [ ] Tests validation avec NVDA
- [ ] Tests clavier (Tab, Enter, Escape)
- [ ] Documentation patterns

---

## 🟡 P2.7: Fil d'Ariane - MINEUR

### Critère d'Acceptation

✅ **`<nav aria-label="Fil d'Ariane">`**  
✅ **Liste structurée** `<ol>` avec `<li>`  
✅ **`aria-current="page"`** sur page actuelle  
✅ **Séparateurs visuels** accessible via CSS

### Pattern Complet

```tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {/* Link ou Text */}
              {item.href && !isLast ? (
                <Link to={item.href} className="text-bleu-profond hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span
                  {...(isLast && { "aria-current": "page" })}
                  className={isLast ? "font-semibold" : ""}
                >
                  {item.label}
                </span>
              )}

              {/* Separator */}
              {!isLast && (
                <span aria-hidden="true" className="text-gray-400">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

### Utilisation dans les Pages

```tsx
// Page: Property Details
<Breadcrumbs
  items={[
    { label: 'Accueil', href: '/' },
    { label: 'Propriétés', href: '/properties' },
    { label: property.name }, // Current page - no href
  ]}
/>

// Page: User Account
<Breadcrumbs
  items={[
    { label: 'Accueil', href: '/' },
    { label: 'Mon compte' },
  ]}
/>

// Page: Booking Confirmation
<Breadcrumbs
  items={[
    { label: 'Accueil', href: '/' },
    { label: 'Propriétés', href: '/properties' },
    { label: property.name, href: `/property/${property.id}` },
    { label: 'Réservation' },
  ]}
/>
```

### Checklist

- [ ] Créer composant Breadcrumbs
- [ ] Ajouter sur pages multi-niveaux
- [ ] Tests NVDA (navigation cohérente)
- [ ] Tests visuels responsive

---

## 🔴 P2.8: États de Chargement - MAJEUR

### Critère d'Acceptation

✅ **`role="status"`** sur indicateurs de chargement  
✅ **`aria-live="polite"`** pour annonces non-urgentes  
✅ **Texte sr-only** "Chargement en cours..."  
✅ **Loading skeleton** accessible

### Pattern: Loading State

```tsx
interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({
  message = "Chargement en cours...",
  size = "md",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="flex flex-col items-center justify-center p-8"
    >
      {/* Visual Spinner */}
      <div
        className={`animate-spin rounded-full border-4 border-gray-200 border-t-bleu-profond ${
          size === "sm" ? "w-8 h-8" : size === "md" ? "w-12 h-12" : "w-16 h-16"
        }`}
        aria-hidden="true"
      />

      {/* Screen Reader Text */}
      <p className="sr-only">{message}</p>

      {/* Optional Visible Text */}
      <p className="mt-4 text-sm text-gray-600">{message}</p>
    </div>
  );
}
```

### Pattern: Skeleton Loading

```tsx
export function PropertyCardSkeleton() {
  return (
    <div role="status" aria-label="Chargement des propriétés" className="animate-pulse">
      <div className="bg-gray-200 h-48 rounded-lg mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />

      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}
```

### Migrations des Pages

#### 1. RevenueStats.tsx

**❌ Avant:**

```tsx
{
  isLoading && <Spinner />;
}
{
  stats && <StatsDisplay data={stats} />;
}
```

**✅ Après:**

```tsx
{
  isLoading && <LoadingState message="Chargement des statistiques de revenus" />;
}
{
  stats && <StatsDisplay data={stats} />;
}
```

---

#### 2. UserAccount.tsx

**❌ Avant:**

```tsx
{
  loading ? <div>Loading...</div> : <AccountDetails />;
}
```

**✅ Après:**

```tsx
{
  loading ? <LoadingState message="Chargement des informations du compte" /> : <AccountDetails />;
}
```

---

#### 3. Booking.tsx

**❌ Avant:**

```tsx
{
  !property && <Spinner />;
}
```

**✅ Après:**

```tsx
{
  !property && <LoadingState message={`Chargement des détails de la propriété`} size="lg" />;
}
```

### Pattern: Async Button

```tsx
interface AsyncButtonProps extends ButtonProps {
  loading: boolean;
  loadingText?: string;
}

export function AsyncButton({
  loading,
  loadingText = "Chargement...",
  children,
  ...props
}: AsyncButtonProps) {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
          <span>{loadingText}</span>
          <span className="sr-only" role="status" aria-live="polite">
            {loadingText}
          </span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
```

### Checklist

- [ ] Créer LoadingState component
- [ ] Créer PropertyCardSkeleton
- [ ] Migrer RevenueStats
- [ ] Migrer UserAccount
- [ ] Migrer Booking
- [ ] Tests NVDA (annonces de chargement)

---

## 🟡 P2.9: Listes HTML - MINEUR

### Critère d'Acceptation

✅ **`<ul>` ou `<ol>`** pour ensembles d'items  
✅ **`<li>`** pour chaque item  
✅ **Pas de div empilées** sans structure sémantique

### Pattern: Liste Simple

**❌ Avant:**

```tsx
<div className="space-y-2">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

**✅ Après:**

```tsx
<ul className="space-y-2 list-none">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

### Pattern: Liste de Navigation

**❌ Avant:**

```tsx
<div className="flex gap-4">
  <a href="/home">Accueil</a>
  <a href="/about">À propos</a>
  <a href="/contact">Contact</a>
</div>
```

**✅ Après:**

```tsx
<nav aria-label="Navigation principale">
  <ul className="flex gap-4 list-none">
    <li>
      <a href="/home">Accueil</a>
    </li>
    <li>
      <a href="/about">À propos</a>
    </li>
    <li>
      <a href="/contact">Contact</a>
    </li>
  </ul>
</nav>
```

### Pattern: Liste Numérotée (Étapes)

```tsx
<ol className="space-y-4 list-decimal list-inside">
  <li>
    <strong>Sélectionnez vos dates</strong>
    <p className="text-sm text-gray-600">Choisissez votre période de séjour</p>
  </li>
  <li>
    <strong>Remplissez vos informations</strong>
    <p className="text-sm text-gray-600">Coordonnées et préférences</p>
  </li>
  <li>
    <strong>Confirmez votre réservation</strong>
    <p className="text-sm text-gray-600">Paiement sécurisé</p>
  </li>
</ol>
```

### Script d'Audit

```bash
# Rechercher div.space-y sans ul/ol
grep -rn "space-y" src/ | grep "div" | head -20

# Rechercher listes potentielles
grep -rn "map.*=>" src/ | grep -v "<ul>" | grep -v "<ol>"
```

### Checklist

- [ ] Audit des div.space-y
- [ ] Convertir en listes sémantiques
- [ ] Tests NVDA (annonce "liste X éléments")

---

## 🟡 P2.10: Couleur Seule - MINEUR

### Critère d'Acceptation

✅ **Icônes + texte** pour statuts  
✅ **Patterns visuels** en plus de la couleur  
✅ **Labels explicites** dans le DOM

### Pattern: Badge avec Icône

**❌ Avant:**

```tsx
<Badge variant="destructive">Annulée</Badge>
<Badge variant="success">Confirmée</Badge>
<Badge variant="warning">En attente</Badge>
```

**✅ Après:**

```tsx
import { X, Check, Clock } from 'lucide-react';

// Annulée
<Badge variant="destructive">
  <X className="w-3 h-3 mr-1" aria-hidden="true" />
  Annulée
</Badge>

// Confirmée
<Badge variant="success">
  <Check className="w-3 h-3 mr-1" aria-hidden="true" />
  Confirmée
</Badge>

// En attente
<Badge variant="warning">
  <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
  En attente
</Badge>
```

### Pattern: Composant StatusBadge

```tsx
import { X, Check, Clock, AlertTriangle } from "lucide-react";

type Status = "confirmed" | "pending" | "cancelled" | "expired";

interface StatusBadgeProps {
  status: Status;
}

const STATUS_CONFIG = {
  confirmed: {
    icon: Check,
    label: "Confirmée",
    variant: "success" as const,
  },
  pending: {
    icon: Clock,
    label: "En attente",
    variant: "warning" as const,
  },
  cancelled: {
    icon: X,
    label: "Annulée",
    variant: "destructive" as const,
  },
  expired: {
    icon: AlertTriangle,
    label: "Expirée",
    variant: "secondary" as const,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} aria-label={`Statut de la réservation: ${config.label}`}>
      <Icon className="w-3 h-3 mr-1" aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
```

### Pattern: Graph avec Légende

```tsx
export function RevenueChart({ data }: ChartProps) {
  return (
    <div>
      <h3>Revenus mensuels</h3>

      {/* Visual Chart */}
      <div className="relative h-64" aria-hidden="true">
        {/* Chart rendered here */}
      </div>

      {/* Accessible Table Alternative */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-bleu-profond">
          Afficher les données en tableau
        </summary>

        <table className="mt-2 w-full">
          <caption className="sr-only">Détails des revenus mensuels</caption>
          <thead>
            <tr>
              <th scope="col">Mois</th>
              <th scope="col">Revenus (€)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.month}>
                <th scope="row">{item.month}</th>
                <td>{item.revenue}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
```

### Checklist

- [ ] Audit de tous les badges de statut
- [ ] Ajouter icônes à tous les statuts
- [ ] Créer StatusBadge component
- [ ] Tests daltonisme (Chrome DevTools)
- [ ] Tests NVDA (statuts annoncés)

---

## 📊 Timeline de Correction

### Semaine 1 (8-10h)

**Jour 1-2: Critiques**

- [ ] P2.3: Éléments interactifs (2h)
- [ ] P2.4: Modales (2-3h)
- [ ] P2.6: Validation formulaires (2h)

**Jour 3-4: Majeurs**

- [ ] P2.1: Alt textes (30 min)
- [ ] P2.5: Tables (1-2h)
- [ ] P2.8: Chargement (1h)

**Jour 5: Tests**

- [ ] Jest-axe setup (1h)
- [ ] Tests clavier toutes pages (1h)
- [ ] Tests NVDA basiques (1h)

### Semaine 2 (4-6h)

**Jour 1-2: Mineurs**

- [ ] P2.2: Icônes (1h)
- [ ] P2.7: Breadcrumbs (1h)
- [ ] P2.9: Listes (1h)
- [ ] P2.10: Couleurs (30 min)

**Jour 3-4: Tests & Documentation**

- [ ] Tests NVDA complets (2h)
- [ ] Tests VoiceOver (Mac) (1h)
- [ ] Documentation mise à jour (1h)

**Jour 5: Validation**

- [ ] Lighthouse audit (30 min)
- [ ] Rapport final (30 min)
- [ ] Code review (1h)

### Semaine 3 (Buffer)

**Corrections & Déploiement**

- [ ] Fixes post-review (2-3h)
- [ ] Tests finaux (1-2h)
- [ ] Déploiement production (1h)
- [ ] Monitoring post-deploy (1h)

---

## ✅ Critères de Validation Finale

### Tests Automatisés

```bash
# Jest-axe: 0 violations
npm test -- --testPathPattern="a11y"

# Lighthouse: Score 88+
lighthouse http://localhost:5173 --view
```

### Tests Manuels

- [ ] **Clavier:** Toutes les pages navigables au Tab
- [ ] **NVDA:** Tous les contenus annoncés correctement
- [ ] **VoiceOver:** Navigation cohérente sur Mac
- [ ] **Contraste:** Tous ratios 4.5:1+ (WebAIM checker)
- [ ] **Forms:** Validation accessible sur tous formulaires
- [ ] **Modals:** Focus trap + retour du focus OK
- [ ] **Tables:** Navigation par cellule fonctionnelle
- [ ] **Loading:** Annonces de chargement présentes

### Régressions Phase 1

- [ ] Skip links toujours fonctionnels
- [ ] Landmarks toujours présents
- [ ] aria-live region toujours accessible
- [ ] Contrastes non dégradés
- [ ] prefers-reduced-motion toujours respecté

---

## 📚 Ressources & Support

### Documentation

- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [React Accessibility](https://react.dev/learn/accessibility)
- [jest-axe](https://github.com/nickcolley/jest-axe)

### Outils

- **Screen Readers:** NVDA (Windows), VoiceOver (Mac)
- **Extensions:** axe DevTools, WAVE, Lighthouse
- **Validation:** WebAIM Contrast Checker, Color Oracle

### Contacts

- **Lead Dev:** Questions techniques
- **QA:** Tests et validation
- **Designer:** Ajustements visuels si nécessaire

---

**Document créé:** 30 octobre 2025  
**Statut:** ⏳ EN ATTENTE DE CORRECTION  
**Prochaine mise à jour:** Après corrections Semaine 1

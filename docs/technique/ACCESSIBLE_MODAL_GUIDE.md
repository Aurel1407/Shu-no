# 📚 Guide d'Utilisation - AccessibleModal

## Vue d'Ensemble

Le composant `AccessibleModal` est une solution complète pour les modales accessibles basée sur **Radix UI Dialog**.

### Fonctionnalités Accessibilité ✨

- ✅ **Focus trap automatique** - Le focus reste dans le modal
- ✅ **Retour du focus** - Focus revient à l'élément déclencheur après fermeture
- ✅ **aria-modal="true"** - Automatiquement ajouté par Radix
- ✅ **Fermeture Escape** - Configurable
- ✅ **ARIA labelling** - aria-labelledby et aria-describedby
- ✅ **Navigation clavier** - Tab, Shift+Tab, Escape
- ✅ **Backdrop accessible** - Clic pour fermer (configurable)

---

## 🎯 Utilisation de Base

### 1. Modal Simple

```tsx
import { useState } from "react";
import { AccessibleModal } from "@/components/AccessibleModal";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Ouvrir le modal</button>

      <AccessibleModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Informations importantes"
        description="Veuillez lire attentivement ces informations."
      >
        <div className="space-y-4">
          <p>Contenu du modal...</p>
          <button onClick={() => setIsOpen(false)}>Fermer</button>
        </div>
      </AccessibleModal>
    </>
  );
}
```

---

### 2. Modal de Confirmation

```tsx
import { ConfirmationModal } from "@/components/AccessibleModal";

function DeleteButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    // Logique de suppression
    await deleteItem();
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Supprimer</button>

      <ConfirmationModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}
```

---

## 📖 API Référence

### AccessibleModal Props

| Prop                   | Type                           | Défaut  | Description                                |
| ---------------------- | ------------------------------ | ------- | ------------------------------------------ |
| `open`                 | `boolean`                      | -       | **Requis.** État ouvert/fermé du modal     |
| `onOpenChange`         | `(open: boolean) => void`      | -       | **Requis.** Callback changement d'état     |
| `title`                | `string`                       | -       | **Requis.** Titre du modal (accessibilité) |
| `description`          | `string`                       | -       | Optionnel. Description du modal            |
| `children`             | `ReactNode`                    | -       | Contenu du modal                           |
| `size`                 | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | Taille du modal                            |
| `disableBackdropClose` | `boolean`                      | `false` | Désactiver fermeture au clic backdrop      |
| `disableEscapeClose`   | `boolean`                      | `false` | Désactiver fermeture avec Escape           |
| `className`            | `string`                       | `''`    | Classes CSS supplémentaires                |

### ConfirmationModal Props

| Prop                   | Type                          | Défaut        | Description                            |
| ---------------------- | ----------------------------- | ------------- | -------------------------------------- |
| Tous les props de base | -                             | -             | Hérite de `AccessibleModal`            |
| `onConfirm`            | `() => void \| Promise<void>` | -             | **Requis.** Action à confirmer         |
| `confirmLabel`         | `string`                      | `'Confirmer'` | Texte bouton confirmation              |
| `cancelLabel`          | `string`                      | `'Annuler'`   | Texte bouton annulation                |
| `variant`              | `'default' \| 'destructive'`  | `'default'`   | Style du bouton confirmation           |
| `loading`              | `boolean`                     | `false`       | État de chargement (désactive boutons) |

---

## 🎨 Exemples Avancés

### 3. Modal avec Formulaire

```tsx
function EditPropertyModal({ property, open, onOpenChange }) {
  const [formData, setFormData] = useState(property);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProperty(formData);
    onOpenChange(false);
  };

  return (
    <AccessibleModal
      open={open}
      onOpenChange={onOpenChange}
      title="Modifier la propriété"
      description="Mettez à jour les informations de la propriété."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name">Nom</label>
          <input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={() => onOpenChange(false)}>
            Annuler
          </button>
        </div>
      </form>
    </AccessibleModal>
  );
}
```

---

### 4. Modal avec Actions Multiples

```tsx
function PropertyActionsModal({ property, open, onOpenChange }) {
  const [action, setAction] = useState<"edit" | "delete" | null>(null);

  return (
    <AccessibleModal
      open={open}
      onOpenChange={onOpenChange}
      title="Actions sur la propriété"
      description={`Que voulez-vous faire avec ${property.name} ?`}
    >
      <div className="space-y-3">
        <button
          onClick={() => setAction("edit")}
          className="w-full text-left p-3 hover:bg-accent rounded-md"
        >
          ✏️ Modifier
        </button>

        <button
          onClick={() => setAction("delete")}
          className="w-full text-left p-3 hover:bg-accent rounded-md text-destructive"
        >
          🗑️ Supprimer
        </button>

        <button
          onClick={() => onOpenChange(false)}
          className="w-full text-left p-3 hover:bg-accent rounded-md"
        >
          ❌ Annuler
        </button>
      </div>

      {/* Sous-modals pour confirmation */}
      {action === "delete" && (
        <ConfirmationModal
          open={true}
          onOpenChange={(open) => !open && setAction(null)}
          title="Supprimer la propriété"
          description="Cette action est irréversible."
          onConfirm={async () => {
            await deleteProperty(property.id);
            onOpenChange(false);
          }}
          variant="destructive"
        />
      )}
    </AccessibleModal>
  );
}
```

---

### 5. Modal avec État de Chargement

```tsx
function SubmitModal({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await submitData();
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccessibleModal
      open={open}
      onOpenChange={onOpenChange}
      title="Envoyer les données"
      disableEscapeClose={loading}
      disableBackdropClose={loading}
    >
      <div className="space-y-4">
        <p>Confirmez l'envoi des données.</p>

        {error && (
          <div role="alert" className="text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Envoi en cours..." : "Envoyer"}
          </button>

          <button onClick={() => onOpenChange(false)} disabled={loading} className="flex-1">
            Annuler
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
}
```

---

### 6. Modal Non-Fermable (Important)

```tsx
function CriticalUpdateModal({ open }) {
  return (
    <AccessibleModal
      open={open}
      onOpenChange={() => {}} // Pas de fermeture
      title="Mise à jour critique requise"
      description="Votre application doit être mise à jour avant de continuer."
      disableEscapeClose={true}
      disableBackdropClose={true}
    >
      <div className="space-y-4">
        <p>Une mise à jour critique est disponible.</p>
        <button onClick={() => window.location.reload()}>Mettre à jour maintenant</button>
      </div>
    </AccessibleModal>
  );
}
```

---

## 🧪 Tests

### Test de Base

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccessibleModal } from "@/components/AccessibleModal";

it("opens and closes modal", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();

  render(
    <AccessibleModal open={true} onOpenChange={onOpenChange} title="Test">
      <p>Content</p>
    </AccessibleModal>
  );

  // Modal est visible
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  // Fermeture avec bouton
  await user.click(screen.getByLabelText(/fermer/i));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});
```

### Test Navigation Clavier

```tsx
it("handles keyboard navigation", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();

  render(
    <AccessibleModal open={true} onOpenChange={onOpenChange} title="Test">
      <button>Action 1</button>
      <button>Action 2</button>
    </AccessibleModal>
  );

  // Tab cycle dans le modal
  await user.tab();
  expect(screen.getByText("Action 1")).toHaveFocus();

  await user.tab();
  expect(screen.getByText("Action 2")).toHaveFocus();

  // Escape ferme le modal
  await user.keyboard("{Escape}");
  expect(onOpenChange).toHaveBeenCalledWith(false);
});
```

---

## ♿ Tests Accessibilité

### Checklist Manuel

- [ ] **Focus trap:** Tab ne sort pas du modal
- [ ] **Retour focus:** Focus revient à l'élément déclencheur après fermeture
- [ ] **Screen reader:** Titre annoncé à l'ouverture (NVDA/VoiceOver)
- [ ] **Escape:** Ferme le modal (sauf si désactivé)
- [ ] **Backdrop:** Clic ferme le modal (sauf si désactivé)
- [ ] **ARIA:** aria-labelledby et aria-describedby présents

### Tests Automatisés (jest-axe)

```tsx
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

it("should have no accessibility violations", async () => {
  const { container } = render(
    <AccessibleModal
      open={true}
      onOpenChange={() => {}}
      title="Test Modal"
      description="Test description"
    >
      <button>Action</button>
    </AccessibleModal>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 🎨 Personnalisation

### Styles Personnalisés

```tsx
<AccessibleModal
  open={true}
  onOpenChange={setOpen}
  title="Custom Style"
  className="bg-gradient-to-br from-blue-500 to-purple-600 text-white"
>
  <p>Contenu stylisé...</p>
</AccessibleModal>
```

### Animation Personnalisée

Modifier directement dans `AccessibleModal.tsx` :

```tsx
// Remplacer les classes Tailwind animate-in
className="
  ...
  animate-in fade-in-0 zoom-in-95 duration-200
  ...
"

// Par des animations custom
className="
  ...
  custom-modal-enter
  ...
"
```

---

## 🚀 Migration depuis Modal Custom

### Avant (Modal non accessible)

```tsx
{
  showModal && (
    <div className="fixed inset-0 bg-black/50" onClick={onClose}>
      <div className="bg-white p-6 rounded">
        <h2>Titre</h2>
        <p>Contenu</p>
        <button onClick={onClose}>X</button>
      </div>
    </div>
  );
}
```

### Après (AccessibleModal)

```tsx
<AccessibleModal open={showModal} onOpenChange={setShowModal} title="Titre">
  <p>Contenu</p>
</AccessibleModal>
```

**Avantages:**

- ✅ Focus trap automatique
- ✅ ARIA attributes corrects
- ✅ Navigation clavier
- ✅ Retour du focus
- ✅ Screen reader compatible
- ✅ Moins de code

---

## 📚 Ressources

- [Radix UI Dialog Documentation](https://www.radix-ui.com/primitives/docs/components/dialog)
- [WCAG 2.1 Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [MDN: dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)

---

## 🐛 Troubleshooting

### Le modal ne s'ouvre pas

**Solution:** Vérifier que `open={true}` et que Radix UI Dialog est installé.

```bash
npm install @radix-ui/react-dialog
```

### Le focus ne revient pas après fermeture

**Solution:** Radix gère automatiquement le retour du focus. Vérifier que l'élément déclencheur est toujours dans le DOM.

### Erreur "Portal cannot be rendered"

**Solution:** S'assurer que le composant parent n'utilise pas `display: none`. Utiliser `open` prop à la place.

### Le backdrop ne ferme pas le modal

**Solution:** Vérifier `disableBackdropClose={false}` (défaut).

---

**Document créé:** 30 octobre 2025  
**Version:** 1.0  
**Composant:** AccessibleModal  
**Conformité:** WCAG 2.1 AA ✅

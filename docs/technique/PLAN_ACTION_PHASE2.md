# Plan d'Action Phase 2 - Accessibilité

## 📋 Vue d'ensemble

**Objectif:** Passer de 75/100 à 88/100 (WCAG 2.1 AA)  
**Durée estimée:** 10-15 heures  
**Priorité:** Haute  
**Timeline:** 2-3 semaines

---

## Sprint 1: Corrections Critiques (Jour 1-3)

### Correction 1: Alt Textes Insuffisants

**Fichier:** `src/pages/Booking.tsx`  
**Ligne:** 427  
**Temps estimé:** 15 min

#### Avant:

```tsx
<img src={property.image} alt={property.name} className="w-full h-48 object-cover rounded-lg" />
```

#### Après:

```tsx
<img
  src={property.image}
  alt={`${property.name} - Vue d'ensemble du gîte situé à ${property.location}`}
  className="w-full h-48 object-cover rounded-lg"
/>
```

#### Test:

```bash
# Vérifier alt text avec DevTools
# Alt text doit être complet et contextuel
```

---

### Correction 2: Alt Textes Payment Page

**Fichier:** `src/pages/Payment.tsx`  
**Ligne:** 306  
**Temps estimé:** 15 min

#### Avant:

```tsx
<img src={property.image} alt={property.name} />
```

#### Après:

```tsx
<img
  src={property.image}
  alt={`${property.name} - Propriété à ${property.location} - Résumé de la réservation`}
/>
```

---

### Correction 3: Alt Textes PropertyForm

**Fichier:** `src/pages/PropertyForm.tsx`  
**Ligne:** 629  
**Temps estimé:** 20 min

#### Avant:

```tsx
<img src={imageUrl} alt={`${index + 1} de la propriété`} />
```

#### Après:

```tsx
<img
  src={imageUrl}
  alt={`Photo ${index + 1} de ${images.length} pour ${propertyName} - ${propertyLocation}`}
/>
```

---

### Correction 4: Éléments Interactifs Non-Labellisés

**Sévérité:** CRITIQUE  
**Temps estimé:** 1-2 heures

#### Audit (chercher tous les cas):

```bash
# Terminal PowerShell
Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" -File |
  ForEach-Object {
    Select-String -Path $_.FullName -Pattern "onClick|onMouseDown" |
    Where-Object { $_ -notmatch "aria-label|title" }
  }
```

#### Actions:

1. **Boutons sans aria-label:**

   ```tsx
   // ❌ À corriger
   <button onClick={...}>
     <Plus />
   </button>

   // ✅ Correction
   <button onClick={...} aria-label="Ajouter une image">
     <Plus />
   </button>
   ```

2. **Icônes cliquables:**

   ```tsx
   // ❌ À corriger
   <div onClick={handleEdit}>
     <Edit />
   </div>

   // ✅ Correction
   <button
     onClick={handleEdit}
     aria-label="Éditer cette propriété"
     className="p-2 hover:bg-gray-100 rounded"
   >
     <Edit aria-hidden="true" />
   </button>
   ```

3. **Listes interactives:**
   ```tsx
   // ✅ Vérifier que chaque élément a:
   - aria-label ou contenu textuel
   - role appropriate (button, link, etc.)
   - handlers clavier (onKeyDown)
   ```

---

### Correction 5: Icônes SVG Sans aria-hidden

**Fichier:** Tous les composants avec Lucide  
**Temps estimé:** 1 heure

#### Audit:

```bash
# Chercher tous les <LucideIcon /> sans aria-hidden
grep -r "<[A-Z][a-z]*Icon\|<[A-Z][a-z]*\s" src/ --include="*.tsx" |
  grep -v "aria-hidden"
```

#### Pattern à appliquer:

```tsx
// Pour icônes décoratives (accompagnent du texte):
<Edit aria-hidden="true" />

// Pour icônes seules (buttons/links):
<button aria-label="Éditer">
  <Edit aria-hidden="true" />
</button>

// Pour icônes d'informations:
<Tooltip title="Information">
  <AlertCircle role="img" aria-label="Attention: ..." />
</Tooltip>
```

**Fichiers prioritaires:**

- `src/components/Footer.tsx` - Icons sociales (partiellement fait)
- `src/components/Header.tsx` - Menu icon
- `src/pages/UserAccount.tsx` - Clock, CheckCircle, MapPin, Users
- `src/pages/RevenueStats.tsx` - Calendar, RefreshCw, Home

---

## Sprint 2: Corrections Majeures (Jour 4-6)

### Correction 6: Validation de Formulaire avec aria-invalid

**Fichier:** `src/pages/UserRegister.tsx`  
**Temps estimé:** 1-2 heures

#### Avant:

```tsx
<Input id="firstName" {...register("firstName")} />;
{
  errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>;
}
```

#### Après:

```tsx
<Input
  id="firstName"
  aria-invalid={!!errors.firstName}
  aria-describedby={errors.firstName ? "firstName-error" : "firstName-help"}
  {...register("firstName")}
/>
<div id="firstName-help" className="sr-only">
  Veuillez entrer votre prénom complet
</div>
{errors.firstName && (
  <div
    id="firstName-error"
    role="alert"
    className="text-destructive text-sm mt-1"
  >
    {errors.firstName.message}
  </div>
)}
```

**Appliquer à:**

- UserRegister.tsx (firstName, lastName, email, password)
- UserLogin.tsx (email, password)
- PropertyForm.tsx (tous les inputs)
- ReservationSummary.tsx (tous les inputs)

---

### Correction 7: Modals Accessibilité

**Fichier:** Tous les Dialogs/Modals  
**Temps estimé:** 2-3 heures

#### Requirements:

```tsx
// 1. Focus trap: Focus ne doit pas sortir du modal
// 2. Return focus: Focus doit revenir après fermeture
// 3. aria-modal: Doit être marqué
// 4. aria-label: Doit être labelé
// 5. Backdrop: aria-hidden ou backdrop-filter

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus la première zone focalisable
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop non-interactif */}
          <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

          {/* Modal accessible */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <h2 id="modal-title">{title}</h2>
            {children}
          </div>
        </>
      )}
    </>
  );
};
```

**Chercher les modals:**

```bash
grep -r "Dialog\|Modal\|Popover" src/components --include="*.tsx"
```

---

### Correction 8: Tables Accessibilité

**Fichier:** Pages avec tableaux  
**Temps estimé:** 1-2 heures

#### Requirements:

```tsx
// Pattern correct:
<table>
  <thead>
    <tr>
      <th scope="col">Colonne 1</th>
      <th scope="col">Colonne 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Valeur 1</td>
      <td>Valeur 2</td>
    </tr>
  </tbody>
  <caption>Description du tableau</caption>
</table>
```

**Chercher les tables:**

```bash
grep -r "<table\|role=\"table\"" src/ --include="*.tsx"
```

**Si tables trouvées:**

1. Ajouter `<thead>` autour des headers
2. Ajouter `<tbody>` autour des données
3. Ajouter `scope="col"` aux `<th>`
4. Ajouter `scope="row"` si headers en colonnes
5. Ajouter `<caption>` descriptive

---

### Correction 9: Chargement Accessibilité

**Fichier:** Pages avec états asynchrones  
**Temps estimé:** 1 heure

#### Avant:

```tsx
{
  isLoading && <Spinner />;
}
```

#### Après:

```tsx
{
  isLoading && (
    <div
      className="flex items-center justify-center p-8"
      role="status"
      aria-live="polite"
      aria-label="Chargement des données en cours"
    >
      <Spinner />
      <p className="sr-only">Veuillez patienter...</p>
    </div>
  );
}
```

**Pages à corriger:**

- `src/pages/RevenueStats.tsx` - Stats loading
- `src/pages/UserAccount.tsx` - Bookings loading
- `src/pages/Booking.tsx` - Property loading

---

## Sprint 3: Améliorations (Jour 7-8)

### Correction 10: Listes Accessibilité

**Fichier:** Pages avec listes  
**Temps estimé:** 1-2 heures

#### Pattern:

```tsx
// ❌ À éviter
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// ✅ Correct
<ul className="space-y-4">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

// ✅ Avec aria-label
<ul className="space-y-4" aria-label="Liste des réservations">
  <li>
    <a href="#">Réservation 1</a>
  </li>
</ul>
```

**Chercher les cas:**

```bash
grep -r "className.*space-y.*flex\|flex.*space-y" src/ --include="*.tsx"
```

---

### Correction 11: Breadcrumbs Navigation

**Fichier:** Pages multi-niveaux  
**Temps estimé:** 1-2 heures

#### Composant:

```tsx
// src/components/Breadcrumb.tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  currentPage: string;
}

export const Breadcrumb = ({ items, currentPage }: BreadcrumbProps) => {
  return (
    <nav aria-label="Fil d'ariane">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <>
                <a href={item.href}>{item.label}</a>
                <span aria-hidden="true" className="mx-2">
                  /
                </span>
              </>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
        <li aria-current="page">{currentPage}</li>
      </ol>
    </nav>
  );
};
```

**Utilisation:**

```tsx
<Breadcrumb
  items={[
    { label: "Accueil", href: "/" },
    { label: "Propriétés", href: "/properties" },
  ]}
  currentPage="Détails du gîte"
/>
```

---

### Correction 12: Couleurs Indicateurs

**Fichier:** Badges et statuts  
**Temps estimé:** 1 heure

#### Avant:

```tsx
<Badge variant={status === "confirmed" ? "default" : "destructive"}>
  {status === "confirmed" ? "Confirmé" : "Annulé"}
</Badge>
```

#### Après:

```tsx
<Badge
  variant={status === "confirmed" ? "default" : "destructive"}
  className="flex items-center gap-1"
>
  {status === "confirmed" ? (
    <>
      <CheckCircle className="w-4 h-4" aria-hidden="true" />
      Confirmé
    </>
  ) : (
    <>
      <XCircle className="w-4 h-4" aria-hidden="true" />
      Annulé
    </>
  )}
</Badge>
```

**Appliquer à tous les statuts:**

- Réservations: Confirmé, En attente, Annulé, Terminé
- Propriétés: Publiée, Brouillon, Archivée
- Paiements: Payé, En attente, Remboursé

---

## Sprint 4: Testing et Documentation (Jour 9-10)

### Test 1: Keyboard Navigation

**Temps:** 1-2 heures

```bash
# Pour chaque page:
# 1. Tab through - tous les éléments focalisables
# 2. Shift+Tab - navigation arrière
# 3. Enter - activer boutons/links
# 4. Space - activer checkbox/radio
# 5. Arrow keys - listes/menus

Pages à tester:
- Index.tsx (listing)
- Booking.tsx (détails + form)
- ReservationSummary.tsx (formulaire)
- UserLogin.tsx (form)
- UserRegister.tsx (form)
- UserAccount.tsx (tabs + account)
- RevenueStats.tsx (admin stats)
- PropertyForm.tsx (admin form)
```

**Résultat attendu:**
✅ Tous les éléments focalisables accessibles  
✅ Aucun keyboard trap  
✅ Focus visible sur chaque élément  
✅ Order logique de tabulation

---

### Test 2: Screen Reader (NVDA/VoiceOver)

**Temps:** 1-2 heures

```bash
# NVDA (Windows): https://www.nvaccess.org/
# VoiceOver (Mac): Cmd+F5

Pages prioritaires:
1. UserRegister - Lire les labels et help text
2. Booking - Naviguer les informations
3. UserAccount - Consulter les réservations
4. PropertyForm - Éditer propriété

Points de vérification:
✅ Labels annoncés pour inputs
✅ Erreurs annoncées avec role="alert"
✅ Landmarks navigables
✅ Images avec alt text adéquat
✅ Icônes décoratives pas annoncées
✅ Listes structurées correctement
```

---

### Test 3: Automated Accessibility Testing

**Temps:** 2 heures

#### Installation:

```bash
npm install --save-dev jest-axe @axe-core/react @testing-library/react
```

#### Setup:

```typescript
// src/test/setup-a11y.ts
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// src/__tests__/accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

describe('Page Accessibility', () => {
  test('Register page has no accessibility violations', async () => {
    const { container } = render(<UserRegister />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### Run Tests:

```bash
npm test -- --testPathPattern="accessibility"
```

---

### Test 4: Contrast Verification

**Temps:** 1 heure

**Outils:**

- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Polypane: https://polypane.app/
- Chrome DevTools: Lighthouse

**Vérifier:**

```
✅ Texte sur fond: 4.5:1 (AA) ou 7:1 (AAA)
✅ Texte grand: 3:1 (AA) ou 4.5:1 (AAA)
✅ Icônes/bordures: 3:1 (AA)
✅ Dark mode transitions
✅ States (hover, focus, disabled)
```

---

### Documentation Updates

**Temps:** 1-2 heures

**Fichiers à créer/mettre à jour:**

1. `GUIDE_TEST_PHASE2.md` - Test procedures
2. `CORRECTIONS_PHASE2_APPLIQUEES.md` - Changes log
3. `RESUME_PHASE2_ACCESSIBLE.md` - Summary
4. `AUDIT_ACCESSIBILITE_PHASE2.md` - Updated report

---

## 🎯 Checklist de Complétion

### Phase 2 Finale:

- [ ] **Correction 1-3:** Alt textes
- [ ] **Correction 4:** Éléments interactifs non-labellisés
- [ ] **Correction 5:** Icônes aria-hidden
- [ ] **Correction 6:** Validation aria-invalid
- [ ] **Correction 7:** Modals accessibilité
- [ ] **Correction 8:** Tables structurées
- [ ] **Correction 9:** États de chargement
- [ ] **Correction 10:** Listes HTML
- [ ] **Correction 11:** Breadcrumbs
- [ ] **Correction 12:** Couleurs + icônes
- [ ] **Test 1:** Keyboard navigation ✓
- [ ] **Test 2:** Screen reader ✓
- [ ] **Test 3:** Jest-axe setup ✓
- [ ] **Test 4:** Contrasts vérifiés ✓
- [ ] **Documentation:** Tous les guides mis à jour ✓

---

## 📊 Expected Results

**Before Phase 2:**

- Score: 75/100
- WCAG AA: Partiel
- Test coverage: 40%

**After Phase 2:**

- Score: 88/100 ✅
- WCAG AA: Complète
- Test coverage: 85%
- Violations: 0 critical

---

## 📞 Support et Questions

Pour chaque correction:

1. Lire la description
2. Localiser le fichier
3. Appliquer le pattern
4. Tester localement
5. Vérifier avec les outils

**Ressources:**

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)

---

**Créé:** Décembre 2024  
**Version:** 1.0  
**Statut:** ⏳ À implémenter

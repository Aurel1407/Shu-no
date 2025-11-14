# Guide de Test Phase 2 - Accessibilité

## 🎯 Objectif

Valider que toutes les corrections de Phase 2 respectent les standards WCAG 2.1 AA et fonctionnent correctement avant la production.

---

## 📋 Prérequis

### Outils Recommandés

1. **Browser DevTools**
   - Chrome/Edge: DevTools intégré
   - Firefox: DevTools intégré
   - Safari: Activer Developer Menu

2. **Accessibility Tools**
   - axe DevTools (extension Chrome/Firefox)
   - WAVE (extension Chrome/Firefox)
   - Lighthouse (intégré Chrome)
   - Color Contrast Analyzer

3. **Screen Readers**
   - NVDA (gratuit, Windows): https://www.nvaccess.org/
   - JAWS (payant, Windows/Mac)
   - VoiceOver (gratuit, Mac/iOS)
   - TalkBack (gratuit, Android)

4. **Node Environment**
   ```bash
   npm install --save-dev jest-axe @axe-core/react @testing-library/react
   ```

---

## 🧪 Test 1: Keyboard Navigation

### Procédure

#### 1.1 Setup

```bash
1. Ouvrir http://localhost:5173
2. Désactiver la souris (ou cacher le curseur)
3. Utiliser uniquement le clavier
```

#### 1.2 Tab Navigation Test

**Page: Index.tsx (Listing Propriétés)**

```
Étapes:
┌────────────────────────────────────┐
│ 1. Tab x1: Skip Links (visible)    │
├────────────────────────────────────┤
│ 2. Tab x1: Logo/Brand Link         │
├────────────────────────────────────┤
│ 3. Tab x1-3: Menu Items (Home, etc)│
├────────────────────────────────────┤
│ 4. Tab x1: Theme Toggle            │
├────────────────────────────────────┤
│ 5. Tab x1: Account Button          │
├────────────────────────────────────┤
│ 6. Tab xN: Property Cards (links)  │
├────────────────────────────────────┤
│ 7. Tab xN: Footer Links            │
├────────────────────────────────────┤
│ 8. Tab x3: Social Links (Fb, Insta)│
└────────────────────────────────────┘

Critères d'acceptation:
✅ Focus visible (ring bleu autour de chaque élément)
✅ Ordre logique (haut→bas, gauche→droite)
✅ Aucun élément ignoré
✅ Aucun keyboard trap
```

**Page: UserRegister.tsx (Formulaire)**

```
Étapes:
┌────────────────────────────────────┐
│ 1. Tab: Skip Links                 │
│ 2. Tab: Logo                       │
│ 3. Tab: "Créer un compte" title    │
│ 4. Tab: First Name Input           │
│ 5. Tab: Last Name Input            │
│ 6. Tab: Email Input                │
│ 7. Tab: Password Input             │
│ 8. Tab: Show/Hide Password         │
│ 9. Tab: Confirm Password Input     │
│ 10.Tab: Show/Hide Confirm Pwd      │
│ 11.Tab: Register Button            │
│ 12.Tab: Login Link                 │
└────────────────────────────────────┘

Tests spécifiques:
✅ Labels visibles/lisibles
✅ Help text annoncé (aria-describedby)
✅ Erreurs annoncées avec role="alert"
✅ Focus sur premier champ au chargement
✅ Buttons activables avec Enter/Space
```

**Page: Booking.tsx (Détails Propriété)**

```
Points clés:
✅ Tab à travers la galerie d'images
✅ Focus sur boutons de navigation (Previous/Next)
✅ Tab sur "Book Now" button
✅ Pas de focus trap dans la carousel
```

#### 1.3 Reverse Navigation (Shift+Tab)

```bash
# À partir de n'importe quel page, Shift+Tab
# Devrait revenir à l'élément précédent
# Continuer jusqu'au premier élément

Résultat attendu:
✅ Navigation en arrière complète
✅ Focus ring visible en permanence
```

#### 1.4 Enter Key Test

```bash
# Sur chaque élément focalisable avec Tab:

Button (register):
- Appuyer Enter → Formulaire soumis (ou validé)

Link (vers page):
- Appuyer Enter → Navigation vers page

Input (formulaire):
- Appuyer Enter → Focus vers champ suivant ou submit

Checkbox/Radio:
- Appuyer Space → Toggle l'état
```

#### 1.5 Escape Key Test (Modals)

```bash
# Si modals ouverts:
- Appuyer Escape → Modal se ferme
- Focus retour à l'élément qui l'a ouvert
```

### Checkpoint Form

```markdown
## Keyboard Navigation Checklist

### Index Page

- [ ] Skip links visible au premier Tab
- [ ] Logo/brand clickable avec Enter
- [ ] Tous les links navigables
- [ ] Property cards focusables
- [ ] Footer accessible

### Register Form

- [ ] Tab order logique
- [ ] Tous les labels visibles
- [ ] Help text annoncé
- [ ] Erreurs avec role="alert"
- [ ] Submit avec Enter
- [ ] Login link accessible

### Booking Page

- [ ] Carousel navigable au clavier
- [ ] Book Now button accessible
- [ ] Images gallery navigable
- [ ] Aucun trap clavier

### Modal (si présent)

- [ ] Escape ferme le modal
- [ ] Focus retour après fermeture
- [ ] Focus trap dans modal
```

---

## 🔊 Test 2: Screen Reader (NVDA/VoiceOver)

### 2.1 Setup NVDA (Windows)

```bash
1. Télécharger NVDA depuis https://www.nvaccess.org/
2. Installer et relancer
3. Ouvrir http://localhost:5173
4. Appuyer Insert+N pour démarrer NVDA
5. Écuter les annonces
```

### 2.2 Annonces Attendues

#### Page Index.tsx

```
Annonce NVDA attendue:
─────────────────────────────────────
"main landmark
heading level 1 Nos gîtes
paragraph: Découvrez nos propriétés...
list with 3 items
  link: Gîte 1 (image accessible)
  link: Gîte 2
  link: Gîte 3
contentinfo landmark
navigation with 3 links
  link Facebook
  link Instagram
  link Mentions légales
"
─────────────────────────────────────

✅ Points clés:
- Landmarks clairement annoncés
- Headings avec niveaux corrects (h1)
- Images avec alt text
- Listes avec "with X items"
- Links avec contexte
```

#### Form Register.tsx

```
Annonce NVDA attendue:
─────────────────────────────────────
"main landmark
region Register Form
heading level 2 Create Account
form
  group Information
  label First Name
  edit text First Name required
  help text First Name should be at least 2 characters
  label Last Name
  edit text Last Name required
  ...
  button Register
link: Already have account? Login
"
─────────────────────────────────────

✅ Points clés:
- Form structure avec role="region"
- Labels annoncés avant inputs
- Help text annoncé (aria-describedby)
- Required annoté
- Erreurs avec role="alert"
- Buttons annoncés avec type
```

#### Modal (si présent)

```
Annonce attendue:
─────────────────────────────────────
"dialog role
heading: Modal Title
main content
button Close or Back
"
─────────────────────────────────────

✅ Points clés:
- Dialog annoncé comme role
- Title annoncé
- Contenus lisibles
- Close button accessible
```

### 2.3 Navigation NVDA

**Commandes principales:**

```
H        → Next heading (pour parcourir structure)
Shift+H  → Previous heading
1-6      → Jump to heading level 1-6
N        → Next link
Shift+N  → Previous link
F        → Next form field
T        → Next table
L        → Next list
Shift+L  → Previous list
B        → Next button
U        → Next unvisited link
Shift+U  → Previous unvisited link
```

**Test complète d'une page:**

```bash
1. Appuyer H plusieurs fois → Parcourir tous les headings
2. Appuyer N plusieurs fois → Parcourir tous les links
3. Appuyer F plusieurs fois → Parcourir tous les inputs
4. Naviguer dans form → Tous les labels annoncés?
5. Vérifier les erreurs → role="alert" annoncé?
```

### 2.4 VoiceOver (Mac/iOS)

**Activer:**

```bash
Mac: Cmd + F5 (ou System Preferences > Accessibility > VoiceOver)
iOS: Settings > Accessibility > VoiceOver
```

**Commandes principales:**

```
VO+U     → Rotor (navigation rapide)
VO+Down  → Élément suivant
VO+Up    → Élément précédent
VO+Space → Activer/parcourir
VO+Right → Lire élément
```

### 2.5 Checklist Screen Reader

```markdown
## Screen Reader Testing Checklist

### Home Page

- [ ] Landmarks (main, nav, footer) annoncés
- [ ] Headings avec niveaux corrects (h1, h2, h3)
- [ ] Images avec alt text pertinent
- [ ] Listes structurées (ul/ol)
- [ ] Links avec contexte (pas "click here")
- [ ] Navigation logique et complète

### Register Form

- [ ] Form labelé (role="region" + aria-labelledby)
- [ ] Tous les labels annoncés avant inputs
- [ ] Help text lisible
- [ ] Required field annoté
- [ ] Erreurs avec role="alert"
- [ ] Messages d'erreur clairs
- [ ] Submit button annoncé

### Data Display

- [ ] Tables avec th/td et scope
- [ ] Captions pour context
- [ ] Lists annoncées avec count
- [ ] Dynamic content with aria-live

### Icons

- [ ] Icônes décoratives pas annoncées (aria-hidden)
- [ ] Icônes seules ont aria-label
- [ ] Social links avec aria-label

### Modals

- [ ] Dialog announcé
- [ ] Title announcé
- [ ] Content navigable
- [ ] Close button accessible
- [ ] Focus trap dans modal
- [ ] Focus retour après close
```

---

## 🎨 Test 3: Contrast Verification

### 3.1 Automated Testing (axe DevTools)

```bash
# Installation
npm install --save-dev jest-axe

# Test file: src/__tests__/accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Component has no accessibility violations', async () => {
  const { container } = render(<YourComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Run:**

```bash
npm test -- --testPathPattern="accessibility"
```

### 3.2 Manual Contrast Testing

**Tool: WebAIM Contrast Checker**
https://webaim.org/resources/contrastchecker/

#### Texte Principal (Body)

| Contexte   | Foreground | Background | Ratio | Status |
| ---------- | ---------- | ---------- | ----- | ------ |
| Light mode | #1a1f33    | #f2f6fa    | 21:1  | ✅ AAA |
| Dark mode  | #faf8f6    | #1e2333    | 21:1  | ✅ AAA |

#### Liens

| Mode  | Color   | Background | Ratio | Status |
| ----- | ------- | ---------- | ----- | ------ |
| Light | #1555b0 | #ffffff    | 8:1   | ✅ AAA |
| Dark  | #70bfff | #1e2333    | 9:1   | ✅ AAA |

#### Boutons

| Button    | Text | Background | Ratio | Status |
| --------- | ---- | ---------- | ----- | ------ |
| Primary   | #fff | #1555b0    | 10:1  | ✅ AAA |
| Secondary | #fff | #2573c8    | 7:1   | ✅ AA  |
| Danger    | #fff | #dc2626    | 5.5:1 | ✅ AA  |

**Vérifier sur le site:**

```bash
1. Ouvrir DevTools (F12)
2. Aller à Lighthouse > Accessibility
3. Chercher "Color contrast ratio"
4. Tous les éléments doivent avoir 4.5:1 minimum (AA)

Ou manuellement:
1. Inspecter élément
2. Copier styles (color + background-color)
3. Passer à WebAIM Contrast Checker
4. Vérifier ratio
```

### 3.3 Checklist Contrastes

```markdown
## Contrast Verification Checklist

### Light Mode

- [ ] Corps de texte: 4.5:1+
- [ ] Texte secondaire: 4.5:1+
- [ ] Links: 4.5:1+
- [ ] Boutons: 4.5:1+ (text on button)
- [ ] Icônes: 3:1+ (decorative OK)
- [ ] Bordures: 3:1+

### Dark Mode

- [ ] Corps de texte: 4.5:1+
- [ ] Texte secondaire: 4.5:1+
- [ ] Links: 4.5:1+
- [ ] Boutons: 4.5:1+
- [ ] Icônes: 3:1+
- [ ] Bordures: 3:1+

### States

- [ ] Hover state: contraste maintained
- [ ] Focus state: contraste visible
- [ ] Disabled state: contraste >= 3:1
- [ ] Placeholder text: 4.5:1+

### Special Cases

- [ ] Badge colors + text
- [ ] Alert colors + text
- [ ] Form errors + text
- [ ] Success messages + text
```

---

## ⚙️ Test 4: Automated Testing (Jest-axe)

### 4.1 Setup

```bash
# Installation
npm install --save-dev jest-axe @axe-core/react @testing-library/react

# Configuration dans package.json
{
  "jest": {
    "setupFilesAfterEnv": ["<rootDir>/src/test/setup-a11y.ts"]
  }
}

# Fichier: src/test/setup-a11y.ts
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

### 4.2 Test Patterns

```typescript
// src/__tests__/UserRegister.a11y.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import UserRegister from '@/pages/UserRegister';

expect.extend(toHaveNoViolations);

describe('UserRegister - Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(<UserRegister />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('form labels should be properly associated', () => {
    render(<UserRegister />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('error messages should have role alert', async () => {
    render(<UserRegister />);

    const submitButton = screen.getByRole('button', { name: /register/i });
    await userEvent.click(submitButton);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  test('should have proper heading hierarchy', () => {
    render(<UserRegister />);

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
  });
});
```

### 4.3 Test Pages Priority

**Priority 1 (Must test):**

- `UserRegister.tsx`
- `UserLogin.tsx`
- `Booking.tsx`
- `ReservationSummary.tsx`

**Priority 2 (Should test):**

- `Index.tsx`
- `UserAccount.tsx`
- `PropertyForm.tsx`

**Priority 3 (Nice to test):**

- `Payment.tsx`
- `RevenueStats.tsx`

### 4.4 Run Tests

```bash
# Run all accessibility tests
npm test -- --testPathPattern="a11y"

# Run specific file
npm test -- UserRegister.a11y

# Watch mode
npm test -- --watch --testPathPattern="a11y"

# With coverage
npm test -- --coverage --testPathPattern="a11y"
```

---

## 📝 Test 5: Manual Functional Testing

### 5.1 Form Submission

**Test Case: Register Form Error Handling**

```
Scenario: User submits empty form

Steps:
1. Naviguez vers /register
2. Cliquez "Register" sans remplir formulaire
3. Observer les erreurs

Expected:
✅ Erreurs avec role="alert"
✅ Champs aria-invalid="true"
✅ Screen reader annonce erreurs
✅ Premier champ en erreur focus automatiquement
✅ aria-describedby pointe vers message d'erreur
```

**Test Case: Successful Registration**

```
Scenario: User completes registration successfully

Steps:
1. Remplissez tous les champs correctement
2. Cliquez "Register"
3. Obtenez confirmation

Expected:
✅ Message de succès avec aria-live="polite"
✅ Navigation vers /login
✅ Pas de focus trap
```

### 5.2 Form Navigation

**Test Case: Tab Order in Register Form**

```
Expected Tab Order:
1. Skip Links
2. Logo
3. First Name
4. Last Name
5. Email
6. Password
7. Show/Hide Password
8. Confirm Password
9. Show/Hide Confirm
10. Register Button
11. Login Link
12. Footer Links

Verify:
✅ Pas d'éléments omis
✅ Ordre logique
✅ Focus ring visible
✅ Pas de trap
```

### 5.3 Data Display

**Test Case: Property Listing**

```
Scenario: View list of properties

Expected:
✅ Chaque propriété peut être sélectionnée/consultée
✅ Images ont alt text
✅ Prix/détails clairs
✅ Responsive design
✅ Pas d'overflow caché
```

### 5.4 Interactive Elements

**Test Case: Modal Interaction**

```
Scenario: Open and close modal

Steps:
1. Ouvrez modal (cliquez trigger)
2. Vérifiez focus dans modal
3. Tapez Escape
4. Vérifiez focus revient

Expected:
✅ Focus trap dans modal
✅ Escape ferme modal
✅ Focus retour à trigger
✅ role="dialog" aria-modal="true"
```

---

## 🔍 Test 6: Cross-Browser Testing

### 6.1 Browser Combinations

| Browser | Version | OS      | NVDA | Result   |
| ------- | ------- | ------- | ---- | -------- |
| Chrome  | Latest  | Windows | ✅   | Expected |
| Firefox | Latest  | Windows | ✅   | Expected |
| Edge    | Latest  | Windows | ✅   | Expected |
| Safari  | Latest  | Mac     | ✅   | Expected |

### 6.2 Test Process

```bash
# Pour chaque browser:

1. Ouvrir http://localhost:5173
2. F12 → Lighthouse → Accessibility
3. Vérifier score >= 85
4. Chercher violations
5. Tester navigation clavier
6. Tester screen reader
```

---

## 🚀 Test 7: Performance & Accessibility

### 7.1 Lighthouse Report

```bash
# Chrome DevTools

1. F12 → Lighthouse
2. Cocher: Accessibility, Best Practices
3. Cocher: Desktop
4. Generate Report
5. Chercher:
   - Accessibility Score >= 85
   - Pas de warnings critiques
   - Pas d'erreurs
```

### 7.2 Expected Issues & Fixes

**If "Image elements do not have alt attributes":**

```bash
# Find images
grep -r "<img\|<Image" src/ --include="*.tsx"

# Add alt props
alt={`${name} - ${description}`}
```

**If "Form inputs do not have associated labels":**

```bash
# Check htmlFor matching
<Label htmlFor="field-id">Label</Label>
<Input id="field-id" />
```

---

## 📋 Final Checklist

```markdown
## Phase 2 Testing Complete ✅

### Keyboard Navigation

- [ ] Tab through all pages
- [ ] No keyboard traps
- [ ] Focus visible everywhere
- [ ] Enter activates buttons
- [ ] Escape closes modals

### Screen Reader

- [ ] NVDA: No errors announced
- [ ] VoiceOver: Proper announcements
- [ ] All content readable
- [ ] Form labels announced
- [ ] Landmarks announced

### Contrast

- [ ] All text 4.5:1+
- [ ] Light mode compliant
- [ ] Dark mode compliant
- [ ] State colors verified
- [ ] WebAIM passed

### Automated

- [ ] Jest-axe tests passing
- [ ] Lighthouse 85+
- [ ] axe DevTools clean
- [ ] No violations

### Functional

- [ ] Forms work correctly
- [ ] Error messages display
- [ ] Modals functional
- [ ] Navigation works
- [ ] All pages tested

### Documentation

- [ ] README updated
- [ ] Tests documented
- [ ] Issues logged
- [ ] Fixes documented
- [ ] Timeline completed
```

---

## 📊 Reporting Results

**Template:**

```markdown
# Phase 2 Testing Report

**Date:** [Date]
**Tester:** [Name]
**Duration:** [Hours]

## Summary

- Keyboard Navigation: PASS/FAIL
- Screen Reader: PASS/FAIL
- Contrast: PASS/FAIL
- Automated Tests: PASS/FAIL
- Functional Tests: PASS/FAIL

## Issues Found

1. [Issue description]
   - Severity: Critical/Major/Minor
   - File: path/to/file
   - Fix: description

## Overall Score

Current: 75/100
Target: 88/100
Result: XX/100 ✅/❌

## Sign-off

Tester: \***\*\_\_\_\*\***
Date: \***\*\_\_\_\*\***
```

---

**Version:** 1.0  
**Créé:** Décembre 2024  
**Statut:** Actif

# Roadmap vers 100/100 Lighthouse Accessibility

**Date :** 30 octobre 2025  
**Score actuel :** 88/100  
**Score cible :** 100/100  
**Points restants :** +12 points  
**Statut :** 🚧 En planification

---

## 🎯 Objectif

Atteindre un **score parfait de 100/100** en accessibilité Lighthouse en corrigeant TOUTES les alertes WCAG 2.1 AA/AAA.

---

## 📊 Analyse Gaps (88 → 100)

### Points déjà acquis (88/100)

✅ **Phase 1 + Phase 2 Sessions 1-3 :**

- 2.4.4 Link Purpose (Context) ✅
- 1.3.1 Headings Hierarchy ✅
- 2.1.1 Keyboard Navigation ✅
- 3.3.1/3.3.2 Error Identification ✅
- 4.1.2 Labels on Inputs ✅
- 2.4.3 Focus Order ✅
- 1.1.1 Non-text Content (Icons aria-hidden) ✅
- 2.4.8 Location (Breadcrumbs AAA) ✅
- 1.3.1 Lists Semantics ✅
- 1.4.1 Use of Color (Badges) ✅
- `lang="fr"` présent ✅

### Points potentiellement manquants (12 points)

**Catégories Lighthouse Accessibility :**

#### 1. **Contraste de couleurs** (3-4 points)

**WCAG 1.4.3 Contrast (Minimum) - Level AA**

**Problèmes potentiels identifiés :**

```tsx
// text-slate-600 sur fond blanc = contraste ?
<span className="text-slate-600 dark:text-slate-400">

// text-slate-500 sur fond blanc = contraste ?
<span className="text-sm text-slate-500">

// bg-bleu-profond text-white = contraste ?
<Button className="bg-bleu-profond text-white">
```

**Ratios minimum WCAG :**

- **Texte normal (< 18px)** : 4.5:1
- **Texte large (≥ 18px ou bold 14px)** : 3:1

**Actions nécessaires :**

- [ ] Audit complet avec Axe DevTools ou WebAIM Contrast Checker
- [ ] Vérifier tous les text-slate-500, text-slate-600
- [ ] Vérifier couleurs custom (bleu-profond, bleu-moyen)
- [ ] Corriger : Assombrir textes ou éclaircir fonds

---

#### 2. **Images alt text** (2-3 points)

**WCAG 1.1.1 Non-text Content - Level A**

**Images trouvées sans alt explicite :**

```tsx
// PropertyImageCarousel.tsx
<img src={...} alt={property?.name || "Image de propriété"} />
// Alt peut être vide si purement décorative

// OptimizedImage.tsx
<img alt={alt} /> // Besoin de vérifier tous les usages

// Index.tsx, Payment.tsx, ReservationSummary.tsx, etc.
<img ... /> // Vérifier alt présent et descriptif
```

**Actions nécessaires :**

- [ ] Audit toutes les balises `<img>` (15 trouvées)
- [ ] Vérifier alt présent et descriptif
- [ ] Images décoratives : `alt=""` (chaîne vide, PAS omis)
- [ ] Images informatives : Alt descriptif du contenu visuel

---

#### 3. **Focus visible** (2 points)

**WCAG 2.4.7 Focus Visible - Level AA**

**Focus déjà implémenté :**

```tsx
// Skip links ont focus:outline et focus:ring ✅
className = "... focus:outline-none focus:ring-2 focus:ring-bleu-clair";
```

**À vérifier :**

- [ ] Tous les éléments interactifs ont focus visible
- [ ] Boutons, liens, inputs, selects
- [ ] Pas de `outline: none` sans alternative
- [ ] Focus indicators ≥ 3:1 contrast

---

#### 4. **Attributs ARIA appropriés** (1-2 points)

**WCAG 4.1.2 Name, Role, Value - Level A**

**À vérifier :**

- [ ] Pas d'attributs ARIA redondants ou conflictuels
- [ ] `role="button"` sur éléments non-natifs
- [ ] `aria-live` pour notifications dynamiques (toasts)
- [ ] `aria-expanded` sur éléments dépliables
- [ ] `aria-labelledby` vs `aria-label` (éviter duplication)

**Exemples à auditer :**

```tsx
// Breadcrumbs.tsx - OK ✅
<nav aria-label="Fil d'Ariane">

// UserAccount.tsx - OK ✅
<Badge aria-label="Statut de la réservation: Annulée">

// À vérifier : Dialogs, Alerts, Toasts
```

---

#### 5. **Landmarks ARIA** (1 point)

**WCAG 1.3.1 Info and Relationships - Level A**

**Landmarks déjà implémentés :**

```tsx
<nav aria-label="Fil d'Ariane"> ✅
<main> (présumé) ?
<header> ?
<footer> ?
```

**À vérifier :**

- [ ] `<main>` présent et unique par page
- [ ] `<header>` pour navigation principale
- [ ] `<footer>` pour pied de page
- [ ] Navigation secondaire avec `<nav aria-label="...">`
- [ ] Sections avec `<section aria-labelledby="...">`

---

#### 6. **Ordre de tabulation logique** (1 point)

**WCAG 2.4.3 Focus Order - Level A**

**Skip links implémentés :** ✅

**À tester :**

- [ ] Tab suit l'ordre visuel (gauche → droite, haut → bas)
- [ ] Pas de `tabindex > 0` (anti-pattern)
- [ ] Éléments hors-écran exclus de tab order (sauf skip links)
- [ ] Modale active = focus trap correct

---

#### 7. **Autocomplete approprié** (1 point)

**WCAG 1.3.5 Identify Input Purpose - Level AA**

**Attributs autocomplete requis sur formulaires :**

```tsx
// Login/Register forms
<Input
  type="email"
  autoComplete="email" // ✅ Requis
/>

<Input
  type="password"
  autoComplete="current-password" // ou "new-password"
/>

// Booking forms
<Input
  name="firstName"
  autoComplete="given-name" // ✅
/>

<Input
  name="lastName"
  autoComplete="family-name" // ✅
/>

<Input
  type="tel"
  autoComplete="tel" // ✅
/>
```

**Actions nécessaires :**

- [ ] Audit tous les `<Input>` de formulaires
- [ ] Ajouter attributs autocomplete appropriés
- [ ] Référence : https://www.w3.org/TR/WCAG21/#input-purposes

---

#### 8. **Zones de clic suffisantes** (1 point)

**WCAG 2.5.5 Target Size (Enhanced) - Level AAA**

**Minimum recommandé :** 44×44px (ou 24×24px si espacement suffisant)

**À vérifier :**

```tsx
// Petites icônes cliquables
<Trash2 className="h-4 w-4" /> // 16×16px = trop petit si seul élément cliquable

// Boutons icon-only
<button aria-label="...">
  <IconName className="h-4 w-4" /> // Vérifier padding bouton
</button>
```

**Actions nécessaires :**

- [ ] Audit boutons icon-only (padding ≥ 12px)
- [ ] Links et boutons ≥ 44×44px ou espacement suffisant
- [ ] Mobile : Zone tactile ≥ 48×48px

---

#### 9. **Tables accessibles** (1 point si tables présentes)

**WCAG 1.3.1 Info and Relationships - Level A**

**Tables trouvées :**

- ManageUsers.tsx
- ManageProperties.tsx
- ManageOrders.tsx
- ManageBookings.tsx

**Structure requise :**

```tsx
<Table>
  <TableCaption>Description de la table</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Header 1</TableHead>
      <TableHead scope="col">Header 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data 1</TableCell>
      <TableCell>Data 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**À vérifier :**

- [ ] `<TableCaption>` présent (ou `aria-label` sur `<Table>`)
- [ ] `<th scope="col">` pour headers colonnes
- [ ] `<th scope="row">` pour headers lignes (si applicable)
- [ ] Pas de tableaux de mise en page (CSS Grid/Flex instead)

---

#### 10. **Animations respectueuses** (1 point optionnel)

**WCAG 2.3.3 Animation from Interactions - Level AAA**

**Media query prefers-reduced-motion :**

```tsx
// Exemple à implémenter
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Ou avec Tailwind
<div className="transition-transform motion-reduce:transition-none">
```

**Actions nécessaires :**

- [ ] Respecter `prefers-reduced-motion: reduce`
- [ ] Animations désactivables ou réduites
- [ ] Pas d'animations auto-play sans contrôle

---

## 🛠️ Plan d'Action Détaillé

### Session 4 : Audit & Corrections Critiques (3-4h)

#### 4.1 Audit Lighthouse + Axe DevTools (45min)

**Outils :**

```bash
# Lighthouse CLI
npx lighthouse http://localhost:5173 --only-categories=accessibility --output=html --output-path=./lighthouse-report.html

# Axe DevTools (navigateur)
# Scan automatique de toutes les pages
```

**Checklist audit :**

- [ ] Run Lighthouse sur 10+ pages clés
- [ ] Noter TOUTES les alertes avec fichier/ligne
- [ ] Prioriser par impact (Level A > AA > AAA)
- [ ] Créer tickets corrections

#### 4.2 Contraste couleurs (1h)

**Méthode :**

1. Axe DevTools → Scan contraste automatique
2. WebAIM Contrast Checker : https://webaim.org/resources/contrastchecker/
3. Corriger textes insuffisants :

```tsx
// AVANT (contraste insuffisant)
<span className="text-slate-500"> // 4.2:1 = FAIL

// APRÈS (contraste suffisant)
<span className="text-slate-600"> // 5.2:1 = PASS
// OU
<span className="text-slate-900 opacity-70"> // Autre approche
```

**Tailwind ratios approximatifs (fond blanc) :**

- `text-slate-900` : ~16:1 ✅
- `text-slate-700` : ~8:1 ✅
- `text-slate-600` : ~5:1 ✅ (minimum)
- `text-slate-500` : ~4:2:1 ⚠️ (borderline)
- `text-slate-400` : ~2.9:1 ❌ FAIL
- `text-slate-300` : ~2:1 ❌ FAIL

**Vérifier custom colors :**

```css
/* tailwind.config.ts */
colors: {
  'bleu-profond': '#1B365D', // Vérifier avec blanc
  'bleu-moyen': '#2B5BA6',   // Vérifier avec blanc
  'bleu-clair': '#A8C7E7',   // Vérifier avec blanc
}
```

**Corrections prioritaires :**

- [ ] Tous les `text-slate-500` → `text-slate-600`
- [ ] Tous les `text-slate-400` → `text-slate-500` minimum
- [ ] Vérifier bg-bleu-profond avec text-white (minimum 4.5:1)

#### 4.3 Images alt text (30min)

**Audit :**

```bash
# Trouver toutes les images
grep -r "<img" src/
```

**Pattern de correction :**

```tsx
// Images décoratives (accompagnent texte)
<img src={...} alt="" /> // Chaîne VIDE

// Images informatives
<img
  src={property.image}
  alt={`Photo de ${property.name} - ${property.location}`}
/>

// Logos
<img src={logo} alt="Logo Shu no" />

// Icônes informatives (rare, préférer Lucide React)
<img src={icon} alt="Succès" />
```

**Corrections :**

- [ ] OptimizedImage.tsx : Vérifier prop alt requise
- [ ] PropertyImageCarousel.tsx : Alt descriptif
- [ ] Index.tsx, Payment.tsx, etc. : Audit individuel

#### 4.4 Attributs autocomplete (45min)

**Fichiers concernés :**

- UserLogin.tsx
- UserRegister.tsx
- Booking.tsx (formulaire voyageur)
- PropertyForm.tsx (optionnel, admin)

**Mapping WCAG :**

| Input Purpose    | autocomplete Value |
| ---------------- | ------------------ |
| Prénom           | `given-name`       |
| Nom              | `family-name`      |
| Email            | `email`            |
| Password actuel  | `current-password` |
| Nouveau password | `new-password`     |
| Téléphone        | `tel`              |
| Pays             | `country-name`     |
| Code postal      | `postal-code`      |
| Adresse ligne 1  | `address-line1`    |

**Exemple UserLogin.tsx :**

```tsx
<Input
  id="email"
  type="email"
  autoComplete="email" // ✅ AJOUTER
  value={credentials.email}
  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
/>

<Input
  id="password"
  type="password"
  autoComplete="current-password" // ✅ AJOUTER
  value={credentials.password}
  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
/>
```

**Corrections :**

- [ ] UserLogin.tsx (email, password)
- [ ] UserRegister.tsx (email, password, firstName, lastName)
- [ ] Booking.tsx (firstName, lastName, email, tel si présent)

#### 4.5 Focus visible & Skip links (30min)

**Audit focus indicators :**

```bash
# Chercher outline: none sans alternative
grep -r "outline.*none" src/
grep -r "focus:outline-none" src/
```

**Vérifier :**

- [ ] Skip links ont focus visible ✅ (déjà fait)
- [ ] Tous les `focus:outline-none` ont `focus:ring` ✅
- [ ] Contraste focus indicator ≥ 3:1

**Test manuel :**

- [ ] Tab à travers toutes les pages
- [ ] Focus visible en permanence
- [ ] Pas d'éléments "perdus" sans indicateur

#### 4.6 Landmarks ARIA (30min)

**Audit structure HTML :**

```tsx
// App.tsx ou Layout
<div className="app">
  <Header /> {/* <header> ou <nav role="navigation"> */}
  <main>
    {" "}
    {/* ✅ Requis et unique */}
    <Routes>
      <Route path="/" element={<Index />} />
      ...
    </Routes>
  </main>
  <Footer /> {/* <footer> */}
</div>
```

**Vérifier :**

- [ ] `<main>` entoure contenu principal (routes)
- [ ] `<header>` pour Header.tsx
- [ ] `<footer>` pour Footer.tsx
- [ ] `<nav>` pour navigation principale
- [ ] `<aside>` pour contenu supplémentaire (si applicable)

**Corrections :**

```tsx
// AVANT
<div className="header">

// APRÈS
<header className="header">
```

---

### Session 5 : Corrections Fines & Tests (2-3h)

#### 5.1 Tables accessibles (1h)

**Exemple ManageUsers.tsx :**

```tsx
// AVANT
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nom</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  ...
</Table>

// APRÈS
<Table aria-label="Liste des utilisateurs">
  <TableCaption className="sr-only">
    Liste complète des utilisateurs avec leurs rôles et statuts
  </TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Nom</TableHead>
      <TableHead scope="col">Email</TableHead>
      <TableHead scope="col">Rôle</TableHead>
      <TableHead scope="col">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>{user.firstName} {user.lastName}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{getRoleBadge(user.role)}</TableCell>
        <TableCell>...</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Corrections :**

- [ ] ManageUsers.tsx (table users)
- [ ] ManageProperties.tsx (table propriétés)
- [ ] ManageOrders.tsx (table commandes)
- [ ] ManageBookings.tsx (table réservations)

**Pattern shadcn/ui :**

- `<TableCaption>` ou `aria-label` sur `<Table>`
- `scope="col"` sur tous les `<TableHead>` de header
- `scope="row"` sur premier `<TableCell>` si identifiant ligne

#### 5.2 Zones de clic (30min)

**Audit boutons icon-only :**

```tsx
// AVANT - Zone trop petite
<button className="p-1" aria-label="Supprimer">
  <Trash2 className="h-4 w-4" /> {/* 16px + 2×4px padding = 24px total */}
</button>

// APRÈS - Zone suffisante
<button className="p-3" aria-label="Supprimer">
  <Trash2 className="h-4 w-4" /> {/* 16px + 2×12px padding = 40px total */}
</button>

// OU icône plus grande
<button className="p-2" aria-label="Supprimer">
  <Trash2 className="h-5 w-5" /> {/* 20px + 2×8px padding = 36px total */}
</button>
```

**Corrections :**

- [ ] PropertyForm.tsx boutons suppression images
- [ ] Carousel.tsx boutons navigation
- [ ] Dialog/Sheet close buttons
- [ ] Vérifier mobile (touch targets ≥ 48×48px)

#### 5.3 Animations respectueuses (30min)

**Implémentation prefers-reduced-motion :**

```tsx
// hooks/use-reduced-motion.ts
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return prefersReducedMotion;
}
```

**Utilisation :**

```tsx
function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("transition-transform", !prefersReducedMotion && "duration-300")}>...</div>
  );
}
```

**Tailwind motion-reduce :**

```tsx
<div className="transition-opacity duration-300 motion-reduce:transition-none">...</div>
```

**Corrections :**

- [ ] Ajouter motion-reduce à toutes les transitions
- [ ] Hook useReducedMotion pour animations JS
- [ ] Test avec OS setting "Reduce Motion"

#### 5.4 ARIA attributs (30min)

**Audit conflits ARIA :**

```bash
# Chercher patterns problématiques
grep -r 'aria-' src/ | grep -E '(aria-labelledby.*aria-label|aria-describedby.*title)'
```

**Patterns à corriger :**

```tsx
// ❌ MAUVAIS - Duplication
<button aria-label="Fermer" aria-labelledby="close-text">
  <span id="close-text">Fermer</span>
</button>

// ✅ BON - Une seule source
<button aria-label="Fermer">
  <X aria-hidden="true" />
</button>

// ✅ BON - Texte visible
<button>
  <X className="mr-2" aria-hidden="true" />
  Fermer
</button>
```

**Toasts/Alerts dynamiques :**

```tsx
// Alert.tsx
<Alert role="alert" aria-live="polite">
  <AlertDescription>{message}</AlertDescription>
</Alert>

// Toast.tsx (vérifier shadcn/ui)
<Toast role="status" aria-live="polite" aria-atomic="true">
  ...
</Toast>
```

**Corrections :**

- [ ] Audit aria-label vs aria-labelledby (éviter duplication)
- [ ] aria-live sur composants dynamiques (alerts, toasts)
- [ ] aria-expanded sur accordions/dropdowns
- [ ] aria-current déjà présent (breadcrumbs ✅)

---

## 📋 Checklist Finale Pre-100

### Audit Tools

- [ ] Lighthouse CLI sur 10+ pages (score 100)
- [ ] Axe DevTools scan complet (0 violations)
- [ ] WAVE browser extension (0 errors)
- [ ] NVDA/JAWS test sur pages principales
- [ ] VoiceOver test (Mac/iOS si disponible)
- [ ] Keyboard-only navigation test complet

### WCAG 2.1 AA Conformité

**Level A (indispensable) :**

- [ ] 1.1.1 Non-text Content ✅
- [ ] 1.3.1 Info and Relationships ✅ (+ tables à vérifier)
- [ ] 1.3.2 Meaningful Sequence ✅
- [ ] 2.1.1 Keyboard ✅
- [ ] 2.1.2 No Keyboard Trap ✅
- [ ] 2.4.1 Bypass Blocks ✅ (skip links)
- [ ] 2.4.2 Page Titled ✅
- [ ] 2.4.4 Link Purpose ✅
- [ ] 3.1.1 Language of Page ✅ (lang="fr")
- [ ] 3.2.1 On Focus (pas de changement contexte)
- [ ] 3.2.2 On Input (pas de changement contexte)
- [ ] 3.3.1 Error Identification ✅
- [ ] 3.3.2 Labels or Instructions ✅
- [ ] 4.1.1 Parsing (HTML valide)
- [ ] 4.1.2 Name, Role, Value ✅

**Level AA (objectif principal) :**

- [ ] 1.3.4 Orientation (responsive ✅)
- [ ] 1.3.5 Identify Input Purpose (autocomplete à ajouter)
- [ ] 1.4.3 Contrast (Minimum) (à vérifier)
- [ ] 1.4.5 Images of Text (évité ✅)
- [ ] 1.4.10 Reflow (responsive ✅)
- [ ] 1.4.11 Non-text Contrast (à vérifier)
- [ ] 1.4.12 Text Spacing (CSS flexible ✅)
- [ ] 1.4.13 Content on Hover/Focus (tooltips accessibles)
- [ ] 2.4.3 Focus Order ✅
- [ ] 2.4.5 Multiple Ways (navigation + search)
- [ ] 2.4.6 Headings and Labels ✅
- [ ] 2.4.7 Focus Visible (à vérifier)
- [ ] 3.1.2 Language of Parts (si multilingue)
- [ ] 3.2.3 Consistent Navigation ✅
- [ ] 3.2.4 Consistent Identification ✅
- [ ] 3.3.3 Error Suggestion ✅
- [ ] 3.3.4 Error Prevention (confirmations importantes)
- [ ] 4.1.3 Status Messages (toasts/alerts à vérifier)

**Level AAA (bonus) :**

- [ ] 2.4.8 Location ✅ (breadcrumbs)
- [ ] 2.3.3 Animation from Interactions (à implémenter)
- [ ] 2.5.5 Target Size (à vérifier)

---

## 📊 Estimation Temps

| Session              | Tâches              | Durée      | Score Gain     |
| -------------------- | ------------------- | ---------- | -------------- |
| **Session 4**        | Audit + Critiques   | 3-4h       | +6-8 points    |
| - Audit complet      | Lighthouse + Axe    | 45min      | -              |
| - Contraste couleurs | Corrections textes  | 1h         | +3-4           |
| - Images alt         | Audit + corrections | 30min      | +2             |
| - Autocomplete       | Formulaires         | 45min      | +1             |
| - Focus + Landmarks  | Vérifications       | 1h         | +1             |
| **Session 5**        | Fines + Tests       | 2-3h       | +4-6 points    |
| - Tables             | Captions + scope    | 1h         | +1             |
| - Zones clic         | Padding boutons     | 30min      | +1             |
| - Animations         | motion-reduce       | 30min      | +1             |
| - ARIA               | Audit conflits      | 30min      | +1             |
| - Tests finaux       | NVDA + keyboard     | 30min      | -              |
| **Total**            | **5-7h**            | **+10-14** | **98-102/100** |

**Marge sécurité :** Score final attendu **98-100/100**.

---

## 🎯 Critères de Succès

### Session 4 Terminée

- [ ] Lighthouse Accessibility ≥ 95/100
- [ ] Axe DevTools ≤ 5 violations mineures
- [ ] Contraste textes corrigé (0 erreurs AA)
- [ ] Images alt présent sur toutes les images
- [ ] Autocomplete sur formulaires login/register/booking

### Session 5 Terminée

- [ ] **Lighthouse Accessibility = 100/100** 🎯
- [ ] Axe DevTools = 0 violations
- [ ] WAVE = 0 errors
- [ ] NVDA test complet sans blocages
- [ ] Keyboard navigation fluide sur toutes les pages

### Documentation

- [ ] Screenshots Lighthouse 100/100
- [ ] Rapport final PHASE2_SCORE_100.md
- [ ] Guide maintenance accessibilité
- [ ] Checklist validation continue

---

## 📚 Ressources

### Outils Audit

- **Lighthouse** : https://developer.chrome.com/docs/lighthouse
- **Axe DevTools** : https://www.deque.com/axe/devtools/
- **WAVE** : https://wave.webaim.org/extension/
- **WebAIM Contrast Checker** : https://webaim.org/resources/contrastchecker/
- **ARC Toolkit** : https://www.tpgi.com/arc-platform/arc-toolkit/

### Documentation WCAG

- **WCAG 2.1 Guidelines** : https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices** : https://www.w3.org/WAI/ARIA/apg/
- **WebAIM WCAG Checklist** : https://webaim.org/standards/wcag/checklist
- **Autocomplete Attribute** : https://www.w3.org/TR/WCAG21/#input-purposes

### Lecteurs d'écran

- **NVDA (Windows)** : https://www.nvaccess.org/
- **JAWS (Windows)** : https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver (Mac/iOS)** : Intégré macOS/iOS
- **TalkBack (Android)** : Intégré Android

---

## 📄 Prochaines Étapes

1. **Immédiat :** Lancer audit Lighthouse + Axe DevTools
2. **Session 4 :** Corrections critiques (contraste, alt, autocomplete)
3. **Session 5 :** Corrections fines (tables, animations, ARIA)
4. **Validation :** Tests exhaustifs NVDA + keyboard
5. **Documentation :** Rapport final + screenshots

---

**Signature :** Roadmap Phase 2 - Objectif 100/100  
**Auteur :** GitHub Copilot  
**Date :** 30 octobre 2025  
**Statut :** 🚧 **PRÊT À LANCER SESSION 4**

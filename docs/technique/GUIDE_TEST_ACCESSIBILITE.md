# 🧪 Guide de Test d'Accessibilité - Shu-no

**Dernière mise à jour :** 30 octobre 2025  
**Statut :** ✅ Tests Phase 1 Prêts

---

## 🎯 Commandes de Démarrage Rapide

### Démarrer le développement

```bash
npm run dev
```

### Lancer les tests

```bash
npm run test:run
npm run test:ui
```

### Tester l'accessibilité avec ESLint

```bash
npm run lint
```

---

## 🖥️ Tests Manuels (Requis)

### Test 1 : Navigation au Clavier Complète

**Durée :** ~5 minutes  
**Importance :** 🔴 CRITIQUE

**Étapes :**

1. Ouvrir le site : http://localhost:5173
2. Appuyer sur `Tab` plusieurs fois
3. Vérifier que vous voyez les 3 skip links en premier
4. Continuer à naviguer avec `Tab` sur tous les éléments
5. Sur chaque page (Accueil, Réserver, Contact, Admin, etc.)

**Checklist :**

- [ ] Skip links visibles et fonctionnels au premier Tab
- [ ] Focus visible sur TOUS les boutons
- [ ] Focus visible sur TOUS les liens
- [ ] Champs de formulaire focusables
- [ ] Pas de zone "pièges" où le focus ne peut pas sortir
- [ ] Ordre de tabulation logique

**Rapport si problème :**

- Note la page concernée
- Note l'élément problématique
- Crée une issue GitHub avec label `accessibility`

---

### Test 2 : Lecteur d'Écran (NVDA)

**Durée :** ~15 minutes par page  
**Importance :** 🔴 CRITIQUE  
**Outils :** NVDA gratuit

**Installation :**

```bash
# Windows - Télécharger depuis :
https://www.nvaccess.org/download/

# Puis : installer et redémarrer
```

**Démarrage :**

```bash
# Windows - Raccourci global NVDA
Ctrl+Alt+N
```

**Commandes Essentielles :**
| Touche | Action |
|--------|--------|
| `↓` | Lire la ligne suivante |
| `↑` | Lire la ligne précédente |
| `Ctrl+↓` | Lire le paragraphe suivant |
| `H` | Aller au titre suivant |
| `F` | Aller au prochain formulaire |
| `B` | Aller au prochain bouton |
| `L` | Aller au prochain lien |
| `N` | Aller à la prochaine zone de navigation |
| `D` | Aller à la prochaine région |
| `G` | Aller au prochain graphique |
| `T` | Aller au prochain tableau |
| `Échap` | Quitter le mode navigation |

**Test Checklist :**

#### Page d'Accueil

- [ ] Lire la page entière avec `↓` et `Ctrl+↓`
- [ ] Utiliser `H` pour naviguer par titres
- [ ] Les titres sont hiérarchisés (h1 → h2 → h3)
- [ ] Utiliser `B` pour naviguer par boutons
- [ ] Les boutons ont des labels clairs
- [ ] Utiliser `F` pour naviguer les formulaires
- [ ] Utiliser `L` pour naviguer les liens

#### Page de Réservation

- [ ] Les champs de formulaire sont correctement étiquetés
- [ ] Les descriptions d'aide sont annoncées
- [ ] Les messages d'erreur sont clairs et localisés
- [ ] Les changements de sélection sont annoncés

#### Page de Contact

- [ ] Tous les champs ont des labels associés
- [ ] Les messages d'erreur sont annoncés
- [ ] Le succès de l'envoi est annoncé
- [ ] Les domaines requis sont identifiés

#### Admin Panel

- [ ] La structure des tables est cohérente
- [ ] Les boutons d'action sont clairement identifiés
- [ ] Les modales sont correctement annoncées
- [ ] Les statuts de chargement sont annoncés

**Rapport si problème :**

```
Page: [Nom]
Élément: [Description]
Problème: [Ce qui est annoncé incorrectement]
Attendu: [Ce qui devrait être annoncé]
```

---

### Test 3 : Contraste des Couleurs

**Durée :** ~10 minutes  
**Importance :** 🟠 MAJEURE  
**Outil :** Axe DevTools (Chrome extension)

**Installation :**

```bash
# Chrome Web Store : https://chrome.google.com/webstore
# Rechercher : "Axe DevTools"
# Ajouter à Chrome
```

**Utilisation :**

1. Ouvrir le site
2. Clic droit → Inspecter (ou F12)
3. Cliquer sur l'onglet "Axe DevTools"
4. Cliquer sur "Scan THIS PAGE"
5. Attendre les résultats

**Vérifications :**

- [ ] 0 violations "Critical"
- [ ] 0 violations "Serious"
- [ ] "Needs Review" peut être ignoré (examiner au cas par cas)
- [ ] Ratio contraste ≥ 4.5:1 pour texte normal
- [ ] Ratio contraste ≥ 3:1 pour texte large (18pt+)

**Pages à tester :**

- Accueil
- Réservation
- Contact
- Connexion Utilisateur
- Panel Admin
- Chaque page produit

**Rapport si problème :**

```
URL: [Page]
Élément: [Classe CSS ou ID]
Ratio actuel: [3.2:1]
Ratio requis: [4.5:1 AA / 7:1 AAA]
Couleurs: [bg-color on fg-color]
```

---

### Test 4 : Prefers-Reduced-Motion

**Durée :** ~5 minutes  
**Importance :** 🟡 MINEURE

#### Windows

1. Paramètres → Accessibilité → Affichage
2. Activer "Réduire le mouvement"
3. Rafraîchir F5
4. Vérifier que le site reste utilisable

#### macOS

1. Système → Accessibilité → Affichage
2. Activer "Réduire le mouvement"
3. Rafraîchir F5
4. Vérifier que le site reste utilisable

#### Linux

```bash
# Via dconf (GNOME)
gsettings set org.gnome.desktop.a11y.preferences reduce-motion true
```

**Vérifications :**

- [ ] Animations disparaissent
- [ ] Transitions disparaissent
- [ ] Site reste parfaitement fonctionnel
- [ ] Aucun contenu caché
- [ ] Performance reste bonne

---

### Test 5 : Zoom à 200%

**Durée :** ~10 minutes  
**Importance :** 🟠 MAJEURE

**Procédure :**

1. Appuyer sur `Ctrl+0` (réinitialiser d'abord)
2. Appuyer sur `Ctrl++` trois fois (200%)
3. Naviguer sur toutes les pages

**Vérifications :**

- [ ] Pas de débordement horizontal (scrollbar H)
- [ ] Texte lisible sans déformation
- [ ] Boutons/liens cliquables
- [ ] Formulaires fonctionnels
- [ ] Navigation reste accessible
- [ ] Images responsive

**Pages à tester :**

- [ ] Accueil
- [ ] Détail propriété
- [ ] Réservation
- [ ] Contact
- [ ] Admin Dashboard
- [ ] Chaque page formulaire

---

### Test 6 : Daltonisme

**Durée :** ~5 minutes  
**Importance :** 🟡 MINEURE

#### Outil : Chrome DevTools

1. F12 → Rendering → Emulate vision deficiency
2. Sélectionner chaque type de daltonisme :
   - Protanopia (pas de rouge)
   - Deuteranopia (pas de vert)
   - Tritanopia (pas de bleu)
   - Achromatopsia (absence totale de couleur)

**Vérifications :**

- [ ] Tous les éléments reste distinguable
- [ ] Les codes couleur seuls ne véhiculent pas l'info
- [ ] Les icônes ont du texte ou du label
- [ ] Les statuts (erreur/succès) sont clairs

---

### Test 7 : Flux d'Accessibilité Complet

**Durée :** ~30 minutes  
**Importance :** 🔴 CRITIQUE

**Scénario :** Réserver un gîte depuis le début

**Étapes avec NVDA activé :**

1. **Page d'Accueil**
   - [ ] H pour naviguer les titres
   - [ ] L pour naviguer les liens
   - [ ] Vérifier les descriptions des propriétés

2. **Cliquer sur une propriété**
   - [ ] NVDA annonce la page chargée
   - [ ] Les images ont des descriptions
   - [ ] Les informations sont lisibles
   - [ ] Les caractéristiques sont claires

3. **Cliquer sur "Réserver"**
   - [ ] F pour naviguer les formulaires
   - [ ] Tous les champs ont des labels
   - [ ] Les dates de calendrier sont accessibles
   - [ ] Les sélecteurs sont clairs

4. **Remplir le formulaire**
   - [ ] Tab d'un champ à l'autre
   - [ ] Erreurs annoncées correctement
   - [ ] Aides visibles et lisibles

5. **Soumettre**
   - [ ] Message de succès/erreur annoncé
   - [ ] Focus géré correctement

---

## 🤖 Tests Automatisés

### Installation des dépendances

```bash
npm install --save-dev jest-axe
npm install --save-dev @testing-library/jest-dom
```

### Créer un test de base

```typescript
// src/components/Header.test.accessibility.ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Header from './Header';

expect.extend(toHaveNoViolations);

describe('Header Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Lancer les tests

```bash
npm run test:run
```

---

## 📋 Checklist de Validation Finale

### Avant de pousser du code

```markdown
## Accessibilité - Checklist PR

- [ ] Testé au clavier (Tab complet)
- [ ] NVDA/JAWS - Pas d'erreur
- [ ] Axe DevTools - 0 violations Critical
- [ ] Contraste ≥ 4.5:1 (texte normal)
- [ ] Alt text sur TOUS les images
- [ ] Labels sur TOUS les formulaires
- [ ] Focus visible sur éléments interactifs
- [ ] Prefers-reduced-motion testé
- [ ] Zoom 200% testé
- [ ] ARIA attributes appropriés
- [ ] Pas de keyboard trap
```

---

## 🐛 Débogage Courant

### Problème : Élément non focusable au clavier

**Solution :**

```tsx
// ❌ Mauvais
<div onClick={handler}>Bouton</div>

// ✅ Bon
<button onClick={handler}>Bouton</button>

// ✅ Alternative
<div
  role="button"
  tabIndex={0}
  onClick={handler}
  onKeyDown={(e) => e.key === 'Enter' && handler()}
>
  Bouton
</div>
```

### Problème : Lecteur d'écran ne voit pas le label

**Solution :**

```tsx
// ❌ Mauvais
<label>Email</label>
<input type="email" />

// ✅ Bon
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Problème : Contraste insuffisant

**Solution :**

```tsx
// ❌ Mauvais (gris clair sur blanc)
<span className="text-muted-foreground">Texte</span>

// ✅ Bon
<span className="text-gray-700 dark:text-gray-300">Texte</span>

// ✅ Modifier les variables CSS
--muted-foreground: 220 15% 35%; // Plus foncé
```

### Problème : Keyboard trap

**Solution :**

```tsx
// ✅ Utiliser Radix UI Dialog (gère correctement)
<Dialog>
  <DialogContent>{/* Focus géré automatiquement */}</DialogContent>
</Dialog>;

// ✅ Sinon, gérer manuellement
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape") closeModal();
};
```

---

## 📊 Résultats Attendus Après Corrections

| Test               | Avant              | Après            | Statut  |
| ------------------ | ------------------ | ---------------- | ------- |
| Navigation Clavier | ❌ Défectueux      | ✅ OK            | Passant |
| NVDA               | ❌ Problèmes       | ✅ OK            | Passant |
| Axe DevTools       | ❌ 47 violations   | ✅ 0 Critical    | Passant |
| Contraste          | ❌ Plusieurs < 4.5 | ✅ Tous ≥ 4.5    | Passant |
| Alt Text           | ❌ Manquants       | ✅ Tous présents | Passant |
| Prefers Motion     | ❌ Non testé       | ✅ Fonctionne    | Passant |
| Zoom 200%          | ⚠️ Quelques soucis | ✅ OK            | Passant |

---

## 🔗 Ressources Supplémentaires

### Outils Recommandés

- **Axe DevTools** : Chrome extension
- **NVDA** : Lecteur d'écran gratuit (https://www.nvaccess.org/)
- **JAWS** : Lecteur d'écran commercial (14$ pour accès annuel)
- **WebAIM Contrast Checker** : https://webaim.org/resources/contrastchecker/
- **WAVE Browser Extension** : https://wave.webaim.org/extension/

### Guides et Documentation

- **WCAG 2.1 Guidelines** : https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices** : https://www.w3.org/WAI/ARIA/apg/
- **MDN Web Docs - Accessibility** : https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **WebAIM Articles** : https://webaim.org/articles/

### Formation

- **Pluralsight - Web Accessibility** : https://www.pluralsight.com/
- **Coursera - Web Accessibility** : https://www.coursera.org/
- **A11y Project** : https://www.a11yproject.com/

---

## ✅ Validation Complète

Après avoir exécuté tous les tests ci-dessus :

1. [ ] Tous les tests manuels passent
2. [ ] NVDA sans problème critiques
3. [ ] Axe DevTools : 0 violations Critical/Serious
4. [ ] Contrastes conformes WCAG AA
5. [ ] Documentation mise à jour
6. [ ] Code pushé sur la branche feature/accessibility
7. [ ] Pull Request créée avec checklist

---

**Prochaine étape :** Valider cette phase 1 complète avant de passer à la Phase 2

---

_Guide de test créé le 30 octobre 2025_  
_Maintenance : Chaque PR accessibilité doit utiliser cette checklist_

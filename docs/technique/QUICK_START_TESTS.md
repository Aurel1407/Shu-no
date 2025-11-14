# ⚡ Quick Start - Commandes de Test

**Dernier document créé le :** 30 octobre 2025  
**Pour :** Tester rapidement les corrections  
**Durée :** 2-5 minutes

---

## 🎯 TL;DR - Les 3 Tests Essentiels

### Test 1 : Navigation au Clavier (2 min)

```bash
# 1. Ouvrir le site
npm run dev

# 2. Dans le navigateur : http://localhost:5173
# 3. Appuyer sur Tab plusieurs fois
# 4. Vérifier qu'on voit les skip links en premier
```

### Test 2 : Contraste (2 min)

```bash
# 1. Ouvrir Chrome DevTools (F12)
# 2. Clic droit → Extensions → Axe DevTools
# 3. Bouton "Scan THIS PAGE"
# 4. Vérifier 0 violations "Critical"
```

### Test 3 : Lecteur d'Écran (5 min)

```bash
# Windows - Démarrer NVDA
Ctrl+Alt+N

# Puis naviguer la page
# H = Titre suivant
# F = Formulaire suivant
# L = Lien suivant
```

---

## 🚀 Démarrage du Projet

```bash
# Installer dépendances
npm install

# Démarrer dev
npm run dev

# URL par défaut
http://localhost:5173
```

---

## 🧪 Tests Manuels Rapides

### Navigation au Clavier (Essayer d'abord ceci)

```
1. Appuyer Tab 10 fois
   ✅ Vous devez voir des éléments focusés
   ✅ Skip links en premier
   ✅ Pas de keyboard trap

2. Appuyer Escape
   ✅ Les menus se ferment

3. Appuyer Enter sur un bouton
   ✅ Il s'active correctement
```

### Test de Zoom

```bash
# Zoom in
Ctrl+Plus (3 fois) # 200%

# Vérifier
✅ Pas de scroll horizontal
✅ Texte reste lisible
✅ Boutons encore cliquables

# Réinitialiser
Ctrl+0
```

### Test Couleurs Réduites

```
Chrome DevTools F12
→ Rendering
→ Emulate vision deficiency
→ Protanopia (aucun rouge)
→ Vérifier que tout reste distinguable
```

---

## 🛠️ Installation Outils Optionnels

### Axe DevTools (Recommandé)

```bash
# Chrome Web Store URL
https://chrome.google.com/webstore

# Rechercher "Axe DevTools"
# Cliquer "Add to Chrome"

# Utilisation
DevTools F12 → Onglet Axe DevTools → Scan THIS PAGE
```

### NVDA - Lecteur d'écran (Gratuit)

```bash
# Windows uniquement
# Télécharger
https://www.nvaccess.org/download/

# Installer et redémarrer

# Démarrer
Ctrl+Alt+N

# Arrêter
Ctrl+Alt+N (again)
```

### WAVE Extension (Alternative)

```bash
# Chrome Web Store
https://wave.webaim.org/extension/

# Cliquer "Add to Chrome"

# Utilisation
DevTools F12 → Onglet WAVE → Scan
```

---

## 📊 Vérifier les Corrections

### ✅ Clavier Complet

Pages à tester :

- [ ] Accueil (`/`)
- [ ] Réservation (`/booking`)
- [ ] Contact (`/contact`)
- [ ] Connexion Admin (`/admin/login`)
- [ ] Panel Admin (`/admin`)

**Test par page :**

1. Appuyer Tab jusqu'à la fin
2. Tous les éléments focusables ?
3. Focus visible ?
4. Pas de trap ?

### ✅ Axe DevTools

```
1. Ouvrir chaque page
2. DevTools → Axe DevTools → Scan
3. Vérifier : 0 violations "Critical"
4. Acceptable : "Needs Review"
5. Ignorer : "Best Practice"
```

**Pages à scanner :**

- [ ] Accueil
- [ ] Propriété (detail)
- [ ] Réservation
- [ ] Contact
- [ ] Connexion
- [ ] Admin

### ✅ NVDA (Lecteur d'Écran)

```
1. Démarrer NVDA (Ctrl+Alt+N)
2. Naviguer page avec H, F, B, L
3. Tout annoncé correctement ?
4. Labels sur formulaires ?
5. Erreurs claires ?

Touches utiles :
H = Next heading
F = Next form
B = Next button
L = Next link
↓ = Read line
Ctrl+↓ = Read paragraph
```

---

## 📝 Checklist Rapide Avant Push

```markdown
## Accessibilité - À Vérifier

- [ ] Testé au clavier (Tab complet)
- [ ] Skip links visibles et fonctionnels
- [ ] Axe DevTools : 0 Critical
- [ ] Focus visible sur éléments
- [ ] Pas de keyboard trap
- [ ] Alt text sur images
- [ ] Labels sur formulaires
- [ ] Contraste OK (visuellement)
- [ ] Zoom 200% OK
- [ ] NVDA : aucun message d'erreur
```

---

## 🐛 Déboguer

### Clavier ne fonctionne pas

```bash
# Vérifier dans DevTools
# Élément a-t-il tabindex ?
# tabindex >= 0 ?

# Vérifier CSS
# pointer-events: none ?
# visibility: hidden ?

# Utiliser Chrome DevTools
F12 → Elements → Inspecter l'élément
```

### Focus Pas Visible

```bash
# Vérifier CSS
# :focus { outline: 2px solid blue; }

# Ou
# :focus-visible { ring-2 ring-blue-500; }

# Ajouter si manquant
```

### Alt Text Manquant

```bash
# NVDA annonce "Image, no name"
# Ajouter alt="Description"

# Ou utiliser aria-label
<img aria-label="Description" />
```

---

## 📊 Résultats Attendus

### Avant Corrections

```
Keyboard: ❌ Mauvais (28/100)
Axe: ❌ 47 violations
NVDA: ❌ Problèmes
Contraste: ⚠️ Faible
```

### Après Corrections

```
Keyboard: ✅ Excellent (80/100)
Axe: ✅ 0 Critical
NVDA: ✅ OK
Contraste: ✅ WCAG AA
```

---

## 🎯 Success Criteria

**Vous devez voir :**

- ✅ 3 skip links au premier Tab
- ✅ Focus visible sur tous les éléments
- ✅ Pas d'erreurs Axe DevTools
- ✅ NVDA annonce structure correctement
- ✅ Zoom 200% OK
- ✅ Couleurs réduite OK

---

## 🔗 Pages à Tester Priorité

1. **Accueil** (Page la plus visitée)
2. **Réservation** (Formulaires)
3. **Contact** (Formulaires)
4. **Connexion** (Formulaires)
5. **Admin** (Complexité)

---

## ✅ Rapport Simple

```
Date: 30 oct 2025
Testeur: [Votre nom]

Tests Effectués:
✅ Clavier Navigation
✅ Skip Links
✅ Axe DevTools
✅ NVDA
✅ Zoom 200%

Violations Trouvées: 0 Critical
Contraste: Conforme AA
Status: PRÊT PRODUCTION
```

---

## 📞 Besoin d'Aide ?

1. **Lire :** Voir GUIDE_TEST_ACCESSIBILITE.md pour tests complets
2. **Déboguer :** Utiliser Chrome DevTools + Axe DevTools
3. **Questions :** Consulter GUIDE_INTEGRATION_ACCESSIBILITE.md

---

**Bons tests ! 🚀**

_Créé le 30 octobre 2025_

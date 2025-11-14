# 🚀 Guide d'Intégration - Utiliser les Corrections d'Accessibilité

**Date :** 30 octobre 2025  
**Audience :** Développeurs  
**Durée de lecture :** ~5 minutes

---

## 🎯 Vue d'Ensemble

Les corrections d'accessibilité de Phase 1 sont **intégrées et prêtes**. Voici comment les utiliser dans votre code.

---

## 📦 Nouvelles Fonctionnalités Disponibles

### 1. Hook `useAccessibleNotification()`

**Pour annoncer les notifications aux utilisateurs de lecteurs d'écran.**

#### Installation

Déjà disponible : `src/hooks/use-accessible-notification.ts`

#### Utilisation Basique

```tsx
import { useAccessibleNotification } from "@/hooks/use-accessible-notification";

export function MonComposant() {
  const { announce } = useAccessibleNotification();

  const handleSuccess = () => {
    announce("Opération réussie !", "success");
  };

  const handleError = () => {
    announce("Une erreur s'est produite", "error");
  };

  return (
    <>
      <button onClick={handleSuccess}>Succès</button>
      <button onClick={handleError}>Erreur</button>
    </>
  );
}
```

#### Types Supportés

```typescript
type NotificationType = "success" | "error" | "info" | "warning";

// Utilisation
announce(message: string, type?: NotificationType);
```

#### Exemple Complet : Formulaire de Contact

```tsx
import { useAccessibleNotification } from "@/hooks/use-accessible-notification";
import { useForm } from "react-hook-form";

export function ContactForm() {
  const { announce } = useAccessibleNotification();
  const { handleSubmit, ...form } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        announce("Votre message a été envoyé avec succès", "success");
        form.reset();
      } else {
        throw new Error("Envoi échoué");
      }
    } catch (error) {
      announce("Erreur lors de l'envoi du message", "error");
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

---

### 2. Classe CSS `.sr-only` (Screen Reader Only)

**Pour masquer visuellement du texte mais le rendre accessible.**

#### Utilisation Basique

```tsx
<span className="sr-only">Texte caché visuellement mais lu par les lecteurs d'écran</span>
```

#### Cas d'Usage Courants

**Aide contextuelle :**

```tsx
<div className="space-y-2">
  <label htmlFor="email">Email</label>
  <input id="email" type="email" />
  <span id="email-help" className="sr-only">
    Entrez votre adresse email valide
  </span>
</div>
```

**Texte pour icônes :**

```tsx
<button>
  <Plus className="h-4 w-4" />
  <span className="sr-only">Ajouter un élément</span>
</button>
```

**Instructions pour le clavier :**

```tsx
<div className="sr-only">Utilisez les flèches haut/bas pour naviguer, Entrée pour sélectionner</div>
```

---

### 3. Focus Visible Style `.focus-visible`

**Styles de focus automatique pour la navigation clavier.**

#### Déjà Intégré

```css
.focus-visible:focus-visible {
  outline: 2px solid;
  outline-offset: 2px;
  outline-color: #003399; /* bleu-profond */
}
```

#### Utilisation

```tsx
// Aucune action requise - s'applique automatiquement à tous les éléments

// Personnalisation si besoin
<button className="focus-visible:ring-2 focus-visible:ring-blue-500">Bouton Custom</button>
```

---

### 4. Skip Links (Déjà Intégrés)

**Pour sauter la navigation et aller directement au contenu.**

#### Fonctionnement Automatique

Déjà intégrés dans le `Header.tsx`, aucune action requise.

#### Tester

1. Appuyer sur `Tab` en premier
2. Vous verrez les 3 skip links
3. Appuyer sur `Enter` pour les utiliser

#### Personnaliser (Avancé)

Si vous devez ajouter d'autres skip links :

```tsx
// src/components/SkipLinks.tsx
<a
  href="#mon-id"
  className="sr-only focus:not-sr-only fixed top-32 left-0 bg-bleu-profond text-white px-4 py-2 z-50"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("mon-id")?.focus();
  }}
>
  Aller à ma section
</a>
```

---

### 5. Landmarks Sémantiques

**Structure HTML accessible.**

#### Déjà en Place

```tsx
// src/App.tsx
<main role="main">
  {/* Contenu principal */}
</main>

// src/components/Header.tsx
<header role="banner">
  <nav id="main-nav">
    {/* Navigation */}
  </nav>
</header>

// src/components/Footer.tsx
<footer id="main-footer" role="contentinfo">
  {/* Pied de page */}
</footer>
```

#### Comment Créer Vos Propres Landmarks

```tsx
// Section avec landmark
<section aria-labelledby="mon-titre" role="region">
  <h2 id="mon-titre">Ma Section</h2>
  {/* Contenu */}
</section>

// Région de formulaire
<form aria-labelledby="form-title" role="form">
  <h2 id="form-title">Mon Formulaire</h2>
  {/* Champs */}
</form>
```

---

## 🔍 Checklist pour Vos Nouveaux Composants

Avant de soumettre un nouveau composant :

### ✅ Accessibilité Minimale

- [ ] Navigation au clavier complète (Tab)
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Labels sur tous les formulaires
- [ ] Alt text sur toutes les images
- [ ] Pas de keyboard trap

### ✅ Accessibilité Améliorée

- [ ] aria-label ou aria-describedby où nécessaire
- [ ] Rôles ARIA appropriés
- [ ] Annonces aria-live pour les changements dynamiques
- [ ] aria-disabled pour les éléments désactivés
- [ ] aria-current pour l'élément actif

### ✅ Test

- [ ] Testé au clavier (Tab complet)
- [ ] Testé avec NVDA/lecteur d'écran
- [ ] Axe DevTools sans violations Critical
- [ ] Contraste ≥ 4.5:1

---

## 💡 Patterns Recommandés

### Pattern 1 : Bouton avec Icône

```tsx
// ❌ Mauvais
<button>
  <Plus /> {/* Lecteur d'écran : "Bouton ?" */}
</button>

// ✅ Bon
<button aria-label="Ajouter un élément">
  <Plus aria-hidden="true" />
</button>
```

### Pattern 2 : Champ de Formulaire

```tsx
// ✅ Bon
<div className="space-y-2">
  <label htmlFor="email">Email</label>
  <input id="email" type="email" aria-describedby="email-help" aria-required="true" />
  <span id="email-help" className="sr-only">
    Entrez votre email pour créer un compte
  </span>
</div>
```

### Pattern 3 : Lien Externe

```tsx
// ✅ Bon
<a
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Visiter Example.com (ouvre dans un nouvel onglet)"
>
  Example.com
</a>
```

### Pattern 4 : Notification de Succès

```tsx
// ✅ Bon
const handleSubmit = async () => {
  try {
    const response = await submitForm();
    announce("Formulaire envoyé avec succès !", "success");
  } catch (error) {
    announce("Erreur lors de l'envoi", "error");
  }
};
```

### Pattern 5 : Région avec Titre

```tsx
// ✅ Bon
<section aria-labelledby="section-title">
  <h2 id="section-title">Propriétés Recommandées</h2>
  {/* Contenu */}
</section>
```

---

## 🐛 Débogage Courant

### Problème : Focus Pas Visible

```tsx
// Ajouter une classe focus-visible
<input className="border-2 border-gray-300 focus-visible:border-blue-500 focus-visible:ring-2" />
```

### Problème : Lecteur d'Écran Trop Verbeux

```tsx
// Cacher les icônes décoratives
<Icon aria-hidden="true" />
```

### Problème : Keyboard Trap

```tsx
// S'assurer que Escape ferme les modales
const handleKeyDown = (e) => {
  if (e.key === "Escape") closeModal();
};
```

### Problème : Alt Text Absent

```tsx
// TOUJOURS ajouter un alt text
<img src="photo.jpg" alt="Photo de la propriété avec vue sur la mer" />
```

---

## 🧪 Tester Vos Changements

### Avant de Pousser du Code

```bash
# 1. Vérifier au clavier
# Appuyer sur Tab partout dans votre composant

# 2. Lancer Axe DevTools
# DevTools F12 → Onglet Axe DevTools → Scan THIS PAGE

# 3. Vérifier les contrastes
# DevTools → Rendering → Emulate vision deficiency

# 4. Tester au zoom 200%
Ctrl+Plus (3 fois)

# 5. Tester prefers-reduced-motion
# Paramètres → Accessibilité → Réduire le mouvement
```

---

## 📝 Template de Commit

Pour documenter vos changements d'accessibilité :

```
type: feat(accessibility)

Description du changement

### Améliorations d'accessibilité
- [ ] Navigation au clavier complète
- [ ] Labels sur formulaires
- [ ] Alt text sur images
- [ ] Focus visible
- [ ] Axe DevTools: 0 violations

### Tests
- [ ] Testé au clavier
- [ ] Testé avec NVDA
- [ ] Zoom 200% OK
- [ ] Contraste OK
```

---

## 📚 Ressources d'Apprentissage

### Documentation du Projet

- [Audit Complet](./AUDIT_ACCESSIBILITE_COMPLET.md)
- [Guide de Test](./GUIDE_TEST_ACCESSIBILITE.md)
- [Résumé Phase 1](./RESUME_PHASE1_ACCESSIBLE.md)

### Ressources Externes

- **MDN Accessibility** : https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **ARIA Authoring Practices** : https://www.w3.org/WAI/ARIA/apg/
- **WebAIM** : https://webaim.org/

### Outils

- **Axe DevTools** : Chrome extension gratuite
- **NVDA** : Lecteur d'écran gratuit
- **Color Contrast Analyzer** : Vérifier les contrastes

---

## ❓ FAQ

### Q : Faut-il tous les aria-\* sur tous les éléments ?

**R :** Non, seulement quand nécessaire. Utiliser du HTML sémantique d'abord.

### Q : Peut-on désactiver les skip links ?

**R :** Non, ils sont nécessaires WCAG. Ils se masquent juste visuellement.

### Q : Quel est le format idéal pour alt text ?

**R :** Descriptif (20-125 caractères), sans "Image de..." ou "Photo de...".

### Q : Comment gérer les erreurs de formulaire ?

**R :** Avec aria-invalid, aria-describedby et role="alert".

### Q : Radix UI gère l'accessibilité ?

**R :** Oui ! Radix UI est excellente pour l'a11y. L'utiliser au maximum.

---

## 🎯 Objectifs pour Chaque PR

- ✅ Score d'accessibilité ne baisse jamais
- ✅ Zéro violation Critical/Serious
- ✅ Tous les tests manuels passent
- ✅ Documentation à jour

---

## 📞 Besoin d'Aide ?

1. Consultez les documents de ce dossier
2. Utilisez Axe DevTools pour déboguer
3. Testez avec NVDA
4. Créez une issue avec le label `accessibility`

---

**Prochaine étape :** Appliquer ces patterns à vos nouveaux composants !

---

_Guide d'intégration créé le 30 octobre 2025_  
_Maintenance : À jour avec Phase 1 complétée_

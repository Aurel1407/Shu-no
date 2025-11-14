# 🔐 Guide de Sécurité - Shu-no

## ✅ État de la sécurité

### Configuration actuelle

| Élément          | Statut              | Notes                 |
| ---------------- | ------------------- | --------------------- |
| **Fichier .env** | ✅ **Sécurisé**     | Non tracké par Git    |
| **.env.example** | ✅ **Présent**      | Template disponible   |
| **.gitignore**   | ✅ **Configuré**    | .env dans l'exclusion |
| **Credentials**  | ⚠️ **À surveiller** | Ne jamais commiter    |

---

## 📋 Checklist de sécurité

### ✅ Variables d'environnement

- [x] Fichier `.env` dans `.gitignore`
- [x] Fichier `.env.example` créé comme template
- [x] Credentials non committés dans Git
- [ ] Variables d'environnement sur serveur de production

### 🔄 À faire avant le déploiement

#### 1. **Générer des secrets sécurisés**

```bash
# JWT Secret (32+ caractères aléatoires)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. **Configuration production**

Créer un fichier `.env.production` (NON commité) :

```bash
# IMPORTANT: Ne jamais commiter ce fichier !
NODE_ENV=production
DB_PASSWORD=strong_password_from_hosting
JWT_SECRET=generated_secret_from_step_1
CLOUDINARY_API_SECRET=from_cloudinary_dashboard
FRONTEND_URL=https://votre-domaine.fr
DEBUG_DISABLE_RATE_LIMIT=false  # IMPORTANT: activer en prod
```

#### 3. **Variables sur serveur de production**

Configurer les variables d'environnement sur votre hébergeur :

- **Vercel/Netlify** : Dashboard → Environment Variables
- **Heroku** : `heroku config:set VAR_NAME=value`
- **VPS** : Fichier `.env` sur le serveur (hors Git)

---

## 🚨 Bonnes pratiques

### ❌ Ne JAMAIS faire :

```bash
# Ne JAMAIS commiter ces fichiers
git add .env
git add .env.production
git add backend/.env

# Ne JAMAIS logger ces valeurs
console.log(process.env.JWT_SECRET);
console.log(process.env.DB_PASSWORD);
```

### ✅ Toujours faire :

```bash
# Utiliser .env.example comme template
cp backend/.env.example backend/.env

# Générer des secrets uniques pour chaque environnement
# Dev, Staging, Production = secrets différents

# Utiliser des gestionnaires de secrets en production
# - AWS Secrets Manager
# - HashiCorp Vault
# - Variables d'environnement hébergeur
```

---

## 🔒 Secrets à protéger

### Backend (`backend/.env`)

| Variable                | Niveau de criticité | Description                       |
| ----------------------- | ------------------- | --------------------------------- |
| `JWT_SECRET`            | 🔴 **CRITIQUE**     | Authentification des utilisateurs |
| `DB_PASSWORD`           | 🔴 **CRITIQUE**     | Accès base de données             |
| `CLOUDINARY_API_SECRET` | 🔴 **CRITIQUE**     | Upload d'images                   |
| `SESSION_SECRET`        | 🟠 **Important**    | Sessions utilisateurs             |
| `SMTP_PASSWORD`         | 🟠 **Important**    | Envoi d'emails                    |

### Frontend (`.env`)

| Variable                     | Niveau de criticité | Description                     |
| ---------------------------- | ------------------- | ------------------------------- |
| `VITE_API_URL`               | 🟡 **Public**       | URL de l'API (peut être public) |
| `VITE_CLOUDINARY_CLOUD_NAME` | 🟡 **Public**       | Nom cloud Cloudinary            |

⚠️ **Note** : Les variables `VITE_*` sont publiques (incluses dans le build frontend)

---

## 🛡️ Rotation des secrets

### Quand rotationner ?

- ✅ **Immédiatement** si un secret est exposé
- ✅ **Tous les 90 jours** (bonne pratique)
- ✅ **Après le départ d'un membre de l'équipe**
- ✅ **Après une compromission suspectée**

### Comment rotationner ?

```bash
# 1. Générer un nouveau secret
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 2. Mettre à jour .env
echo "JWT_SECRET=$NEW_SECRET" >> backend/.env

# 3. Redémarrer l'application
npm run dev

# 4. Invalider les anciens tokens (si JWT)
# Les utilisateurs devront se reconnecter
```

---

## 🔐 Audit de sécurité

### Commandes à exécuter régulièrement

```bash
# 1. Audit des dépendances npm
npm audit
npm audit fix

# 2. Vérifier les vulnérabilités connues
npm audit --production

# 3. Rechercher des secrets exposés dans le code
git log -p | grep -i "password\|secret\|api_key" | head -20

# 4. Vérifier qu'aucun .env n'est tracké
git ls-files | grep ".env$"
# Si résultat → DANGER ! Supprimer immédiatement

# 5. Scanner avec des outils spécialisés
# - Snyk: https://snyk.io
# - GitGuardian: https://www.gitguardian.com
```

---

## 🚀 Configuration sécurisée par environnement

### Développement (local)

```bash
# backend/.env
NODE_ENV=development
DEBUG_DISABLE_RATE_LIMIT=true
LOG_LEVEL=debug
FRONTEND_URL=http://localhost:8080
```

### Staging (pré-production)

```bash
# Variables serveur staging
NODE_ENV=staging
DEBUG_DISABLE_RATE_LIMIT=false
LOG_LEVEL=info
FRONTEND_URL=https://staging.shu-no.fr
```

### Production

```bash
# Variables serveur production
NODE_ENV=production
DEBUG_DISABLE_RATE_LIMIT=false
LOG_LEVEL=error
FRONTEND_URL=https://shu-no.fr

# Sécurité renforcée
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=50  # Plus restrictif
```

---

## 📞 En cas de fuite de secrets

### 🚨 Procédure d'urgence

1. **Immédiatement** :

   ```bash
   # Rotationner TOUS les secrets compromis
   # Cloudinary
   - Se connecter à cloudinary.com
   - Régénérer API Key & Secret

   # JWT
   - Générer nouveau JWT_SECRET
   - Redéployer application
   - Invalider toutes les sessions

   # Base de données
   - Changer mot de passe DB
   - Mettre à jour .env
   - Redémarrer backend
   ```

2. **Dans les 24h** :
   - Audit complet des logs d'accès
   - Vérifier tentatives de connexion suspectes
   - Scanner la base de données pour anomalies

3. **Documentation** :
   - Noter la date/heure de la fuite
   - Documenter les actions correctives
   - Mettre à jour ce guide si nécessaire

---

## ✅ Validation de sécurité

### Checklist avant déploiement

```bash
# 1. Aucun .env dans Git
[ -z "$(git ls-files '*.env')" ] && echo "✅ OK" || echo "❌ DANGER"

# 2. .env.example à jour
[ -f "backend/.env.example" ] && echo "✅ OK" || echo "❌ Manquant"

# 3. JWT_SECRET assez long (32+ caractères)
[ ${#JWT_SECRET} -ge 32 ] && echo "✅ OK" || echo "❌ Trop court"

# 4. Rate limiting activé en production
grep -q "DEBUG_DISABLE_RATE_LIMIT=false" .env.production && echo "✅ OK" || echo "❌ Vérifier"

# 5. npm audit propre
npm audit --production --audit-level=high
```

---

## 📚 Ressources

- **OWASP Top 10** : https://owasp.org/www-project-top-ten/
- **12 Factor App** : https://12factor.net/config
- **npm audit docs** : https://docs.npmjs.com/cli/audit
- **Secrets management** : https://github.com/gitguardian/gg-shield

---

## 🎯 Résumé

| Élément                | Statut Actuel |
| ---------------------- | ------------- |
| Secrets protégés       | ✅ **OK**     |
| .gitignore configuré   | ✅ **OK**     |
| .env.example fourni    | ✅ **OK**     |
| Documentation sécurité | ✅ **Créée**  |

**Prochaines étapes** : Implémenter rate limiting et audit npm

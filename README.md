# 🏡 Shu-no - Plateforme de Réservation de Gîtes

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-339933.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-96.67%25-brightgreen.svg)](docs/technique/COVERAGE_REPORT.md)
[![Performance](https://img.shields.io/badge/Lighthouse-93%2F100-success.svg)](docs/sprints/SPRINT2_PERFORMANCE_RAPPORT.md)
[![Accessibility](https://img.shields.io/badge/WCAG_AAA-100%25-blue.svg)](docs/sprints/SPRINT3_QUALITE_RAPPORT.md)

> Plateforme full-stack moderne pour la location de gîtes en Bretagne (Côte de Goëlo), développée avec TypeScript, React, et Express.  
> **Projet de stage DWWM - Production-ready depuis le 29/10/2025 ✅**

---

## **Métriques Finales du Projet**

| Métrique                   | Résultat    | Référence       |
| -------------------------- | ----------- | --------------- |
| **Tests**                  | **96.67%**  | 523/541 passing |
| **Couverture Code**        | **88.17%**  | 91.23% frontend |
| **Performance Lighthouse** | **93/100**  | Bat Airbnb (72) |
| **Accessibilité WCAG AAA** | **100%**    | 86/86 critères  |
| **Vulnérabilités**         | **0**       | npm audit       |
| **SonarQube**              | **Grade A** | 93% conformité  |

**→ Voir [docs/](docs/) pour toute la documentation complète**

---

## Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Démarrage](#-démarrage)
- [Tests](#-tests)
- [Documentation](#-documentation)
- [Architecture](#-architecture)
- [Déploiement](#-déploiement)
- [Sécurité](#-sécurité)

## Vue d'ensemble

Shu-no est une plateforme complète de gestion de réservations de gîtes offrant une expérience utilisateur moderne et intuitive pour découvrir, réserver et gérer des hébergements touristiques sur la Côte de Goëlo en Bretagne.

### Projet de Stage DWWM

- **Stagiaire :** Aurélien Thébault
- **Formation :** Développeur Web et Web Mobile (DWWM) - AFPA Brest
- **Période :** 25 août 2025 - 1er novembre 2025 (10 semaines)
- **Entreprise :** Shu-no
- **Méthodologie :** Agile (5 sprints de 2 semaines)

## Architecture

### Architecture Générale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node/Express)│◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - React 18      │    │ - Express.js    │    │ - Users         │
│ - TypeScript    │    │ - TypeScript    │    │ - Products      │
│ - Vite          │    │ - TypeORM       │    │ - Orders        │
│ - Tailwind CSS  │    │ - JWT Auth      │    │ - PricePeriods  │
│ - React Router  │    │ - Winston logs  │    │ - Settings      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technologies Frontend

- **React 18** - Framework UI avec hooks modernes
- **TypeScript** - Typage statique pour la robustesse
- **Vite** - Build tool ultra-rapide avec HMR
- **React Router 6** - Routing côté client
- **Tailwind CSS** - Framework CSS utilitaire
- **Radix UI** - Composants accessibles et non-stylés
- **React Query** - Gestion d'état serveur et cache
- **Leaflet** - Cartes interactives
- **Recharts** - Graphiques et visualisations
- **React Hook Form + Zod** - Gestion et validation des formulaires
- **Sonner** - Notifications toast élégantes

### Technologies Backend

- **Node.js + Express** - Serveur API RESTful
- **TypeScript** - Typage statique côté serveur
- **TypeORM** - ORM pour base de données
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification stateless
- **bcrypt** - Hashage des mots de passe
- **Winston** - Logging structuré
- **Helmet** - Sécurité HTTP headers
- **CORS** - Gestion cross-origin
- **Rate Limiting** - Protection contre les abus
- **Input Sanitization** - Protection XSS

## Fonctionnalités

### Pour les Utilisateurs

- **Recherche avancée** - Filtrage par dates, nombre de personnes
- **Calendrier en temps réel** - Disponibilité instantanée des hébergements
- **Réservation sécurisée** - Système de paiement intégré et sécurisé
- **Gestion de compte** - Profil utilisateur et historique de réservations
- **Contact direct** - Formulaire de contact avec les propriétaires
- **Mode sombre/clair** - Interface adaptable selon vos préférences
- **Responsive** - Optimisé pour mobile, tablette et desktop

### Pour les Administrateurs 🛠️

- **Dashboard analytique** - Statistiques complètes et graphiques en temps réel
- **Gestion des propriétés** - CRUD complet sur les gîtes et hébergements
- **Gestion des réservations** - Vue d'ensemble et modification des bookings
- **Tarification dynamique** - Gestion des périodes et tarifs saisonniers
- **Gestion des utilisateurs** - Administration des comptes clients
- **Gestion des contacts** - Traitement des demandes et messages
- **Paramètres système** - Configuration globale de l'application
- **Statistiques de revenus** - Analyse financière et rapports

## CI/CD

### Vue d'ensemble du Pipeline

Le projet utilise **GitHub Actions** pour l'intégration et le déploiement continus :

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────────┐
│  Push/PR    │───►│    Tests    │───►│ Lighthouse  │───►│Déploiement   │
│             │    │             │    │             │    │              │
│ • main      │    │ • Lint      │    │ • Perf      │    │ • Staging    │
│ • develop   │    │ • Type      │    │ • Access    │    │ • Production │
│ • PR        │    │ • Tests     │    │ • SEO       │    │ • Rollback   │
└─────────────┘    └─────────────┘    └─────────────┘    └──────────────┘
```

### Workflows Disponibles

#### `ci-cd.yml` - Pipeline Principal

- **Déclencheurs** : Push sur `main`/`develop`, Pull Requests
- **Tests** : Lint, TypeScript, Tests unitaires, Build
- **Performance** : Lighthouse CI (Performance, Accessibilité, SEO)
- **Sécurité** : Audit npm automatique
- **Déploiement** : Automatique en staging/production

#### `pr-checks.yml` - Vérifications PR

- **Déclencheur** : Pull Requests
- **Actions** : Tests rapides, commentaires automatiques
- **Feedback** : Résultats directement dans la PR

### Configuration Requise

#### Secrets GitHub (Settings > Secrets and variables > Actions)

```bash
# Pour déploiement serveur
DEPLOY_HOST=your-server.com
DEPLOY_USER=deploy
DEPLOY_KEY=-----BEGIN OPENSSH PRIVATE KEY-----

# Pour notifications Slack/Discord
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Pour Docker Hub (si déploiement conteneurisé)
DOCKER_HUB_TOKEN=your-docker-hub-token
DOCKER_HUB_USERNAME=your-username
```

#### Variables d'Environnement Serveur

```bash
# .env.production (côté serveur)
NODE_ENV=production
DEPLOY_ENV=production

# Variables de déploiement
DEPLOY_PATH=/var/www/shu-no
BACKUP_PATH=/var/backups/shu-no
```

### Utilisation

#### Déploiement Manuel (Alternative)

```bash
# Déploiement en staging
./scripts/deploy.sh staging

# Déploiement en production
./scripts/deploy.sh production
```

#### Monitoring du Pipeline

- **GitHub Actions** : Onglet "Actions" du repository
- **Rapports Lighthouse** : Artifacts des runs CI
- **Logs Déploiement** : Dans les logs des jobs de déploiement

### Branches et Environnements

| Branche     | Environnement | Déclencheur | Description               |
| ----------- | ------------- | ----------- | ------------------------- |
| `main`      | Production    | Push        | Code stable en production |
| `develop`   | Staging       | Push        | Intégration continue      |
| `feature/*` | Local         | PR          | Développement features    |

### Docker (Optionnel)

#### Développement Local

```bash
# Démarrer tous les services
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêter
docker-compose down
```

#### Production

```bash
# Build et push des images
docker build -f Dockerfile.frontend -t shu-no/frontend:latest .
docker build -f backend/Dockerfile -t shu-no/backend:latest .

# Déploiement avec docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d
```

### Métriques et Alertes

- **Tests** : Couverture > 85%
- **Performance** : Score Lighthouse > 0.8
- **Sécurité** : Audit npm propre
- **Disponibilité** : Health checks automatiques

### Dépannage

#### Pipeline qui échoue

1. **Vérifier les logs** dans l'onglet Actions
2. **Tests locaux** : `npm run test:all`
3. **Build local** : `npm run build`
4. **Lighthouse local** : `npx lighthouse http://localhost:4173`

#### Déploiement qui échoue

1. **Connexion SSH** : Vérifier les credentials
2. **Permissions** : Droits d'écriture sur le serveur
3. **Services** : Vérifier nginx/pm2/systemd
4. **Rollback** : Utiliser les sauvegardes automatiques

## Installation et Configuration

### Prérequis

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 12.0
- **npm** ou **yarn**

### Installation

1. **Cloner le repository**

   ```bash
   git clone <repository-url>
   cd shu-no
   ```

2. **Installer les dépendances**

   ```bash
   # Frontend
   npm install

   # Backend
   cd backend
   npm install
   cd ..
   ```

3. **Configuration de la base de données**

   Créer une base de données PostgreSQL et configurer les variables d'environnement :

   ```bash
   # backend/.env
   NODE_ENV=development
   PORT=3001
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=shu_no_db

   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   ```

4. **Initialiser la base de données**
   ```bash
   cd backend
   npm run build
   npm run create-admin  # Créer un compte admin
   ```

### Démarrage

#### Développement

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

L'application sera accessible sur :

- Frontend : http://localhost:8080
- Backend API : http://localhost:3001
- Health check : http://localhost:3001/api/health

#### Production

```bash
# Build et démarrage production
cd backend
npm run start:prod
```

## API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentification

L'API utilise l'authentification JWT. Inclure le token dans l'en-tête Authorization :

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Utilisateurs (`/users`)

| Méthode | Endpoint           | Auth   | Description                      |
| ------- | ------------------ | ------ | -------------------------------- |
| GET     | `/users`           | Admin  | Liste tous les utilisateurs      |
| GET     | `/users/admin/:id` | Admin  | Détails d'un utilisateur (admin) |
| GET     | `/users/profile`   | User   | Profil de l'utilisateur connecté |
| POST    | `/users`           | Public | Créer un nouvel utilisateur      |
| POST    | `/users/login`     | Public | Connexion utilisateur            |
| PUT     | `/users/:id`       | User   | Mettre à jour un utilisateur     |
| DELETE  | `/users/:id`       | Admin  | Supprimer un utilisateur         |

#### Propriétés (`/products`)

| Méthode | Endpoint                       | Auth   | Description                     |
| ------- | ------------------------------ | ------ | ------------------------------- |
| GET     | `/products`                    | Public | Liste des propriétés actives    |
| GET     | `/products/admin`              | Admin  | Toutes les propriétés (debug)   |
| GET     | `/products/admin/:id`          | Admin  | Détails d'une propriété (admin) |
| GET     | `/products/:id`                | Public | Détails d'une propriété         |
| GET     | `/products/location/:location` | Public | Propriétés par localisation     |
| POST    | `/products`                    | Admin  | Créer une propriété             |
| PUT     | `/products/:id`                | Admin  | Mettre à jour une propriété     |
| DELETE  | `/products/:id`                | Admin  | Supprimer une propriété         |

#### Réservations (`/orders`)

| Méthode | Endpoint                     | Auth  | Description                   |
| ------- | ---------------------------- | ----- | ----------------------------- |
| GET     | `/orders`                    | Admin | Toutes les réservations       |
| GET     | `/orders/my-bookings`        | User  | Réservations de l'utilisateur |
| GET     | `/orders/user/:userId`       | User  | Réservations d'un utilisateur |
| GET     | `/orders/product/:productId` | Admin | Réservations d'une propriété  |
| GET     | `/orders/:id`                | User  | Détails d'une réservation     |
| POST    | `/orders`                    | User  | Créer une réservation         |
| PUT     | `/orders/:id`                | Admin | Mettre à jour une réservation |
| DELETE  | `/orders/:id`                | Admin | Supprimer une réservation     |

#### Périodes Tarifaires (`/price-periods`)

| Méthode | Endpoint                                      | Auth   | Description                    |
| ------- | --------------------------------------------- | ------ | ------------------------------ |
| GET     | `/price-periods`                              | User   | Toutes les périodes tarifaires |
| GET     | `/price-periods/:id`                          | User   | Détails d'une période          |
| GET     | `/price-periods/product/:productId`           | User   | Périodes d'une propriété       |
| GET     | `/price-periods/product/:productId/calculate` | Public | Calculer prix pour dates       |
| POST    | `/price-periods`                              | Admin  | Créer une période tarifaire    |
| PUT     | `/price-periods/:id`                          | Admin  | Mettre à jour une période      |
| DELETE  | `/price-periods/:id`                          | Admin  | Supprimer une période          |

#### Paramètres (`/settings`)

| Méthode | Endpoint                         | Auth  | Description                           |
| ------- | -------------------------------- | ----- | ------------------------------------- |
| GET     | `/settings/auto-confirm`         | Admin | Paramètres de confirmation auto       |
| PUT     | `/settings/auto-confirm`         | Admin | Mettre à jour paramètres auto-confirm |
| POST    | `/settings/auto-confirm/trigger` | Admin | Déclencher confirmation auto          |

### Codes de Réponse

- **200** - Succès
- **201** - Créé avec succès
- **400** - Requête invalide
- **401** - Non authentifié
- **403** - Non autorisé
- **404** - Ressource non trouvée
- **409** - Conflit (email déjà utilisé, etc.)
- **429** - Trop de requêtes (rate limiting)
- **500** - Erreur serveur

### Exemples de Requêtes

#### Connexion Utilisateur

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Créer une Réservation

```bash
POST /api/orders
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "productId": 1,
  "checkIn": "2024-07-15",
  "checkOut": "2024-07-20",
  "guests": 4
}
```

## Structure du Projet

```
shu-no/
├── backend/                          # API Backend
│   ├── src/
│   │   ├── config/                   # Configuration (DB, Logger)
│   │   ├── controllers/              # Contrôleurs API
│   │   ├── entities/                 # Entités TypeORM
│   │   ├── middleware/               # Middleware Express
│   │   ├── migrations/               # Migrations DB
│   │   ├── repositories/             # Patterns Repository
│   │   ├── routes/                   # Définition des routes
│   │   ├── scripts/                  # Scripts utilitaires
│   │   ├── services/                 # Logique métier
│   │   └── app.ts                    # Application Express
│   ├── package.json
│   └── tsconfig.json
├── src/                              # Frontend React
│   ├── components/                   # Composants React
│   │   ├── ui/                       # Composants UI réutilisables
│   │   └── ...
│   ├── hooks/                        # Hooks personnalisés
│   ├── lib/                          # Utilitaires
│   ├── pages/                        # Pages/Components de routes
│   ├── hooks/                        # Hooks React personnalisés
│   └── ...
├── public/                           # Assets statiques
├── scripts/                          # Scripts de build/déploiement
├── package.json
├── vite.config.ts                    # Configuration Vite
├── tailwind.config.ts               # Configuration Tailwind
└── README.md
```

## Développement

### Scripts Disponibles

#### Frontend

```bash
npm run dev          # Démarrage développement avec HMR
npm run build        # Build production
npm run preview      # Prévisualisation build
npm run lint         # Linting ESLint
npm run test         # Tests Vitest
npm run test:ui      # Interface graphique tests
```

#### Backend

```bash
npm run dev          # Démarrage avec nodemon
npm run build        # Compilation TypeScript
npm run start        # Démarrage production
npm run test         # Tests Jest
npm run create-admin # Créer compte admin
```

### Conventions de Code

#### Nommage

- **Fichiers** : PascalCase pour composants, camelCase pour utilitaires
- **Composants** : PascalCase, suffixe descriptif
- **Hooks** : Préfixe `use`, camelCase
- **Types** : PascalCase, suffixe descriptif (ex: `UserData`)

#### Structure des Composants

```tsx
interface ComponentProps {
  // Props typées
}

const ComponentName = ({ prop1, prop2 }: ComponentProps) => {
  // Logique du composant

  return (
    // JSX
  );
};

export default ComponentName;
```

#### Gestion d'État

- **Locale** : `useState` pour état simple
- **Globale** : React Query pour données serveur
- **Formulaires** : React Hook Form + Zod

### Tests

#### Frontend (Vitest + React Testing Library)

```bash
# Tests unitaires
npm run test

# Tests avec interface graphique
npm run test:ui

# Couverture de code
npm run test:coverage
```

#### Backend (Jest + Supertest)

```bash
cd backend
npm run test
npm run test:coverage
```

### Debugging

#### Logs Backend

```bash
# Logs d'erreur
npm run logs:error

# Logs application
npm run logs:app
```

#### Debugging Frontend

- React DevTools pour composants
- Redux DevTools si nécessaire
- Console du navigateur pour debugging

## Déploiement

### Variables d'Environnement Production

```bash
# backend/.env.production
NODE_ENV=production
PORT=3001
DB_HOST=your-prod-db-host
DB_PORT=5432
DB_USERNAME=your-prod-username
DB_PASSWORD=your-prod-password
DB_NAME=shu_no_prod

JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d

# Sécurité renforcée
DB_SSL_REJECT_UNAUTHORIZED=true
DB_POOL_MAX=20
DB_POOL_MIN=5
```

### Build et Déploiement

1. **Build Frontend**

   ```bash
   npm run build
   ```

2. **Build Backend**

   ```bash
   cd backend
   npm run build
   ```

3. **Migration Base de Données**
   ```bash
   cd backend
   npm run start:prod  # Exécute automatiquement les migrations
   ```

### Configuration Serveur

#### Nginx (Exemple)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (SPA)
    location / {
        root /path/to/shu-no/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Docker (Optionnel)

```dockerfile
# Dockerfile.backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## Sécurité

### Mesures Implémentées

- **Helmet** : Headers de sécurité HTTP
- **CORS** : Contrôle des origines cross-domain
- **Rate Limiting** : Protection contre les attaques par déni de service
- **Input Sanitization** : Protection contre XSS
- **JWT** : Authentification stateless sécurisée
- **bcrypt** : Hashage sécurisé des mots de passe
- **Validation** : Validation stricte des entrées avec express-validator
- **Logging** : Audit trail complet des actions

### Bonnes Pratiques

- Jamais de données sensibles en frontend
- Validation côté serveur prioritaire
- Sanitisation de toutes les entrées utilisateur
- Utilisation de HTTPS en production
- Rotation régulière des secrets JWT

## Monitoring et Maintenance

### Métriques à Surveiller

- **Performance** : Temps de réponse API, temps de chargement pages
- **Erreurs** : Taux d'erreur, logs d'erreur
- **Utilisation** : Nombre d'utilisateurs actifs, réservations
- **Base de données** : Connexions, requêtes lentes

### Tâches de Maintenance

- **Sauvegarde** : Backup régulier de la base de données
- **Mises à jour** : Dépendances de sécurité
- **Logs** : Rotation et archivage des logs
- **Performance** : Optimisation des requêtes lentes

## Support et Contribution

### Signaler un Bug

1. Vérifier les logs d'erreur
2. Reproduire le problème
3. Ouvrir une issue avec les détails

### Contribuer

1. Fork le repository
2. Créer une branche feature
3. Commits descriptifs
4. Pull request avec description

### Contact

- **Email** : support@shu-no.com
- **Documentation** : [Lien vers docs détaillées]
- **Issues** : [Lien vers GitHub Issues]

---

**Version** : 1.0.0  
**Dernière mise à jour** : 4 novembre 2025

## Contribution

Ce projet étant développé dans le cadre d'un stage DWWM, les contributions externes ne sont pas acceptées pour le moment. Cependant, les retours et suggestions sont les bienvenus.

## Contact

- **Stagiaire :** Aurélien Thébault
- **Formation :** Développeur Web et Web Mobile (DWWM) - AFPA Brest
- **Email :** [contact via GitHub]
- **Entreprise :** Shu-no

## Licence

Ce projet est développé dans le cadre d'un stage professionnel. Tous droits réservés à Shu-no.

---

_Projet de stage DWWM - AFPA Brest 2025_

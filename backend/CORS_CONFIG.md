# 🌐 Configuration CORS - Backend

> **Cross-Origin Resource Sharing pour sécuriser les requêtes inter-domaines**

---

## 📋 Vue d'Ensemble

### Objectif

Configurer CORS (Cross-Origin Resource Sharing) pour permettre au frontend React (localhost:5173 en dev, shu-no.fr en prod) de communiquer avec le backend Express tout en maintenant la sécurité.

### Problématique

Par défaut, les navigateurs bloquent les requêtes HTTP provenant d'une origine différente (protocole, domaine ou port différent) pour des raisons de sécurité. CORS permet de définir quelles origines sont autorisées.

### Solution

- Middleware `cors` avec whitelist d'origines
- Configuration différente par environnement
- Headers sécurisés pour credentials (cookies JWT)

---

## 🛠️ Configuration

### Installation

```bash
npm install cors
npm install --save-dev @types/cors
```

### Configuration de base

**`backend/src/config/cors.config.ts`**

```typescript
import { CorsOptions } from 'cors';

/**
 * Liste blanche des origines autorisées par environnement
 */
const allowedOrigins = {
  development: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Alternative React
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ],

  production: [
    'https://shu-no.fr', // Production frontend
    'https://www.shu-no.fr', // Avec www
    'https://api.shu-no.fr', // API subdomain
  ],
};

/**
 * Configuration CORS sécurisée
 */
export const corsConfig: CorsOptions = {
  // Fonction pour vérifier l'origine
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const env = process.env.NODE_ENV || 'development';
    const whitelist = allowedOrigins[env];

    // Autoriser les requêtes sans origin (Postman, curl, mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    // Vérifier si l'origine est dans la whitelist
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin} not allowed`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },

  // Autoriser les credentials (cookies, JWT)
  credentials: true,

  // Méthodes HTTP autorisées
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Headers autorisés dans les requêtes
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],

  // Headers exposés dans les réponses
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization',
    'X-Total-Count',
    'X-Page',
    'X-Per-Page',
  ],

  // Durée de cache preflight (24h)
  maxAge: 86400,

  // Activer pour anciennes versions de browsers
  preflightContinue: false,

  // HTTP status pour preflight success
  optionsSuccessStatus: 204,
};
```

### Application du middleware

**`backend/src/app.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import { corsConfig } from './config/cors.config';

const app = express();

// CORS middleware (AVANT les routes)
app.use(cors(corsConfig));

// Alternative: CORS simple pour développement rapide
// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true
// }));

// Routes...
app.use('/api', routes);

export default app;
```

---

## 🔒 Sécurité Avancée

### Configuration par route

```typescript
import { Router } from 'express';
import cors from 'cors';

const router = Router();

// CORS spécifique pour routes publiques
router.get(
  '/public/properties',
  cors({
    origin: '*', // Autoriser toutes les origines
    credentials: false,
  }),
  getPublicProperties
);

// CORS restreint pour routes admin
router.post(
  '/admin/properties',
  cors({
    origin: ['https://admin.shu-no.fr'],
    credentials: true,
    methods: ['POST', 'PUT', 'DELETE'],
  }),
  authenticateAdmin,
  createProperty
);

export default router;
```

### CORS avec authentification JWT

**Problème:** Les cookies `HttpOnly` nécessitent `credentials: true`

```typescript
// Configuration frontend (React)
// src/config/axios.config.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // IMPORTANT pour envoyer cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

```typescript
// Configuration backend (Express)
// Déjà configuré dans corsConfig avec credentials: true
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true, // Accepter les cookies
  })
);
```

---

## 🧪 Tests de Validation

### Test Preflight (OPTIONS)

```typescript
import request from 'supertest';
import app from '../app';

describe('CORS Configuration', () => {
  const allowedOrigin = 'http://localhost:5173';
  const forbiddenOrigin = 'https://malicious-site.com';

  describe('Preflight Requests', () => {
    it('should accept preflight from allowed origin', async () => {
      const response = await request(app)
        .options('/api/properties')
        .set('Origin', allowedOrigin)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe(allowedOrigin);
      expect(response.headers['access-control-allow-methods']).toContain('POST');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should reject preflight from forbidden origin', async () => {
      await request(app)
        .options('/api/properties')
        .set('Origin', forbiddenOrigin)
        .set('Access-Control-Request-Method', 'POST')
        .expect(500); // CORS error
    });
  });

  describe('Actual Requests', () => {
    it('should allow GET from allowed origin', async () => {
      const response = await request(app)
        .get('/api/properties')
        .set('Origin', allowedOrigin)
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe(allowedOrigin);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should allow POST with credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Origin', allowedOrigin)
        .send({ email: 'test@example.com', password: 'password' })
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe(allowedOrigin);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should block requests from forbidden origin', async () => {
      await request(app).get('/api/properties').set('Origin', forbiddenOrigin).expect(500);
    });
  });

  describe('Headers', () => {
    it('should expose custom headers', async () => {
      const response = await request(app)
        .get('/api/properties')
        .set('Origin', allowedOrigin)
        .expect(200);

      const exposedHeaders = response.headers['access-control-expose-headers'];
      expect(exposedHeaders).toContain('X-Total-Count');
      expect(exposedHeaders).toContain('Authorization');
    });

    it('should cache preflight for 24h', async () => {
      const response = await request(app)
        .options('/api/properties')
        .set('Origin', allowedOrigin)
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      expect(response.headers['access-control-max-age']).toBe('86400');
    });
  });
});
```

---

## 🐛 Debugging CORS

### Problèmes Courants

#### 1. **CORS error malgré configuration correcte**

**Symptôme:**

```
Access to fetch at 'http://localhost:5001/api/properties' from origin
'http://localhost:5173' has been blocked by CORS policy
```

**Solutions:**

```typescript
// ✅ Vérifier l'ordre des middlewares
app.use(cors(corsConfig)); // AVANT les routes
app.use('/api', routes);

// ✅ Vérifier credentials côté client
axios.create({
  withCredentials: true, // Important!
});

// ✅ Vérifier NODE_ENV
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Allowed origins:', allowedOrigins[process.env.NODE_ENV]);
```

#### 2. **Cookies non envoyés**

**Symptôme:** JWT dans cookie n'est pas inclus dans les requêtes

**Solutions:**

```typescript
// Backend: credentials true
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true, // ✅
  })
);

// Frontend: withCredentials true
axios.create({
  withCredentials: true, // ✅
});

// Cookie HttpOnly, Secure, SameSite
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', // ✅ Important pour CORS
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

#### 3. **Preflight OPTIONS échoue**

**Symptôme:** Requêtes OPTIONS retournent 404

**Solutions:**

```typescript
// Gérer OPTIONS globalement
app.options('*', cors(corsConfig));

// Ou par route
router.options('/api/properties', cors());
router.post('/api/properties', createProperty);
```

### Logs de Debug

```typescript
// middleware/cors-debug.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const corsDebug = (req: Request, res: Response, next: NextFunction) => {
  console.log('🌐 CORS Debug:', {
    method: req.method,
    origin: req.headers.origin,
    path: req.path,
    isPreflight: req.method === 'OPTIONS',
    headers: {
      origin: req.headers.origin,
      'access-control-request-method': req.headers['access-control-request-method'],
      'access-control-request-headers': req.headers['access-control-request-headers'],
    },
  });

  next();
};

// Usage en développement uniquement
if (process.env.NODE_ENV === 'development') {
  app.use(corsDebug);
}
```

---

## 📊 Configuration par Environnement

### Variables d'environnement

**`.env.development`**

```bash
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**`.env.production`**

```bash
NODE_ENV=production
FRONTEND_URL=https://shu-no.fr
ALLOWED_ORIGINS=https://shu-no.fr,https://www.shu-no.fr
```

### Configuration dynamique

```typescript
// config/cors.config.ts
export const getCorsOrigins = (): string[] => {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'production') {
    return process.env.ALLOWED_ORIGINS?.split(',') || ['https://shu-no.fr'];
  }

  return ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
};

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const whitelist = getCorsOrigins();

    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: ${origin} not allowed`));
    }
  },
  credentials: true,
};
```

---

## 🎯 Bonnes Pratiques

### ✅ À FAIRE

1. **Whitelist stricte** en production (jamais `origin: '*'`)
2. **Credentials true** uniquement si nécessaire (cookies, JWT)
3. **Méthodes limitées** selon besoin (pas ALL en prod)
4. **Headers exposés** uniquement ceux nécessaires
5. **Cache preflight** 24h (performance)
6. **Logs en développement** pour debugging
7. **Tests automatisés** de CORS

### ❌ À ÉVITER

1. ❌ `origin: '*'` avec `credentials: true` (impossible)
2. ❌ Whitelist trop permissive en production
3. ❌ Oublier `withCredentials: true` côté frontend
4. ❌ `SameSite: strict` avec CORS (bloque cookies)
5. ❌ Exposer headers sensibles (`Set-Cookie`, etc.)
6. ❌ Désactiver CORS en production (insécure)

---

## 📈 Métriques

### Headers de Réponse (Production)

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://shu-no.fr
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: Content-Length, X-Total-Count, Authorization
Vary: Origin
```

### Performances Preflight

```yaml
Requête OPTIONS (Preflight):
  - Durée: ~10ms
  - Cache: 24h (86400s)
  - Répétition: Uniquement après expiration cache

Impact:
  - Première requête: +10ms
  - Requêtes suivantes (24h): 0ms (cache navigateur)
  - Overhead négligeable
```

---

## 🔧 Configuration Nginx (Proxy)

**`nginx.conf`** (si backend derrière Nginx)

```nginx
server {
    listen 80;
    server_name api.shu-no.fr;

    location / {
        # Proxy vers backend Express
        proxy_pass http://backend:5001;

        # Headers CORS (si non géré par Express)
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Authorization' always;

        # Preflight
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Max-Age' 86400;
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain';
            return 204;
        }

        # Proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## ✅ Checklist d'Implémentation

- [x] Installer package `cors`
- [x] Créer `cors.config.ts` avec whitelist
- [x] Configurer `credentials: true`
- [x] Définir méthodes autorisées
- [x] Configurer headers exposés
- [x] Cache preflight 24h
- [x] Variables d'environnement
- [x] Tests automatisés CORS
- [x] Debug logging (dev only)
- [x] Documentation complète
- [x] Vérification production

---

## 📚 Ressources

- [CORS MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [npm: cors](https://www.npmjs.com/package/cors)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)

---

**Implémenté:** Sprint 1 - Sécurité  
**Status:** ✅ Production depuis 25/08/2025  
**Sécurité:** Whitelist stricte, credentials sécurisés  
**Performance:** Cache preflight 24h

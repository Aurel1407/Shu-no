import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Application } from 'express';
import { logWarn } from '../config/logger';

/**
 * Configuration de sécurité pour l'application Express
 */
export const configureSecurityMiddleware = (app: Application) => {
  // Protection des headers HTTP avec Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:*", "https://api.mapbox.com"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  // Rate limiting - limite le nombre de requêtes par IP
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Plus permissif en développement
    message: {
      error: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.'
    },
    standardHeaders: true, // Retourne les headers de rate limit
    legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
    skip: (req) => {
      // Désactiver complètement le rate limiting en développement si DEBUG_DISABLE_RATE_LIMIT=true
      return process.env.NODE_ENV === 'development' && process.env.DEBUG_DISABLE_RATE_LIMIT === 'true';
    }
  });

  // Rate limiting plus strict pour les routes d'authentification
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limite à 5 tentatives de connexion par IP par fenêtre
    message: {
      error: 'Trop de tentatives de connexion, réessayez dans 15 minutes.'
    },
    skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies
  });

  // Appliquer le rate limiting général
  app.use('/api/', limiter);
  
  // Rate limiting spécifique pour l'authentification
  app.use('/api/auth/login', authLimiter);
  app.use('/api/users/register', authLimiter);
  
  // Rate limiting spécifique pour le formulaire de contact
  app.use('/api/contact', contactLimiter);

  // Middlewares de sécurité configurés avec succès
};

/**
 * Rate limiter spécifique pour le formulaire de contact
 * Limite à 10 soumissions par heure par IP pour éviter le spam
 */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // Max 10 soumissions par heure
  message: {
    error: 'Trop de messages envoyés. Veuillez réessayer dans une heure.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Désactiver en développement si DEBUG_DISABLE_RATE_LIMIT=true
    return process.env.NODE_ENV === 'development' && process.env.DEBUG_DISABLE_RATE_LIMIT === 'true';
  }
});

/**
 * Configuration CORS sécurisée avec allowlist stricte
 */
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Liste blanche des origines autorisées
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Alternative dev
      'http://localhost:5174', // Alternative Vite
      'https://shu-no.fr', // Production
      'https://www.shu-no.fr', // Production avec www
      // Ajoutez ici vos autres domaines de production
    ];

    // Autoriser les requêtes sans origin (Postman, apps mobiles, curl)
    if (!origin) {
      return callback(null, true);
    }

    // Vérifier si l'origine est dans la liste blanche
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log l'origine bloquée pour debug
      logWarn('CORS request blocked', { origin, allowedOrigins });
      callback(new Error('Non autorisé par la politique CORS'));
    }
  },
  credentials: true, // Permettre les cookies
  optionsSuccessStatus: 200, // Support des navigateurs legacy
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-Csrf-Token',
    'X-CSRF-Token',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Csrf-Token']
};

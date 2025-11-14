import 'reflect-metadata';
// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

// Validate environment variables before continuing
import { validateEnvironmentVariables, logEnvironmentSummary } from './config/env-validation';
validateEnvironmentVariables();
logEnvironmentSummary();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import { AppDataSource } from './config/database';
import redisManager from './config/redis';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import settingsRoutes from './routes/settingsRoutes';
import pricePeriodRoutes from './routes/pricePeriodRoutes';
import contactRoutes from './routes/contactRoutes';
import { configureSecurityMiddleware, corsOptions } from './middleware/security';
import { sanitizeInput } from './middleware/validation';
import { morganStream, logError, logInfo, logWarn } from './config/logger';
import { errorHandler, notFoundHandler, setupGlobalErrorHandlers } from './middleware/errorHandler';
import { setupSwagger } from './config/swagger';
import { csrfProtection, csrfTokenMiddleware, getCSRFToken } from './middleware/csrf';
import { ScheduledTasks } from './utils/ScheduledTasks';
import { startCacheCleanup } from './services/CacheService';

// Configurer les gestionnaires d'erreurs globaux
setupGlobalErrorHandlers();

// Démarrer le nettoyage automatique du cache (toutes les 10 minutes)
startCacheCleanup();

const app = express();
const PORT = Number(process.env.PORT) || 3002;

// Configuration de la sécurité (doit être en premier)
configureSecurityMiddleware(app);

// Compression des réponses HTTP (gzip/brotli)
// Doit être placé tôt dans la chaîne de middlewares
app.use(
  compression({
    // Niveau de compression : 6 est un bon compromis entre vitesse et taux de compression
    level: 6,
    // Seuil minimum pour compresser (en bytes) - ignorer les petites réponses
    threshold: 1024, // 1KB
    // Filtrer les types de contenu à compresser
    filter: (req, res) => {
      // Ne pas compresser les réponses déjà compressées
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Utiliser le filtre par défaut de compression
      return compression.filter(req, res);
    },
  })
);

// Middleware de logging HTTP
app.use(morgan('combined', { stream: morganStream }));

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limite la taille des requêtes JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitisation des entrées
app.use(sanitizeInput);

// Protection CSRF
app.use(csrfTokenMiddleware); // Ajoute le token CSRF aux réponses
app.use('/api', csrfProtection); // Protège les routes API state-changing

// Route pour obtenir un token CSRF
app.get('/api/csrf-token', getCSRFToken);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/price-periods', pricePeriodRoutes);
app.use('/api/contacts', contactRoutes);

// Configuration Swagger
setupSwagger(app);

// Health check
app.get('/api/health', (req, res) => {
  logInfo('Health check requested', { ip: req.ip, userAgent: req.get('User-Agent') });
  res.json({
    status: 'OK',
    message: 'Shu-no API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Log all requests (en développement seulement) - DÉSACTIVÉ pour éviter le spam
// En mode développement, nous gardons seulement les logs d'erreurs importants
if (process.env.NODE_ENV === 'development' && process.env.DEBUG_REQUESTS === 'true') {
  app.use('*', (req, res, next) => {
    logInfo(`${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    next();
  });
}

// Middleware pour les routes non trouvées (doit être AVANT le gestionnaire d'erreurs)
app.use(notFoundHandler);

// Gestionnaire d'erreurs centralisé (doit être en DERNIER)
app.use(errorHandler);

// Initialize database and start server (only in non-test environments)
if (process.env.NODE_ENV !== 'test') {
  let scheduledTasks: ScheduledTasks;

  AppDataSource.initialize()
    .then(async () => {
      logInfo('Database connection established successfully');

      // Initialize Redis connection (non-blocking)
      redisManager.connect().catch((error) => {
        logWarn('Redis connection failed, continuing without cache', { error: error.message });
      });

      // Démarrer les tâches programmées
      scheduledTasks = new ScheduledTasks();
      scheduledTasks.startAll();

      logInfo('Starting server...');

      const server = app.listen(PORT, '0.0.0.0', () => {
        logInfo(`Server is running on port ${PORT}`);
        logInfo(`Health check available at: http://localhost:${PORT}/api/health`);
        logInfo(`Server listening on all interfaces (0.0.0.0:${PORT})`);
        logInfo('Environment:', {
          nodeEnv: process.env.NODE_ENV || 'development',
          port: PORT,
          dbHost: process.env.DB_HOST,
          dbName: process.env.DB_NAME,
        });
      });

      server.on('error', (error: Error) => {
        logError(error, { context: 'Server startup error' });
      });

      // Graceful shutdown
      const gracefulShutdown = (signal: string) => {
        logInfo(`Received ${signal}. Shutting down gracefully...`);

        // Arrêter les tâches programmées
        scheduledTasks.stopAll();

        server.close(async () => {
          logInfo('HTTP server closed.');

          // Close Redis connection
          await redisManager.disconnect();

          AppDataSource.destroy()
            .then(() => {
              logInfo('Database connection closed.');
              process.exit(0);
            })
            .catch((error) => {
              logError(error, { context: 'Database connection close error' });
              process.exit(1);
            });
        });
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    })
    .catch((error) => {
      logError(error, { context: 'Database initialization error' });
      process.exit(1);
    });
}

export default app;

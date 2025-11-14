import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { TestDataSource } from './test-database';

// Routes
import userRoutes from '../routes/userRoutes';
import productRoutes from '../routes/productRoutes';
import orderRoutes from '../routes/orderRoutes';
import settingsRoutes from '../routes/settingsRoutes';
import pricePeriodRoutes from '../routes/pricePeriodRoutes';
import contactRoutes from '../routes/contactRoutes';

// Middleware
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';

const app = express();

// Middleware de sécurité pour les tests
app.use(helmet({
  contentSecurityPolicy: false, // Désactivé pour les tests
}));

app.use(cors({
  origin: true, // Permettre toutes les origines en test
  credentials: true,
}));

// Rate limiting léger pour les tests
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // beaucoup de requêtes autorisées pour les tests
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Override AppDataSource avec TestDataSource pour les tests
// Cette astuce permet à l'app d'utiliser la base de test
const originalAppDataSource = require('../config/database').AppDataSource;
if (originalAppDataSource) {
  Object.setPrototypeOf(originalAppDataSource, TestDataSource);
  Object.assign(originalAppDataSource, TestDataSource);
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/price-periods', pricePeriodRoutes);
app.use('/api/contacts', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Test API is running',
    timestamp: new Date().toISOString(),
  });
});

// Middleware pour les routes non trouvées (doit être AVANT le gestionnaire d'erreurs)
app.use(notFoundHandler);

// Gestionnaire d'erreurs centralisé (doit être en DERNIER)
app.use(errorHandler);

export { app as testApp };

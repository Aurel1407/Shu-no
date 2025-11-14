import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { logInfo } from './logger';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shu-no API',
      version: '1.0.0',
      description: 'API REST pour la plateforme de location de propriétés Shu-no',
      contact: {
        name: 'Shu-no Support',
        email: 'support@shu-no.com'
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://api.shu-no.com'
          : `http://localhost:${process.env.PORT || 3002}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Villa avec piscine' },
            description: { type: 'string', example: 'Magnifique villa avec piscine privée' },
            price: { type: 'number', format: 'float', example: 150.00 },
            location: { type: 'string', example: 'Nice, France' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            productId: { type: 'integer', example: 1 },
            checkIn: { type: 'string', format: 'date', example: '2024-07-15' },
            checkOut: { type: 'string', format: 'date', example: '2024-07-22' },
            guests: { type: 'integer', example: 4 },
            totalAmount: { type: 'number', format: 'float', example: 1050.00 },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'], example: 'confirmed' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Contact: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            firstName: { type: 'string', example: 'Jean' },
            lastName: { type: 'string', example: 'Dupont' },
            email: { type: 'string', format: 'email', example: 'jean.dupont@example.com' },
            subject: { type: 'string', example: 'Demande de renseignements' },
            message: { type: 'string', example: 'Bonjour, je souhaiterais plus d\'informations...' },
            isRead: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Erreur de validation' },
            message: { type: 'string', example: 'Les données fournies sont invalides' },
            statusCode: { type: 'integer', example: 400 },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string', example: '/api/users' },
            requestId: { type: 'string', example: 'req-123456' },
            details: { type: 'object' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { type: 'object' },
            },
            pagination: {
              type: 'object',
              properties: {
                currentPage: { type: 'integer', example: 1 },
                totalPages: { type: 'integer', example: 5 },
                totalItems: { type: 'integer', example: 50 },
                itemsPerPage: { type: 'integer', example: 10 },
                hasNextPage: { type: 'boolean', example: true },
                hasPreviousPage: { type: 'boolean', example: false },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Chemins vers les fichiers avec les annotations Swagger
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Application) => {
  // Route pour la documentation Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Route pour obtenir la spécification OpenAPI en JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  logInfo('📚 Documentation API disponible sur /api-docs');
};

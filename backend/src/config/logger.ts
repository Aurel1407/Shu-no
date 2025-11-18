import winston from 'winston';
import path from 'path';

// Définir le niveau de log selon l'environnement
const logLevel =
  process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Configuration des formats
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Format pour la console (développement)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (stack) {
      log += `\n${stack}`;
    }

    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Créer le dossier logs s'il n'existe pas
const logDir = path.join(process.cwd(), 'logs');

// Configuration des transports
const transports: winston.transport[] = [];

// Console pour le développement
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: logLevel,
      format: consoleFormat,
    })
  );
}

// Fichiers pour la production
if (process.env.NODE_ENV === 'production') {
  // Log général
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      level: 'info',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Log des erreurs
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Console en production aussi (mais moins verbose)
  transports.push(
    new winston.transports.Console({
      level: 'warn',
      format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
    })
  );
}

// Créer le logger
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  exitOnError: false, // Ne pas quitter le processus sur une erreur
  // Gérer les exceptions non capturées
  exceptionHandlers:
    process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
            format: logFormat,
          }),
        ]
      : [
          new winston.transports.Console({
            format: consoleFormat,
          }),
        ],
  // Gérer les rejections de promesses non capturées
  rejectionHandlers:
    process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: path.join(logDir, 'rejections.log'),
            format: logFormat,
          }),
        ]
      : [
          new winston.transports.Console({
            format: consoleFormat,
          }),
        ],
});

// Stream pour Morgan (logs HTTP)
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim(), { service: 'http' });
  },
};

// Fonctions utilitaires pour le logging
export const logError = (error: Error, context?: unknown) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const logInfo = (message: string, meta?: unknown) => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta?: unknown) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: unknown) => {
  logger.debug(message, meta);
};

// Log de démarrage
if (process.env.NODE_ENV !== 'test') {
  logger.info('Logger configured', {
    level: logLevel,
    environment: process.env.NODE_ENV || 'development',
    transports: transports.map((t) => t.constructor.name),
  });
}

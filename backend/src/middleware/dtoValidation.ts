import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { logWarn } from '../config/logger';

interface FormattedError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Middleware de validation utilisant class-validator
 * Applique automatiquement les validations définies dans les DTOs
 */
export function validateDto<T extends object>(dtoClass: ClassConstructor<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Transformer le body en instance de la classe DTO
      const dto = plainToInstance(dtoClass, req.body);

      // Valider l'instance
      const errors: ValidationError[] = await validate(dto, {
        whitelist: true, // Supprime les propriétés non définies dans le DTO
        forbidNonWhitelisted: true, // Rejette les propriétés non autorisées
        validationError: {
          target: false, // N'inclut pas l'objet target dans l'erreur
          value: false, // N'inclut pas la valeur dans l'erreur (sécurité)
        },
      });

      if (errors.length > 0) {
        // Formater les erreurs pour une réponse user-friendly
        const formattedErrors = formatValidationErrors(errors);

        logWarn('Validation failed', {
          endpoint: req.originalUrl,
          method: req.method,
          errors: formattedErrors,
          ip: req.ip,
        });

        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          message: 'Les données fournies ne respectent pas les contraintes de validation',
          details: formattedErrors,
        });
      }

      // Remplacer le body par l'instance transformée et validée
      req.body = dto;
      next();
    } catch (error) {
      logWarn('DTO validation middleware error', {
        error: error instanceof Error ? error.message : String(error),
        endpoint: req.originalUrl,
      });

      return res.status(500).json({
        success: false,
        error: 'Erreur de validation',
        message: 'Une erreur est survenue lors de la validation des données',
      });
    }
  };
}

/**
 * Formate les erreurs de validation en structure lisible
 */
function formatValidationErrors(errors: ValidationError[]): FormattedError[] {
  const formattedErrors: FormattedError[] = [];

  function processError(error: ValidationError, parentField = '') {
    const field = parentField ? `${parentField}.${error.property}` : error.property;

    if (error.constraints) {
      // Erreurs de contraintes directes
      for (const message of Object.values(error.constraints)) {
        formattedErrors.push({
          field,
          message,
          value: error.value,
        });
      }
    }

    // Traiter les erreurs imbriquées (objets et tableaux)
    if (error.children && error.children.length > 0) {
      for (const childError of error.children) {
        processError(childError, field);
      }
    }
  }

  for (const error of errors) {
    processError(error);
  }
  return formattedErrors;
}

/**
 * Middleware spécialisé pour les paramètres d'URL
 * Valide les paramètres comme les IDs
 */
export function validateParams(validationRules: {
  [key: string]: (value: string) => boolean | string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ field: string; message: string; value: string }> = [];

    for (const [param, validator] of Object.entries(validationRules)) {
      const value = req.params[param];
      const result = validator(value);

      if (result !== true) {
        errors.push({
          field: param,
          message: typeof result === 'string' ? result : `Paramètre ${param} invalide`,
          value,
        });
      }
    }

    if (errors.length > 0) {
      logWarn('Parameter validation failed', {
        endpoint: req.originalUrl,
        method: req.method,
        errors,
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        error: 'Paramètres invalides',
        message: 'Les paramètres fournis ne sont pas valides',
        details: errors,
      });
    }

    next();
  };
}

/**
 * Validateurs courants pour les paramètres
 */
export const paramValidators = {
  id: (value: string) => {
    const numValue = Number(value);
    if (Number.isNaN(numValue) || numValue <= 0 || !Number.isInteger(numValue)) {
      return "L'ID doit être un nombre entier positif";
    }
    return true;
  },

  slug: (value: string) => {
    if (typeof value !== 'string' || !/^[a-z0-9-]+$/.test(value)) {
      return 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets';
    }
    return true;
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value !== 'string' || !emailRegex.test(value)) {
      return 'Format email invalide';
    }
    return true;
  },
};

import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Configurer DOMPurify pour le côté serveur
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as any);

/**
 * Middleware pour gérer les erreurs de validation
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Données invalides',
      details: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    });
  }
  
  next();
};

/**
 * Validation pour la création d'utilisateur
 */
export const validateCreateUser: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email valide requis'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces et tirets'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces et tirets'),
];

/**
 * Validation pour la connexion
 */
export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email valide requis'),
  
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis'),
];

/**
 * Validation pour la mise à jour d'utilisateur
 */
export const validateUpdateUser: ValidationChain[] = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email valide requis'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces et tirets'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces et tirets'),
];

/**
 * Validation pour les paramètres ID
 */
export const validateId: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID valide requis'),
];

/**
 * Validation pour les produits
 */
export const validateCreateProduct: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La localisation doit contenir entre 2 et 100 caractères'),
];

/**
 * Validation pour la mise à jour de produits
 */
export const validateUpdateProduct: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La localisation doit contenir entre 2 et 100 caractères'),
];

/**
 * Nettoyage et sanitisation des données
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Nettoyer les champs texte
  const sanitizeField = (value: any): any => {
    if (typeof value === 'string') {
      // Nettoyer et supprimer les balises HTML malveillantes
      const cleaned = DOMPurify.sanitize(value.trim(), { 
        ALLOWED_TAGS: [], // Supprimer toutes les balises HTML
        ALLOWED_ATTR: [] // Supprimer tous les attributs
      });
      return cleaned;
    }
    if (Array.isArray(value)) {
      // Traiter les tableaux séparément pour préserver leur structure
      return value.map(item => sanitizeField(item));
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeField(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  req.body = sanitizeField(req.body);
  req.query = sanitizeField(req.query);
  req.params = sanitizeField(req.params);
  
  next();
};

import { useState, useCallback } from "react";

/**
 * Types de règles de validation
 */
export type ValidationRule<T = unknown> = {
  validate: (value: T) => boolean;
  message: string;
  type?: "error" | "warning";
};

/**
 * État de validation d'un champ
 */
export interface FieldValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * État de validation global
 */
export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  touched: Record<string, boolean>;
}

/**
 * Hook pour la validation de formulaires
 */
export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationRule[]>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  /**
   * Valide un champ spécifique
   */
  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): FieldValidation => {
      const rules = validationRules[field];
      if (!rules) return { isValid: true };

      let error: string | undefined;
      let warning: string | undefined;

      for (const rule of rules) {
        if (!rule.validate(value)) {
          if (rule.type === "warning") {
            warning = rule.message;
          } else {
            error = rule.message;
            break; // Stop at first error
          }
        }
      }

      return {
        isValid: !error,
        error,
        warning,
      };
    },
    [validationRules]
  );

  /**
   * Met à jour un champ et le valide
   */
  const setFieldValue = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      const validation = validateField(field, value);

      setErrors((prev) => ({
        ...prev,
        [field]: validation.error || "",
      }));

      setWarnings((prev) => ({
        ...prev,
        [field]: validation.warning || "",
      }));
    },
    [validateField]
  );

  /**
   * Marque un champ comme touché
   */
  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  /**
   * Valide tous les champs
   */
  const validateAll = useCallback((): FormValidation => {
    const newErrors: Record<string, string> = {};
    const newWarnings: Record<string, string> = {};
    let isValid = true;

    for (const field of Object.keys(validationRules) as Array<keyof T>) {
      const validation = validateField(field, values[field]);

      if (validation.error) {
        newErrors[field as string] = validation.error;
        isValid = false;
      }

      if (validation.warning) {
        newWarnings[field as string] = validation.warning;
      }
    }

    setErrors(newErrors);
    setWarnings(newWarnings);

    return {
      isValid,
      errors: newErrors,
      warnings: newWarnings,
      touched,
    };
  }, [validateField, values, touched, validationRules]);

  /**
   * Réinitialise le formulaire
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
    setWarnings({});
  }, [initialValues]);

  /**
   * Vérifie si le formulaire est valide
   */
  const isValid =
    Object.keys(errors).length === 0 || Object.values(errors).every((error) => !error);

  /**
   * Obtenir les props d'accessibilité pour un champ
   * WCAG 2.1 - 3.3.1 Error Identification
   * 
   * @param field - Nom du champ
   * @param helpTextId - ID optionnel du texte d'aide (ex: "email-help")
   * @returns Props ARIA à spreader sur l'input
   * 
   * @example
   * ```tsx
   * <Input
   *   id="email"
   *   {...getFieldProps('email', 'email-help')}
   * />
   * {errors.email && touched.email && (
   *   <div id="email-error" role="alert">{errors.email}</div>
   * )}
   * ```
   */
  const getFieldProps = useCallback(
    (field: keyof T, helpTextId?: string) => {
      const hasError = touched[field as string] && !!errors[field as string];
      const errorId = `${String(field)}-error`;

      // aria-describedby lie le champ à son texte d'aide ET son message d'erreur
      const describedByIds: string[] = [];
      if (helpTextId) describedByIds.push(helpTextId);
      if (hasError) describedByIds.push(errorId);

      return {
        'aria-invalid': hasError,
        'aria-describedby': describedByIds.length > 0 ? describedByIds.join(' ') : undefined,
      };
    },
    [errors, touched]
  );

  return {
    values,
    touched,
    errors,
    warnings,
    isValid,
    setFieldValue,
    setFieldTouched,
    validateAll,
    reset,
    validateField,
    getFieldProps,
  };
}

/**
 * Règles de validation prédéfinies
 */
export const validationRules = {
  required: (message = "Ce champ est requis"): ValidationRule => ({
    validate: (value: unknown) => value !== null && value !== undefined && value !== "",
    message,
  }),

  email: (message = "Adresse email invalide"): ValidationRule => ({
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || ""),
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => (value || "").length >= min,
    message: message || `Minimum ${min} caractères requis`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => (value || "").length <= max,
    message: message || `Maximum ${max} caractères autorisés`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value: string) => regex.test(value || ""),
    message,
  }),

  numeric: (message = "Valeur numérique requise"): ValidationRule => ({
    validate: (value: unknown) => !Number.isNaN(Number(value)) && !Number.isNaN(Number.parseFloat(String(value))),
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value: number) => value >= min,
    message: message || `Valeur minimum: ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value: number) => value <= max,
    message: message || `Valeur maximum: ${max}`,
  }),

  url: (message = "URL invalide"): ValidationRule => ({
    validate: (value: string) => {
      try {
        new URL(value || "");
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  phone: (message = "Numéro de téléphone invalide"): ValidationRule => ({
    validate: (value: string) =>
      /^[+]?[1-9]\d{0,15}$/.test((value || "").replace(/[\s\-()]/g, "")),
    message,
  }),
};

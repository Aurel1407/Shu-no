export class SettingsService {
  private settings: Map<string, unknown> = new Map();

  constructor() {
    // Initialiser avec des valeurs par défaut
    this.settings.set('autoConfirmEnabled', false);
  }

  async getAutoConfirmSettings(): Promise<{ enabled: boolean }> {
    const enabled = Boolean(this.settings.get('autoConfirmEnabled'));
    return { enabled };
  }

  async updateAutoConfirmSettings(enabled: boolean): Promise<{ enabled: boolean }> {
    this.settings.set('autoConfirmEnabled', enabled);

    // Ici, vous pourriez sauvegarder en base de données si nécessaire
    // Pour l'instant, on garde en mémoire

    return { enabled };
  }

  // Méthode pour vérifier si la confirmation automatique est activée
  isAutoConfirmEnabled(): boolean {
    return Boolean(this.settings.get('autoConfirmEnabled'));
  }
}

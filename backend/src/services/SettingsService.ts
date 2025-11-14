export class SettingsService {
  private settings: Map<string, any> = new Map();

  constructor() {
    // Initialiser avec des valeurs par défaut
    this.settings.set('autoConfirmEnabled', false);
  }

  async getAutoConfirmSettings(): Promise<{ enabled: boolean }> {
    const enabled = this.settings.get('autoConfirmEnabled') || false;
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
    return this.settings.get('autoConfirmEnabled') || false;
  }
}

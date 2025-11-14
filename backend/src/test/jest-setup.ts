import { TestDataSource } from './test-database';

// Mock AppDataSource pour utiliser TestDataSource dans les tests
jest.mock('../config/database', () => ({
  AppDataSource: TestDataSource
}));

// Setup global pour tous les tests
beforeAll(async () => {
  try {
    console.log('🔧 Initialisation de la base de données de test...');

    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
      console.log('✅ Base de données de test initialisée');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}, 30000);

afterAll(async () => {
  try {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
      console.log('🗑️ Connexion à la base de données fermée');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture de la base de données:', error);
  }
});

// Reset database avant chaque test
beforeEach(async () => {
  // Nettoyer la base de données entre chaque test
  if (TestDataSource.isInitialized) {
    const entities = TestDataSource.entityMetadatas;
    
    for (const entity of entities) {
      const repository = TestDataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
});

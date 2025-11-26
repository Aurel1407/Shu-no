# Configuration SonarCloud pour Shu-no

## 📋 Étapes de configuration

### 1. Créer un compte SonarCloud

1. Allez sur [sonarcloud.io](https://sonarcloud.io)
2. Connectez-vous avec votre compte GitHub
3. Autorisez SonarCloud à accéder à vos repositories

### 2. Créer une organisation

1. Dans SonarCloud, cliquez sur "+" → "Create new organization"
2. Sélectionnez votre compte GitHub
3. Choisissez l'organization key : `aurel1407`
4. Validez la création

### 3. Importer le projet

1. Cliquez sur "+" → "Analyze new project"
2. Sélectionnez le repository `Aurel1407/Shu-no`
3. Cliquez sur "Set Up"

### 4. Configurer le token

1. Dans SonarCloud, allez dans "My Account" → "Security"
2. Générez un nouveau token :
   - Name: `Shu-no GitHub Actions`
   - Type: `Global Analysis Token`
3. Copiez le token généré

### 5. Ajouter le secret GitHub

1. Allez dans les settings de votre repo GitHub
2. Accédez à "Secrets and variables" → "Actions"
3. Cliquez sur "New repository secret"
4. Créez un secret :
   - Name: `SONAR_TOKEN`
   - Value: [Collez le token SonarCloud]
5. Sauvegardez

### 6. Désactiver l'analyse automatique

Dans SonarCloud, pour votre projet :

1. Allez dans "Administration" → "Analysis Method"
2. Désactivez "Automatic Analysis"
3. SonarCloud utilisera maintenant l'analyse via GitHub Actions

### 7. Configuration locale (optionnel)

Pour analyser en local sans CI/CD :

```bash
# Installer SonarScanner CLI
npm install -g sonarqube-scanner

# Lancer l'analyse
sonar-scanner \
  -Dsonar.projectKey=Aurel1407_Shu-no \
  -Dsonar.organization=aurel1407 \
  -Dsonar.sources=. \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=YOUR_SONAR_TOKEN
```

## 🚀 Utilisation

### Analyse automatique

L'analyse se lance automatiquement :

- Sur chaque push sur `main` ou `develop`
- Sur chaque pull request
- Via l'action GitHub "workflow_dispatch" (manuelle)

### Voir les résultats

1. Accédez à [sonarcloud.io/project/overview?id=Aurel1407_Shu-no](https://sonarcloud.io/project/overview?id=Aurel1407_Shu-no)
2. Consultez les métriques :
   - Quality Gate (Pass/Fail)
   - Code Coverage
   - Bugs, Vulnerabilities, Code Smells
   - Security Hotspots
   - Duplications
   - Technical Debt

### Pull Request decoration

SonarCloud commentera automatiquement les PR avec :

- Nouveaux bugs détectés
- Nouvelles vulnérabilités
- Couverture du nouveau code
- Quality Gate du nouveau code

## 📊 Badges

Les badges ont été ajoutés au README :

- **Quality Gate** : Pass/Fail global
- **Coverage** : Couverture du code
- **Security Rating** : Note de sécurité (A-E)
- **Reliability Rating** : Note de fiabilité (A-E)

## 🔧 Fichiers de configuration

### `sonar-project.properties`

Configuration principale du projet SonarCloud :

- Clés du projet et de l'organisation
- Chemins des sources et tests
- Chemins des rapports de couverture (LCOV)
- Exclusions de fichiers

### `.github/workflows/ci-cd.yml`

Job `sonarcloud` ajouté dans le pipeline CI/CD :

- Téléchargement des rapports de couverture
- Analyse SonarCloud avec l'action officielle
- Exécution après les tests

### Coverage reporters

**Frontend** : `vite.config.ts` génère maintenant `lcov`
**Backend** : `jest.config.json` génère déjà `lcov`

## 🎯 Métriques cibles

| Métrique           | Cible | Actuel       |
| ------------------ | ----- | ------------ |
| Quality Gate       | Pass  | À configurer |
| Coverage           | > 80% | 88.17%       |
| Security Rating    | A     | À vérifier   |
| Reliability Rating | A     | À vérifier   |
| Maintainability    | A     | À vérifier   |

## ⚠️ Notes importantes

1. **Premier scan** : Le premier scan peut prendre quelques minutes
2. **Coverage** : Assurez-vous que les tests génèrent bien les fichiers `lcov.info`
3. **Secrets** : Ne commitez JAMAIS le `SONAR_TOKEN` dans le code
4. **PR Decoration** : Nécessite que SonarCloud ait accès au repo GitHub

## 📚 Documentation

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [GitHub Actions Integration](https://github.com/SonarSource/sonarcloud-github-action)
- [Analysis Parameters](https://docs.sonarcloud.io/advanced-setup/analysis-parameters/)

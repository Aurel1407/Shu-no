#!/bin/bash

# Script de déploiement pour Shu-no
# Utilisation: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Déploiement $ENVIRONMENT - $TIMESTAMP"

# Fonction de nettoyage en cas d'erreur
cleanup() {
    echo "❌ Erreur lors du déploiement. Nettoyage..."
    # Remettre l'ancienne version si elle existe
    if [ -d "backup_$TIMESTAMP" ]; then
        echo "Restauration de la sauvegarde..."
        rm -rf current
        mv backup_$TIMESTAMP current
    fi
    exit 1
}

trap cleanup ERR

# Créer une sauvegarde de la version actuelle
if [ -d "current" ]; then
    echo "📦 Création sauvegarde..."
    cp -r current backup_$TIMESTAMP
fi

# Cloner/Mettre à jour le code
echo "📥 Téléchargement du code..."
if [ ! -d "repo" ]; then
    git clone https://github.com/Aurel1407/Shu-no.git repo
else
    cd repo
    git fetch origin
    git reset --hard origin/main
    cd ..
fi

# Build du frontend
echo "🔨 Build frontend..."
cd repo
npm ci
npm run build

# Build du backend
echo "🔨 Build backend..."
cd backend
npm ci
npm run build
cd ..

# Migration base de données (uniquement en production)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🗄️ Migration base de données..."
    cd backend
    npm run prepare-prod
    cd ..
fi

# Déploiement atomique
echo "📤 Déploiement..."
rm -rf current
mv repo current

# Redémarrage des services
echo "🔄 Redémarrage services..."
if command -v systemctl &> /dev/null; then
    sudo systemctl restart shu-no-backend
    sudo systemctl restart nginx
elif command -v pm2 &> /dev/null; then
    pm2 restart ecosystem.config.js
else
    # Redémarrage manuel
    pkill -f "node.*app.js" || true
    cd current/backend && npm start &
fi

# Health check
echo "🔍 Vérification santé..."
sleep 10

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Déploiement réussi!"

    # Nettoyer les anciennes sauvegardes (garder les 3 dernières)
    ls -t backup_* 2>/dev/null | tail -n +4 | xargs -r rm -rf

    # Notification (optionnel)
    # curl -X POST -H 'Content-type: application/json' \
    #   --data '{"text":"✅ Déploiement Shu-no '$ENVIRONMENT' réussi"}' \
    #   YOUR_SLACK_WEBHOOK_URL
else
    echo "❌ Health check échoué!"
    cleanup
fi

echo "🎉 Déploiement terminé avec succès!"
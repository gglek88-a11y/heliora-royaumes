# Heliora Mock Backend

Petit backend local sans dependances pour tester le passage du prototype local vers un jeu connecte.

## Lancement

```powershell
node server/mock-backend.mjs
```

Puis dans le jeu, cliquer sur `Cloud sync`.

## Endpoints

- `GET /api/health` : statut du serveur.
- `POST /api/sync` : sauvegarde cloud mock, classement, chat.
- `GET /api/leaderboard` : classement des joueurs synchronises.
- `GET /api/liveops` : configuration liveops serveur.
- `GET /api/content` : pack de contenu complet lu depuis `data/game-content.json`.
- `POST /api/chat` : ajoute un message de chat.

Les donnees sont stockees dans `server/storage/mock-db.json`, genere automatiquement au premier sync.
Le contenu gameplay/liveops editable est dans `data/game-content.json`.

## Limite volontaire

Ce serveur ne remplace pas encore un backend production. Il sert a valider le contrat API, le flux de sauvegarde, le classement et la couche liveops avant de brancher une vraie base de donnees, une authentification et l'anti-triche.

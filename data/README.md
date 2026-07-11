# Pipeline Contenu Heliora

Le jeu charge le contenu dans cet ordre :

1. API mock : `http://127.0.0.1:8787/api/content`
2. Fichier local : `data/game-content.json`
3. Donnees integrees dans `src/main.js`

Cela permet de tester un fonctionnement proche liveops sans bloquer le prototype si le backend n'est pas lance.

## Modifier un event

Editer `liveEvents` dans `game-content.json`, puis recharger la page.

Champs principaux :

- `id` : identifiant stable.
- `name` : nom affiche.
- `goal` : points requis.
- `reward` : ressources gagnees.
- `shopSkin` : skin lie a l'event.
- `description` : texte affiche dans le centre d'evenements.

## Modifier boutique, recherches et artefacts

Les sections `shopItems`, `research` et `artifacts` sont rechargees depuis le meme fichier.

Si une section manque, le jeu garde la version par defaut de `src/main.js`.

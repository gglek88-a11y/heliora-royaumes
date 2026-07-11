# Heliora Royaumes

Prototype web de strategie 4X fantasy.

## Lancer le jeu

Installer Node.js LTS, puis lancer :

```powershell
npm install
npm run dev
```

Si Node a ete installe en version portable dans ce projet :

```powershell
$env:PATH = "$PWD\.tools\node\node-v24.18.0-win-x64;$env:PATH"
npm run dev
```

Le jeu s'ouvre ensuite sur :

```text
http://127.0.0.1:5176/
```

## Lancer le backend mock

Dans un second terminal :

```powershell
npm run backend
```

Puis cliquer sur `Cloud sync` dans le jeu.

## Publier sur GitHub

Installer Git pour Windows, puis depuis ce dossier :

```powershell
git init
git add .
git commit -m "Initial commit Heliora Royaumes"
git branch -M main
git remote add origin https://github.com/VOTRE_COMPTE/heliora-royaumes.git
git push -u origin main
```

Remplacer `VOTRE_COMPTE` par le nom du compte GitHub.

## Fichiers ignores

Le depot ignore volontairement :

- `node_modules/`
- `dist/`
- `server/storage/`
- les logs et fichiers temporaires

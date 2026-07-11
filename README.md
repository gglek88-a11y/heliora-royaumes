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

## Installer en PWA

Le jeu est une PWA. Depuis le lien public GitHub Pages, ouvrir le jeu dans Chrome/Edge mobile ou desktop, puis utiliser le bouton `Installer l'app` quand il apparait.

## Brancher Supabase cloud

Le jeu peut synchroniser sauvegardes, guildes, chat et classement avec Supabase.

1. Creer un projet Supabase.
2. Ouvrir le SQL Editor Supabase.
3. Executer le contenu de `data/supabase-schema.sql`.
4. Copier `Project URL` et `anon public key`.
5. Modifier `data/cloud-config.json` :

```json
{
  "provider": "supabase",
  "apiBaseUrl": "http://127.0.0.1:8787",
  "supabaseUrl": "https://VOTRE-PROJET.supabase.co",
  "supabaseAnonKey": "VOTRE_ANON_PUBLIC_KEY"
}
```

La cle `anon public` Supabase est faite pour le client web. Ne jamais mettre de cle `service_role` dans ce depot.

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

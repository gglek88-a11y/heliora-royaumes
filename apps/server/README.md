# Heliora authoritative server

Serveur minimal pre-alpha. Il ne remplace pas encore toute la logique du jeu, mais il pose la premiere autorite serveur pour:

- profil joueur;
- creation/restauration de royaume;
- ressources;
- actions idempotentes;
- audit log;
- verification de session Supabase via `/auth/v1/user`.

## Lancer en mode developpement local

```powershell
$nodeDir = Join-Path (Get-Location) '.tools\node\node-v24.18.0-win-x64'
$env:PATH = "$nodeDir;$env:PATH"
$env:HELIORA_DEV_AUTH = "true"
npm run server:authoritative
```

En mode `HELIORA_DEV_AUTH=true`, envoyer `X-Dev-User: local-player`.

## Lancer avec Supabase Auth

Configurer:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=sb_publishable_or_anon_public_key
```

Puis appeler les routes avec:

```text
Authorization: Bearer <supabase_access_token>
```

## Routes

- `GET /health`
- `GET /v1/me`
- `POST /v1/profile`
- `POST /v1/kingdom`
- `GET /v1/kingdom`
- `GET /v1/resources`
- `POST /v1/actions`

Actions supportees:

- `claim_starter_cache`
- `upgrade_citadel`

Chaque action sensible exige `idempotencyKey`.

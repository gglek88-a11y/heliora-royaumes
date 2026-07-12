# Heliora authoritative server

Serveur pre-alpha autoritaire. Il ne remplace pas encore toute la logique du jeu, mais il pose la premiere autorite serveur pour:

- profil joueur;
- creation/restauration de royaume;
- ressources;
- actions idempotentes;
- upgrades, entrainement, recompenses, combats, recoltes;
- guildes, invitations, classement et live events;
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

## Stockage Supabase/Postgres

Par defaut, le serveur utilise un fichier local pour faciliter le developpement. Pour utiliser les tables Supabase/Postgres de la migration `20260711010000_authoritative_server.sql`:

```text
HELIORA_STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=sb_publishable_or_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=server_only_service_role_key
```

La cle `SUPABASE_SERVICE_ROLE_KEY` reste strictement cote serveur.

## Routes

- `GET /health`
- `GET /v1/me`
- `POST /v1/profile`
- `POST /v1/kingdom`
- `GET /v1/kingdom`
- `GET /v1/resources`
- `POST /v1/actions`
- `GET /v1/events`
- `GET /v1/leaderboard`
- `GET /v1/guilds`
- `POST /v1/guilds`
- `POST /v1/guilds/:id/join`
- `POST /v1/guilds/:id/invites`

Actions supportees:

- `claim_starter_cache`
- `upgrade_citadel`
- `upgrade_building`
- `train_units`
- `claim_reward`
- `resolve_battle`
- `harvest_return`
- `guild_help`

Chaque action sensible exige `idempotencyKey`.

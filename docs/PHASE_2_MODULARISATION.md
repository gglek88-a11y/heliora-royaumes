# Phase 2 - Modularisation progressive et serveur autoritaire minimal

## Objectif

Commencer la transformation pre-alpha sans casser le client existant.

## Extractions realisees

Modules frontend crees:

- `src/networking/network-client.js`
- `src/storage/index.js`
- `src/auth/session.js`
- `src/game-state/index.js`

Ces modules centralisent:

- chargement config cloud;
- appels backend;
- appels Supabase Auth/REST;
- stockage local;
- session Supabase;
- constantes/fabriques d'etat.

## TypeScript progressif

Fichiers crees:

- `tsconfig.json`
- `packages/shared-types/src/index.ts`
- `packages/validation/src/index.ts`
- `apps/server/src/contracts.ts`

Le projet reste compatible navigateur sans transpilation TypeScript obligatoire. Les types sont poses pour la migration graduelle.

## Serveur autoritaire minimal

Fichiers:

- `apps/server/src/server.mjs`
- `apps/server/README.md`

Fonctions operationnelles:

- auth via Supabase token ou `X-Dev-User` en local;
- profil joueur;
- creation/restauration royaume;
- ressources serveur;
- action idempotente `claim_starter_cache`;
- action serveur `upgrade_citadel`;
- audit log local;
- stockage fichier pour pre-alpha locale.

## Tests

Script:

```text
scripts/test-authoritative-server.mjs
```

Il teste:

- demarrage serveur;
- creation profil;
- creation royaume;
- attribution ressource serveur;
- idempotence;
- upgrade citadelle.

## Limites restantes

- Le client principal ne consomme pas encore ce serveur pour toutes les actions.
- Les combats restent cote client.
- La production/timers restent cote client.
- Le serveur utilise un stockage fichier local, pas encore PostgreSQL transactionnel.
- Pas encore de WebSocket.

## Prochaine phase

Connecter progressivement le client aux routes autoritaires:

1. creation/restauration royaume;
2. ressources serveur;
3. upgrade citadelle;
4. recompenses;
5. formation de troupes;
6. combats serveur.

## Phase 3 ajoutee

La branche contient maintenant une premiere connexion client vers:

- `/v1/me`
- `/v1/kingdom`
- `/v1/resources`
- `/v1/actions`
- `/v1/guilds`
- `/v1/events`
- `/v1/leaderboard`

Les actions serveur-first couvrent:

- amelioration de batiments;
- formation de troupes;
- recompenses quotidiennes/events;
- resolution de combat;
- retour de recolte;
- aide de guilde.

Le fallback local reste actif pour garder le prototype jouable quand le serveur n'est pas lance.

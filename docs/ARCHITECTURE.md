# Architecture cible - Heliora Royaumes

## Objectif

Transformer le prototype web actuel en vertical slice pre-alpha de jeu 4X mobile multijoueur, sans casser les fonctionnalites existantes.

## Principe de migration

La migration se fait par etapes:

1. garder le client actuel stable;
2. documenter et tester;
3. extraire les modules frontend;
4. ajouter un backend autoritaire;
5. migrer les actions sensibles vers le serveur;
6. ajouter WebSocket et carte partagee;
7. empaqueter Android.

## Monorepo cible

```text
apps/
  web/
  server/
  mobile/
packages/
  game-core/
  game-data/
  shared-types/
  validation/
  ui/
  config/
supabase/
  migrations/
  functions/
  seed/
tests/
  e2e/
  integration/
  load/
  security/
docs/
scripts/
```

## Etat actuel

Le projet est encore a la racine:

- `index.html`
- `styles.css`
- `src/main.js`
- `data/`
- `server/`
- `scripts/`

La premiere migration ne deplace pas tout immediatement afin d'eviter une rupture du build GitHub Pages.

## Frontend cible

Modules a extraire progressivement:

- `src/networking/`
- `src/storage/`
- `src/auth/`
- `src/game-state/`
- `src/resources/`
- `src/buildings/`
- `src/heroes/`
- `src/troops/`
- `src/combat/`
- `src/world/`
- `src/alliances/`
- `src/events/`
- `src/quests/`
- `src/reports/`
- `src/ui/`

## Backend cible

Serveur TypeScript autoritaire:

- Node.js + Fastify ou NestJS.
- PostgreSQL/Supabase.
- Redis optionnel pour files et presence.
- REST pour actions discretes.
- WebSocket pour carte/chat/marches.
- Transactions pour actions sensibles.
- Idempotence pour recompenses, achats, constructions, combats.

## Source de verite

Court terme:

- Client conserve son etat local.
- Supabase stocke la sauvegarde et les guildes.

Pre-alpha cible:

- Le serveur decide les ressources, timers, combats, recompenses, construction, formation, alliances et classements.
- Le client affiche et anime.

## Strategie PWA

- Garder GitHub Pages pour le client web.
- Garder le service worker.
- Ajouter versionnement de cache.
- Bloquer les actions multijoueurs critiques hors ligne.

## Strategie mobile Android

- Conserver la PWA comme base.
- Ajouter Capacitor dans `apps/mobile`.
- Utiliser HTTPS seulement.
- Ne pas embarquer de secret.
- Ajouter documentation de build Android avant annonce de compatibilite.


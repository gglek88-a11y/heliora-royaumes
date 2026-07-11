# Audit technique - Heliora Royaumes

Date: 2026-07-11  
Branche: `migration/prealpha-4x-foundation`  
Depot local: `C:\Users\Kerry\Documents\New project`  
Application publique: `https://gglek88-a11y.github.io/heliora-royaumes/`

## 1. Synthese

Heliora Royaumes est aujourd'hui un prototype web/PWA jouable de jeu 4X fantasy. Il contient deja une citadelle interactive, une carte du monde, des heros, une armee, des combats, des recoltes, des evenements, des quetes, des rapports, une boutique, une authentification Supabase, une sauvegarde cloud et une premiere couche de guildes.

Le projet n'est pas encore un jeu multijoueur autoritaire. La majorite de la logique sensible reste calculee dans le navigateur: ressources, recompenses, timers, combats, progression, boutique, essais de defense, recoltes et quetes. Supabase stocke l'etat et securise l'acces par compte, mais ne valide pas encore toutes les actions de gameplay.

Conclusion: le projet est une bonne base de vertical slice client, mais il doit etre stabilise, modularise puis deplace progressivement vers un backend autoritaire.

## 2. Structure actuelle

Fichiers principaux:

- `index.html`: squelette HTML de l'application.
- `styles.css`: theme complet, refonte visuelle premium et responsive.
- `src/main.js`: logique principale du jeu, rendu, etat, auth, Supabase, combats, carte, guildes.
- `data/game-content.json`: donnees liveops/locales.
- `data/cloud-config.json`: configuration publique Supabase.
- `data/supabase-schema.sql`: schema SQL actuel avec RLS.
- `server/mock-backend.mjs`: serveur mock local non production.
- `service-worker.js`: cache PWA simple.
- `manifest.webmanifest`: manifest PWA.
- `scripts/build-pages.mjs`: build statique GitHub Pages.

Tailles relevees:

- `src/main.js`: environ 7 448 lignes, 290 Ko.
- `styles.css`: environ 7 028 lignes, 148 Ko.
- `data/supabase-schema.sql`: environ 283 lignes.
- `server/mock-backend.mjs`: environ 156 lignes.

## 3. Fonctionnalites operationnelles

- PWA installable avec manifest et service worker.
- Build statique GitHub Pages.
- UI premium fantasy responsive.
- Auth Supabase par email/password, sous reserve du provider Email active dans Supabase.
- Session Supabase persistante dans `localStorage`.
- Sauvegarde locale via `localStorage`.
- Sauvegarde cloud Supabase liee a `auth.uid()`.
- RLS de base pour sauvegarde joueur.
- Guildes cloud: creation, membres, invitations, roles, classement alliance.
- Carte du monde visuelle.
- Citadelle interactive.
- Batiments, ameliorations, ressources et production.
- Heros avec XP, niveaux, stats, premium heroes.
- Formation de troupes.
- Combats PvE locaux.
- Recolte de ressources avec convois.
- Rapports de combat/recolte/defense.
- Evenements liveops locaux.
- Boutique/codes cadeau.

## 4. Fonctionnalites simulees ou incompletes

- Le backend `server/mock-backend.mjs` n'est pas autoritaire.
- Les combats sont resolus dans le navigateur.
- Les ressources sont modifiables dans le client.
- Les timers utilisent `Date.now()` cote client.
- La carte mondiale n'est pas une carte partagee chunked/multijoueur.
- Les marches ne sont pas synchronisees en temps reel entre joueurs.
- Le chat n'est pas encore completement exploite comme canal temps reel.
- Les guildes existent mais sans transaction serveur robuste pour toutes les actions.
- Pas de serveur permanent TypeScript.
- Pas de workers persistants pour constructions/recherches/marches.
- Pas de WebSocket.
- Pas de Redis/file de taches.
- Pas de tests unitaires/metier complets.
- Pas encore de projet Android Capacitor.

## 5. Dettes techniques

- `src/main.js` concentre presque toute la logique du jeu, du rendu et du reseau.
- `styles.css` concentre toute l'UI et contient plusieurs couches historiques.
- Beaucoup de rendu HTML via `innerHTML`.
- Etat global mutable.
- Acces directs disperses a `localStorage`.
- Acces Supabase directs dans le client.
- Pas de validation partagee frontend/backend.
- Pas de separation nette entre etat serveur, etat UI et cache.
- Pas de format d'erreur uniforme.
- Pas de tests automatises metier.
- Pas de lint/typecheck.

## 6. Risques de securite

Risques critiques:

- Le client peut encore modifier les ressources, recompenses et resultats en patchant le JavaScript.
- Les combats PvE sont decidés localement.
- Les timers et fins d'actions sont decidés localement.
- Les recompenses de quetes/evenements sont attribuees localement.
- La sauvegarde cloud stocke un `save_state` complet envoye par le client.
- La session est stockee en `localStorage`, acceptable pour prototype mais a durcir pour mobile/production.

Mesures deja presentes:

- La cle publique Supabase est une cle publishable, pas une cle `service_role`.
- Le schema Supabase active RLS sur les tables sensibles.
- Les sauvegardes joueur sont filtrees par `auth.uid()`.
- Les tables guildes utilisent des politiques par role.

## 7. Performance mobile

Risques:

- Gros assets PNG non optimises.
- `src/main.js` et `styles.css` tres volumineux.
- Rendu complet frequemment appele par `tick`.
- Nombreux `innerHTML` recrees.
- Canvas et DOM cohabitent sur des vues denses.
- Service worker cache beaucoup d'assets sans version applicative fine.

Priorites:

1. Debouncer ou segmenter les rendus.
2. Modulariser la logique.
3. Optimiser images et cache.
4. Isoler carte/heros/rapports dans des modules.
5. Ajouter mode qualite basse.

## 8. Donnees controlees par le client

Les donnees suivantes sont encore controlees ou modifiables cote client:

- `resources`
- `buildings`
- `units`
- `heroes`
- `training`
- `marches`
- `returnMarches`
- `eventProgress`
- `claimedEvents`
- `claimedQuests`
- `redeemedCodes`
- `battleReports`
- `harvestReports`
- `defenseReports`
- `leaderboard` local
- `guild.score`
- timers de training/marches/raids

Ces donnees doivent migrer progressivement vers des actions serveur validees.

## 9. Recommandations par priorite

### P0 - Stabilisation

- Garder le frontend actuel fonctionnel.
- Ajouter scripts de verification automatises.
- Documenter architecture, schema et securite.
- Deplacer le schema Supabase dans `supabase/migrations`.
- Ajouter `.env.example`.
- Corriger erreurs critiques de saisie/auth.

### P1 - Serveur autoritaire minimal

- Creer `apps/server` TypeScript.
- Ajouter API `GET /health`, `GET /me`, `POST /actions`.
- Ajouter validation d'action.
- Ajouter transactions PostgreSQL pour ressources et batiments.
- Introduire idempotency keys.
- Ajouter audit logs.

### P2 - Modularisation frontend

- Extraire `network-client`, `save-system`, `auth`, `game-state`.
- Extraire systemes metier: ressources, batiments, heros, combat, world, alliances.
- Remplacer les appels Supabase disperses par un client reseau centralise.

### P3 - Creation du royaume

- Ecran d'accueil.
- Creation profil/royaume.
- Choix heros initial.
- Choix region.
- Migration sauvegarde locale.

### P4 - Multijoueur

- Carte monde persistante.
- Chunks/regions.
- WebSocket.
- Marches serveur.
- Reconciliation a la reconnexion.

## 10. Plan de migration retenu

Approche retenue: migration progressive.

1. Phase 1: documentation, audits, scripts de verification, migrations versionnees.
2. Phase 2: extraire les modules de configuration/reseau/stockage sans changer le gameplay.
3. Phase 3: ajouter serveur autoritaire minimal pour profil/royaume/ressources.
4. Phase 4: migrer les actions sensibles une par une.
5. Phase 5: ajouter temps reel, carte partagee et combat serveur.
6. Phase 6: Capacitor Android, CI/CD, tests avances.

## 11. Validation executee pendant l'audit

- Inspection structure de depot.
- Inspection `package.json`.
- Inspection PWA: `manifest.webmanifest`, `service-worker.js`.
- Inspection Supabase: `data/cloud-config.json`, `data/supabase-schema.sql`.
- Inspection serveur mock.
- Releve des tailles de fichiers.
- Recherche des acces `localStorage`, `fetch`, `Date.now`, `Math.random`, `addResources`, `spend`, `innerHTML`.

## 12. Limites de cet audit initial

- Pas de test navigateur complet avec capture mobile dans cette phase.
- Pas de test de charge.
- Pas de test Android.
- Pas de verification directe des logs Supabase.
- Pas d'analyse Lighthouse automatisee.


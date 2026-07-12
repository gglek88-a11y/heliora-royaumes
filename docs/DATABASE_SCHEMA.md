# Schema base de donnees - Etat actuel et cible

## Etat actuel Supabase

Le schema actuel est dans:

- `data/supabase-schema.sql`
- `supabase/migrations/20260711000000_initial_heliora.sql`

Tables existantes:

- `heliora_players`
- `heliora_chat`
- `heliora_guilds`
- `heliora_guild_members`
- `heliora_guild_invites`

Vues existantes:

- `heliora_leaderboard`
- `heliora_guild_leaderboard`

Fonction existante:

- `heliora_is_guild_manager(target_guild uuid)`

## Points forts actuels

- RLS activee.
- Sauvegarde joueur liee a `auth.uid()`.
- Guildes avec roles `leader`, `officer`, `member`, `recruit`.
- Invitations de guilde.
- Vues limitees pour classements.

## Limites actuelles

- `save_state` stocke encore un etat complet envoye par le client.
- Pas de tables normalisees pour ressources, batiments, troupes, recherches et marches.
- Pas de transactions serveur pour les actions sensibles.
- Pas d'audit log detaille.
- Pas de table d'idempotence.

## Schema cible minimal pre-alpha

Tables prioritaires:

- `profiles`
- `kingdoms`
- `kingdom_resources`
- `buildings`
- `construction_queues`
- `player_heroes`
- `player_troops`
- `training_queues`
- `worlds`
- `world_tiles`
- `map_entities`
- `player_marches`
- `combats`
- `battle_reports`
- `player_quests`
- `player_events`
- `resource_transactions`
- `idempotency_keys`
- `audit_logs`
- `security_events`

## Regles de migration

- Ne pas supprimer `heliora_players` tant que la migration locale/cloud n'est pas terminee.
- Ajouter les nouvelles tables en parallele.
- Migrer progressivement les donnees compatibles.
- Garder `save_version`.
- Journaliser toutes les migrations sensibles.


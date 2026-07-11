# Securite - Heliora Royaumes

## Principes

- Ne jamais exposer de cle `service_role` dans le frontend.
- Ne jamais faire confiance a une valeur envoyee par le client.
- Les actions sensibles doivent devenir serveur-autorite.
- Les resultats de combat et recompenses doivent etre decidés par le serveur.
- Les timers doivent utiliser une horloge serveur.

## Secrets

Le frontend peut contenir:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` ou cle publishable

Le frontend ne doit jamais contenir:

- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_SECRET`

## Risques actuels

- Modification client des ressources.
- Modification client des recompenses.
- Combat local falsifiable.
- Timers bases sur `Date.now()`.
- Sauvegarde cloud envoyee par le client.

## Mesures deja en place

- RLS Supabase.
- `heliora_players.user_id = auth.uid()`.
- Tables guildes avec politiques par role.
- Pas de cle serveur dans `data/cloud-config.json`.

## Mesures prioritaires

1. Backend autoritaire minimal.
2. Transactions PostgreSQL.
3. Idempotency keys.
4. Audit logs.
5. Validation stricte.
6. Rate limiting.
7. CSP pour le client web.
8. Tests de securite automatises.


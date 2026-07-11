# API Heliora - serveur autoritaire pre-alpha

Base locale par defaut:

```text
http://127.0.0.1:8790
```

## Authentification

Production/pre-alpha:

```http
Authorization: Bearer <supabase_access_token>
```

Developpement local:

```http
X-Dev-User: local-player
```

avec `HELIORA_DEV_AUTH=true`.

## Format d'erreur

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_RESOURCES",
    "message": "Action serveur refusee.",
    "requestId": "..."
  }
}
```

## Routes

### GET /health

Retourne l'etat du serveur et l'heure serveur.

### GET /v1/me

Retourne le profil, le royaume associe et l'heure serveur.

### POST /v1/profile

Corps:

```json
{
  "name": "Commandant"
}
```

### POST /v1/kingdom

Cree ou restaure le royaume du joueur.

```json
{
  "playerName": "Commandant",
  "kingdomName": "Royaume d'Heliora",
  "capitalName": "Citadelle d'Heliora",
  "region": "foret_mystique",
  "heroId": "maelis"
}
```

### GET /v1/kingdom

Retourne le royaume du joueur connecte.

### GET /v1/resources

Retourne les ressources serveur du royaume.

### POST /v1/actions

Toutes les actions sensibles exigent une `idempotencyKey`.

```json
{
  "type": "claim_starter_cache",
  "idempotencyKey": "unique-action-key"
}
```

Actions actuelles:

- `claim_starter_cache`
- `upgrade_citadel`

## Limites

Ce serveur ne gere pas encore:

- WebSocket;
- carte monde partagee;
- combats serveur;
- files de construction persistantes;
- Redis;
- base PostgreSQL directe.

Il pose la premiere autorite serveur et le contrat d'action idempotent.

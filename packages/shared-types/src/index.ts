export type ResourceKey = "gold" | "food" | "stone" | "wood" | "energy" | "gems" | "guildCoins";

export type ResourceBag = Partial<Record<ResourceKey, number>>;

export interface PlayerProfile {
  userId: string;
  playerId: string;
  name: string;
  kingdomId?: string;
}

export interface KingdomSummary {
  id: string;
  ownerUserId: string;
  name: string;
  level: number;
  power: number;
  resources: ResourceBag;
}

export type AuthoritativeActionType =
  | "claim_starter_cache"
  | "upgrade_citadel";

export interface AuthoritativeAction {
  type: AuthoritativeActionType;
  idempotencyKey: string;
  payload: Record<string, unknown>;
}

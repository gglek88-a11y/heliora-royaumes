import type { AuthoritativeActionType, KingdomSummary, ResourceBag } from "../../../packages/shared-types/src/index";

export interface ServerEnvelope<T> {
  success: boolean;
  serverTime?: string;
  error?: {
    code: string;
    message: string;
    requestId: string;
  };
  data?: T;
}

export interface CreateKingdomPayload {
  playerName: string;
  kingdomName: string;
  capitalName: string;
  region: string;
  heroId: string;
}

export interface ServerActionPayload {
  type: AuthoritativeActionType;
  idempotencyKey: string;
}

export interface KingdomResponse {
  kingdom: KingdomSummary;
}

export interface ResourceResponse {
  resources: ResourceBag;
}

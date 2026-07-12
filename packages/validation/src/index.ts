export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateDisplayName(value: unknown): ValidationResult {
  const name = String(value ?? "").trim();
  const errors: string[] = [];
  if (name.length < 3) errors.push("Name must contain at least 3 characters.");
  if (name.length > 32) errors.push("Name must contain at most 32 characters.");
  if (!/^[\p{L}\p{N} _'-]+$/u.test(name)) errors.push("Name contains unsupported characters.");
  return { ok: errors.length === 0, errors };
}

export function validateIdempotencyKey(value: unknown): ValidationResult {
  const key = String(value ?? "").trim();
  const errors: string[] = [];
  if (key.length < 12) errors.push("Idempotency key is too short.");
  if (key.length > 120) errors.push("Idempotency key is too long.");
  return { ok: errors.length === 0, errors };
}

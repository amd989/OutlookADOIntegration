export type AuthMethod = "entra" | "pat";

export interface AddinSettings {
  orgUrl: string;
  project: string;
  authMethod: AuthMethod;
  pat?: string;
}

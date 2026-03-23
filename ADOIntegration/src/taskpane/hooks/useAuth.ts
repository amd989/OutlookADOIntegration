import { useState, useCallback } from "react";
import type { AccountInfo } from "@azure/msal-browser";
import type { AddinSettings, AuthMethod } from "../types/settings";
import { initializeMsal, login as msalLogin, getToken, getAccount, logout as msalLogout, isAuthenticated as msalIsAuth } from "../services/auth";
import { buildPatAuthHeader, isPatValid } from "../services/patAuth";

interface UseAuthReturn {
  isAuthenticated: boolean;
  account: AccountInfo | null;
  authMethod: AuthMethod | null;
  restoreFromSettings: (settings: AddinSettings) => void;
  loginWithEntra: (clientId: string) => Promise<void>;
  loginWithPat: (pat: string) => void;
  getAuthHeader: () => Promise<string>;
  logout: () => Promise<void>;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [isAuth, setIsAuth] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [pat, setPat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const restoreFromSettings = useCallback((settings: AddinSettings) => {
    if (settings.authMethod === "pat" && settings.pat && isPatValid(settings.pat)) {
      setPat(settings.pat);
      setAuthMethod("pat");
      setIsAuth(true);
    }
    // Entra ID tokens can't be restored from settings — user will need to re-auth
    // but MSAL caches tokens in localStorage, so acquireTokenSilent may work
  }, []);

  const loginWithEntra = useCallback(async (clientId: string) => {
    try {
      setError(null);
      await initializeMsal(clientId);
      const acct = await msalLogin();
      setAccount(acct);
      setAuthMethod("entra");
      setIsAuth(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Entra ID login failed.");
      throw e;
    }
  }, []);

  const loginWithPat = useCallback((patToken: string) => {
    if (!isPatValid(patToken)) {
      setError("Invalid PAT token.");
      return;
    }
    setError(null);
    setPat(patToken);
    setAuthMethod("pat");
    setIsAuth(true);
  }, []);

  const getAuthHeader = useCallback(async (): Promise<string> => {
    if (authMethod === "entra") {
      const token = await getToken();
      return `Bearer ${token}`;
    }
    if (authMethod === "pat" && pat) {
      return buildPatAuthHeader(pat);
    }
    throw new Error("Not authenticated.");
  }, [authMethod, pat]);

  const logout = useCallback(async () => {
    if (authMethod === "entra" && msalIsAuth()) {
      await msalLogout();
    }
    setIsAuth(false);
    setAccount(null);
    setAuthMethod(null);
    setPat(null);
  }, [authMethod]);

  return {
    isAuthenticated: isAuth,
    account,
    authMethod,
    restoreFromSettings,
    loginWithEntra,
    loginWithPat,
    getAuthHeader,
    logout,
    error,
  };
}

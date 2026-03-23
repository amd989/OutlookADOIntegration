import {
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
  type Configuration,
} from "@azure/msal-browser";

const AZURE_DEVOPS_SCOPE = "499b84ac-1321-427f-aa17-267ca6975798/user_impersonation";

let msalInstance: PublicClientApplication | null = null;

function getMsalConfig(clientId: string): Configuration {
  return {
    auth: {
      clientId,
      authority: "https://login.microsoftonline.com/common",
      redirectUri: window.location.origin + "/taskpane.html",
    },
    cache: {
      cacheLocation: "localStorage",
    },
  };
}

export async function initializeMsal(clientId: string): Promise<void> {
  if (msalInstance) return;
  msalInstance = new PublicClientApplication(getMsalConfig(clientId));
  await msalInstance.initialize();
}

function ensureInitialized(): PublicClientApplication {
  if (!msalInstance) {
    throw new Error("MSAL not initialized. Call initializeMsal() first.");
  }
  return msalInstance;
}

export async function login(): Promise<AccountInfo> {
  const instance = ensureInitialized();
  const result: AuthenticationResult = await instance.loginPopup({
    scopes: [AZURE_DEVOPS_SCOPE],
  });
  return result.account;
}

export async function getToken(): Promise<string> {
  const instance = ensureInitialized();
  const accounts = instance.getAllAccounts();

  if (accounts.length === 0) {
    const result = await instance.loginPopup({
      scopes: [AZURE_DEVOPS_SCOPE],
    });
    return result.accessToken;
  }

  try {
    const result = await instance.acquireTokenSilent({
      scopes: [AZURE_DEVOPS_SCOPE],
      account: accounts[0],
    });
    return result.accessToken;
  } catch {
    const result = await instance.acquireTokenPopup({
      scopes: [AZURE_DEVOPS_SCOPE],
    });
    return result.accessToken;
  }
}

export function getAccount(): AccountInfo | null {
  if (!msalInstance) return null;
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

export async function logout(): Promise<void> {
  const instance = ensureInitialized();
  await instance.logoutPopup();
}

export function isAuthenticated(): boolean {
  if (!msalInstance) return false;
  return msalInstance.getAllAccounts().length > 0;
}

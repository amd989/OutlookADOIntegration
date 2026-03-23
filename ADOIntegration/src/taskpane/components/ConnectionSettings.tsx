import React, { useState } from "react";
import {
  Input,
  Button,
  RadioGroup,
  Radio,
  Field,
  MessageBar,
  MessageBarBody,
  Spinner,
  Text,
} from "@fluentui/react-components";
import { PlugConnected20Regular } from "@fluentui/react-icons";
import type { AddinSettings, AuthMethod } from "../types/settings";
import { validateConnection } from "../services/azureDevOps";
import { buildPatAuthHeader } from "../services/patAuth";
import { isEntraConfigured } from "../services/auth";

interface ConnectionSettingsProps {
  initialSettings: AddinSettings | null;
  onSave: (settings: AddinSettings) => Promise<void>;
  onGetAuthHeader: () => Promise<string>;
  authMethod: AuthMethod | null;
  onLoginWithPat: (pat: string) => void;
  onLoginWithEntra: () => Promise<void>;
  isAuthenticated: boolean;
}

export const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({
  initialSettings,
  onSave,
  onGetAuthHeader,
  onLoginWithPat,
  onLoginWithEntra,
}) => {
  const entraAvailable = isEntraConfigured();
  const [orgUrl, setOrgUrl] = useState(initialSettings?.orgUrl ?? "https://dev.azure.com/");
  const [project, setProject] = useState(initialSettings?.project ?? "");
  const [selectedAuth, setSelectedAuth] = useState<AuthMethod>(
    initialSettings?.authMethod ?? (entraAvailable ? "entra" : "pat")
  );
  const [pat, setPat] = useState(initialSettings?.pat ?? "");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!orgUrl.trim() || !project.trim()) {
      setError("Organization URL and project are required.");
      return;
    }

    if (selectedAuth === "pat" && !pat.trim()) {
      setError("Personal Access Token is required.");
      return;
    }

    setValidating(true);
    try {
      let authHeader: string;
      if (selectedAuth === "pat") {
        onLoginWithPat(pat);
        authHeader = buildPatAuthHeader(pat);
      } else {
        await onLoginWithEntra();
        authHeader = await onGetAuthHeader();
      }

      await validateConnection(orgUrl, project, authHeader);

      const settings: AddinSettings = {
        orgUrl: orgUrl.trim(),
        project: project.trim(),
        authMethod: selectedAuth,
        pat: selectedAuth === "pat" ? pat : undefined,
      };
      await onSave(settings);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed.");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Field label="Organization URL" required>
        <Input
          value={orgUrl}
          onChange={(_, data) => setOrgUrl(data.value)}
          placeholder="https://dev.azure.com/myorg"
        />
      </Field>

      <Field label="Project" required>
        <Input
          value={project}
          onChange={(_, data) => setProject(data.value)}
          placeholder="MyProject"
        />
      </Field>

      <Field label="Authentication Method">
        <RadioGroup
          value={selectedAuth}
          onChange={(_, data) => setSelectedAuth(data.value as AuthMethod)}
        >
          <Radio value="pat" label="Personal Access Token" />
          <Radio
            value="entra"
            label="Sign in with Microsoft (work/school account)"
            disabled={!entraAvailable}
          />
        </RadioGroup>
        {!entraAvailable && selectedAuth !== "entra" && (
          <Text size={100} style={{ color: "#888", marginTop: "4px" }}>
            Entra ID sign-in is not configured in this build.
          </Text>
        )}
      </Field>

      {selectedAuth === "pat" && (
        <Field label="Personal Access Token" required>
          <Input
            type="password"
            value={pat}
            onChange={(_, data) => setPat(data.value)}
            placeholder="Paste your PAT here"
          />
        </Field>
      )}

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      {success && (
        <MessageBar intent="success">
          <MessageBarBody>Connected successfully!</MessageBarBody>
        </MessageBar>
      )}

      <Button
        appearance="primary"
        icon={validating ? <Spinner size="tiny" /> : <PlugConnected20Regular />}
        onClick={handleSave}
        disabled={validating}
      >
        {validating ? "Validating..." : "Validate & Save"}
      </Button>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  Text,
  Divider,
  Button,
  Subtitle2,
} from "@fluentui/react-components";
import { Settings20Regular, ArrowLeft20Regular } from "@fluentui/react-icons";
import { useAuth } from "./hooks/useAuth";
import { useSettings } from "./hooks/useSettings";
import { useWorkItems } from "./hooks/useWorkItems";
import { ConnectionSettings } from "./components/ConnectionSettings";
import { WorkItemInput } from "./components/WorkItemInput";
import { WorkItemList } from "./components/WorkItemList";
import { AttachButton, type AttachResult } from "./components/AttachButton";
import { StatusMessage } from "./components/StatusMessage";

export const App: React.FC = () => {
  const auth = useAuth();
  const { settings, isLoaded, updateSettings } = useSettings();
  const { workItems, addWorkItem, removeWorkItem, clearWorkItems } = useWorkItems();
  const [showSettings, setShowSettings] = useState(false);
  const [results, setResults] = useState<AttachResult[]>([]);

  useEffect(() => {
    if (isLoaded && settings && !auth.isAuthenticated) {
      auth.restoreFromSettings(settings);
    }
  }, [isLoaded, settings]);

  if (!isLoaded) {
    return (
      <div style={{ padding: "16px" }}>
        <Text>Loading...</Text>
      </div>
    );
  }

  // Show settings if no settings saved yet, or user clicked the settings button
  const needsSetup = !settings || !auth.isAuthenticated;

  if (needsSetup || showSettings) {
    return (
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {showSettings && settings && auth.isAuthenticated && (
            <Button
              appearance="subtle"
              icon={<ArrowLeft20Regular />}
              onClick={() => setShowSettings(false)}
              size="small"
            />
          )}
          <Subtitle2>
            {needsSetup ? "Setup Connection" : "Settings"}
          </Subtitle2>
        </div>
        <ConnectionSettings
          initialSettings={settings}
          onSave={async (s) => {
            await updateSettings(s);
            setShowSettings(false);
          }}
          onGetAuthHeader={auth.getAuthHeader}
          authMethod={auth.authMethod}
          onLoginWithPat={auth.loginWithPat}
          onLoginWithEntra={auth.loginWithEntra}
          isAuthenticated={auth.isAuthenticated}
        />
      </div>
    );
  }

  const handleComplete = (attachResults: AttachResult[]) => {
    setResults(attachResults);
    const allSucceeded = attachResults.every((r) => r.success);
    if (allSucceeded) {
      clearWorkItems();
    }
  };

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Subtitle2>Attach Email to Work Items</Subtitle2>
        <Button
          appearance="subtle"
          icon={<Settings20Regular />}
          onClick={() => setShowSettings(true)}
          size="small"
          title="Settings"
        />
      </div>

      <Text size={200} style={{ color: "#666" }}>
        {new URL(settings!.orgUrl).pathname.replace(/^\/+|\/+$/g, "")} / {settings!.project}
      </Text>

      <Divider />

      <WorkItemInput
        orgUrl={settings!.orgUrl}
        project={settings!.project}
        getAuthHeader={auth.getAuthHeader}
        onAdd={addWorkItem}
      />

      <WorkItemList workItems={workItems} onRemove={removeWorkItem} />

      <Divider />

      <AttachButton
        workItems={workItems}
        orgUrl={settings!.orgUrl}
        project={settings!.project}
        getAuthHeader={auth.getAuthHeader}
        onComplete={handleComplete}
      />

      <StatusMessage
        results={results}
        onDismiss={() => setResults([])}
      />
    </div>
  );
};

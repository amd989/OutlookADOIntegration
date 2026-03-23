import React from "react";
import { MessageBar, MessageBarBody, MessageBarActions, Button } from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import type { AttachResult } from "./AttachButton";

interface StatusMessageProps {
  results: AttachResult[];
  onDismiss: () => void;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ results, onDismiss }) => {
  if (results.length === 0) return null;

  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {succeeded.length > 0 && (
        <MessageBar intent="success" onClick={onDismiss} style={{ cursor: "pointer" }}>
          <MessageBarBody>
            Email attached to {succeeded.length} work item{succeeded.length !== 1 ? "s" : ""}:
            <br />
            {succeeded.map((r) => `#${r.workItemId}`).join(", ")}
          </MessageBarBody>
        </MessageBar>
      )}
      {failed.map((r) => (
        <MessageBar key={r.workItemId} intent="error">
          <MessageBarBody>
            Failed to attach to #{r.workItemId}: {r.error}
          </MessageBarBody>
        </MessageBar>
      ))}
    </div>
  );
};

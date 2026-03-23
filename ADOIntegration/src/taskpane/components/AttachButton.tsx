import React, { useState } from "react";
import { Button, ProgressBar, Field } from "@fluentui/react-components";
import { Attach20Regular } from "@fluentui/react-icons";
import type { WorkItem } from "../types/workItem";
import { attachFileToWorkItem } from "../services/azureDevOps";
import { getEmailAsEml } from "../services/outlook";

interface AttachButtonProps {
  workItems: WorkItem[];
  orgUrl: string;
  project: string;
  getAuthHeader: () => Promise<string>;
  onComplete: (results: AttachResult[]) => void;
}

export interface AttachResult {
  workItemId: number;
  success: boolean;
  error?: string;
}

export const AttachButton: React.FC<AttachButtonProps> = ({
  workItems,
  orgUrl,
  project,
  getAuthHeader,
  onComplete,
}) => {
  const [attaching, setAttaching] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAttach = async () => {
    if (workItems.length === 0) return;

    setAttaching(true);
    setProgress(0);

    const results: AttachResult[] = [];

    try {
      const authHeader = await getAuthHeader();
      const email = await getEmailAsEml();

      for (let i = 0; i < workItems.length; i++) {
        const wi = workItems[i];
        try {
          await attachFileToWorkItem(orgUrl, project, wi.id, email.filename, email.content, authHeader);
          results.push({ workItemId: wi.id, success: true });
        } catch (e) {
          results.push({
            workItemId: wi.id,
            success: false,
            error: e instanceof Error ? e.message : "Unknown error",
          });
        }
        setProgress((i + 1) / workItems.length);
      }
    } catch (e) {
      // Email retrieval or auth failure — all items fail
      const errorMsg = e instanceof Error ? e.message : "Unknown error";
      for (const wi of workItems) {
        results.push({ workItemId: wi.id, success: false, error: errorMsg });
      }
    }

    setAttaching(false);
    onComplete(results);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {attaching && (
        <Field
          validationMessage={`Attaching to work item ${Math.ceil(progress * workItems.length)} of ${workItems.length}...`}
          validationState="none"
        >
          <ProgressBar value={progress} />
        </Field>
      )}
      <Button
        appearance="primary"
        icon={<Attach20Regular />}
        onClick={handleAttach}
        disabled={attaching || workItems.length === 0}
        style={{ alignSelf: "stretch" }}
      >
        {attaching ? "Attaching..." : `Attach Email to ${workItems.length} Work Item${workItems.length !== 1 ? "s" : ""}`}
      </Button>
    </div>
  );
};

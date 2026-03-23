import React, { useState } from "react";
import { Input, Button, Spinner, MessageBar, MessageBarBody } from "@fluentui/react-components";
import { Add20Regular } from "@fluentui/react-icons";
import type { WorkItem } from "../types/workItem";
import { getWorkItem } from "../services/azureDevOps";

interface WorkItemInputProps {
  orgUrl: string;
  project: string;
  getAuthHeader: () => Promise<string>;
  onAdd: (item: WorkItem) => boolean;
}

export const WorkItemInput: React.FC<WorkItemInputProps> = ({
  orgUrl,
  project,
  getAuthHeader,
  onAdd,
}) => {
  const [idInput, setIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setError(null);
    const id = parseInt(idInput.trim(), 10);
    if (isNaN(id) || id <= 0) {
      setError("Please enter a valid work item ID.");
      return;
    }

    setLoading(true);
    try {
      const authHeader = await getAuthHeader();
      const workItem = await getWorkItem(orgUrl, project, id, authHeader);
      const added = onAdd(workItem);
      if (!added) {
        setError(`Work item #${id} is already in the list.`);
      } else {
        setIdInput("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch work item.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleAdd();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "end" }}>
        <Input
          style={{ flex: 1 }}
          value={idInput}
          onChange={(_, data) => setIdInput(data.value)}
          onKeyDown={handleKeyDown}
          placeholder="Work item ID"
          type="number"
          disabled={loading}
        />
        <Button
          appearance="primary"
          icon={loading ? <Spinner size="tiny" /> : <Add20Regular />}
          onClick={handleAdd}
          disabled={loading}
        >
          Add
        </Button>
      </div>
      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}
    </div>
  );
};

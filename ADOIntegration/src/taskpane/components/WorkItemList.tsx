import React from "react";
import { Button, Badge, Text } from "@fluentui/react-components";
import { Dismiss20Regular } from "@fluentui/react-icons";
import type { WorkItem } from "../types/workItem";

interface WorkItemListProps {
  workItems: WorkItem[];
  onRemove: (id: number) => void;
}

export const WorkItemList: React.FC<WorkItemListProps> = ({ workItems, onRemove }) => {
  if (workItems.length === 0) {
    return (
      <Text size={200} style={{ color: "#666", fontStyle: "italic" }}>
        No work items added yet. Enter an ID above to get started.
      </Text>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {workItems.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 0",
            borderBottom: "1px solid #e0e0e0",
            minWidth: 0,
          }}
        >
          <Text size={200} style={{ flexShrink: 0 }}>
            #{item.id}
          </Text>
          <Text
            size={200}
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={item.title}
          >
            {item.title}
          </Text>
          <Badge size="small" appearance="outline" style={{ flexShrink: 0 }}>
            {item.type}
          </Badge>
          <Button
            appearance="subtle"
            size="small"
            icon={<Dismiss20Regular />}
            onClick={() => onRemove(item.id)}
            title="Remove"
            style={{ flexShrink: 0 }}
          />
        </div>
      ))}
    </div>
  );
};

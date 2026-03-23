import type { WorkItem } from "../types/workItem";

const API_VERSION = "api-version=7.1";

function normalizeOrgUrl(orgUrl: string): string {
  return orgUrl.replace(/\/+$/, "");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function parseJsonResponse(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    // Azure DevOps returns HTML (login page) for auth failures
    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      throw new Error("Authentication failed. Please check your credentials.");
    }
    throw new Error(`Unexpected response from Azure DevOps.`);
  }
}

function checkResponseStatus(response: Response): void {
  if (response.status === 401 || response.status === 203 || response.status === 302) {
    throw new Error("Authentication failed. Please check your credentials.");
  }
  if (response.status === 404) {
    throw new Error("Not found.");
  }
  if (!response.ok) {
    throw new Error(`Request failed (HTTP ${response.status}).`);
  }
}

export async function getWorkItem(
  orgUrl: string,
  project: string,
  workItemId: number,
  authHeader: string
): Promise<WorkItem> {
  const base = normalizeOrgUrl(orgUrl);
  const url = `${base}/${encodeURIComponent(project)}/_apis/wit/workitems/${workItemId}?${API_VERSION}`;

  const response = await fetch(url, {
    headers: { Authorization: authHeader },
  });

  try {
    checkResponseStatus(response);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Not found")) {
      throw new Error(`Work item #${workItemId} not found.`);
    }
    throw e;
  }

  const data = await parseJsonResponse(response);
  return {
    id: data.id,
    title: data.fields["System.Title"],
    type: data.fields["System.WorkItemType"],
  };
}

export async function attachFileToWorkItem(
  orgUrl: string,
  project: string,
  workItemId: number,
  fileName: string,
  fileContent: Uint8Array,
  authHeader: string
): Promise<void> {
  const base = normalizeOrgUrl(orgUrl);

  // Step 1: Upload the attachment
  const uploadUrl = `${base}/${encodeURIComponent(project)}/_apis/wit/attachments?fileName=${encodeURIComponent(fileName)}&${API_VERSION}`;

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/octet-stream",
    },
    body: fileContent.buffer as ArrayBuffer,
  });

  checkResponseStatus(uploadResponse);
  const uploadData = await parseJsonResponse(uploadResponse);
  const attachmentUrl: string = uploadData.url;

  // Step 2: Link the attachment to the work item
  const patchUrl = `${base}/${encodeURIComponent(project)}/_apis/wit/workitems/${workItemId}?${API_VERSION}`;

  const patchBody = [
    {
      op: "add",
      path: "/relations/-",
      value: {
        rel: "AttachedFile",
        url: attachmentUrl,
        attributes: {
          comment: "Email attached from Outlook",
        },
      },
    },
  ];

  const patchResponse = await fetch(patchUrl, {
    method: "PATCH",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json-patch+json",
    },
    body: JSON.stringify(patchBody),
  });

  checkResponseStatus(patchResponse);
}

export async function validateConnection(
  orgUrl: string,
  project: string,
  authHeader: string
): Promise<string> {
  const base = normalizeOrgUrl(orgUrl);
  const url = `${base}/_apis/projects/${encodeURIComponent(project)}?${API_VERSION}`;

  const response = await fetch(url, {
    headers: { Authorization: authHeader },
  });

  try {
    checkResponseStatus(response);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Not found")) {
      throw new Error(`Project "${project}" not found in this organization.`);
    }
    throw e;
  }

  const data = await parseJsonResponse(response);
  return data.name as string;
}

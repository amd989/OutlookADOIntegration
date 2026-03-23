import { sanitizeFilename } from "../utils/filename";

export interface EmailContent {
  content: Uint8Array;
  filename: string;
}

export async function getEmailAsEml(): Promise<EmailContent> {
  const item = Office.context.mailbox.item;
  if (!item) {
    throw new Error("No email selected.");
  }

  const subject = item.subject ?? "email";
  const filename = sanitizeFilename(subject) + ".eml";

  // Try getAsFileAsync first (requires Mailbox 1.14+)
  if (typeof item.getAsFileAsync === "function") {
    return new Promise((resolve, reject) => {
      item.getAsFileAsync({ asyncContext: null }, (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          reject(new Error(result.error?.message ?? "Failed to get email as file."));
          return;
        }
        const base64Content: string = result.value;
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        resolve({ content: bytes, filename });
      });
    });
  }

  // Fallback: construct EML from available metadata
  return constructEmlFromMetadata(item, filename);
}

async function constructEmlFromMetadata(
  item: Office.MessageRead,
  filename: string
): Promise<EmailContent> {
  const subject = item.subject ?? "";
  const from = item.from?.emailAddress ?? "unknown@unknown.com";
  const fromName = item.from?.displayName ?? "";
  const date = item.dateTimeCreated?.toUTCString() ?? new Date().toUTCString();

  const toRecipients = (item.to ?? [])
    .map((r) => `${r.displayName} <${r.emailAddress}>`)
    .join(", ");

  const ccRecipients = (item.cc ?? [])
    .map((r) => `${r.displayName} <${r.emailAddress}>`)
    .join(", ");

  const htmlBody = await new Promise<string>((resolve, reject) => {
    item.body.getAsync(Office.CoercionType.Html, (result) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        reject(new Error(result.error?.message ?? "Failed to get email body."));
        return;
      }
      resolve(result.value);
    });
  });

  const boundary = "----=_Part_" + Date.now().toString(36);

  let eml = `From: ${fromName} <${from}>\r\n`;
  eml += `To: ${toRecipients}\r\n`;
  if (ccRecipients) {
    eml += `Cc: ${ccRecipients}\r\n`;
  }
  eml += `Subject: ${subject}\r\n`;
  eml += `Date: ${date}\r\n`;
  eml += `MIME-Version: 1.0\r\n`;
  eml += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n`;
  eml += `\r\n`;
  eml += `--${boundary}\r\n`;
  eml += `Content-Type: text/html; charset="UTF-8"\r\n`;
  eml += `Content-Transfer-Encoding: quoted-printable\r\n`;
  eml += `\r\n`;
  eml += htmlBody;
  eml += `\r\n`;
  eml += `--${boundary}--\r\n`;

  const encoder = new TextEncoder();
  return { content: encoder.encode(eml), filename };
}


Outlook Azure DevOps Integration
---------------------------------

Attach emails to Azure DevOps work items directly from Outlook. Select one or more work items by ID, and the email is uploaded as an `.eml` attachment.

Works with the new Outlook (Windows, web, Mac) and classic Outlook desktop.

### Setup

```bash
cd ADOIntegration
npm install
npm start
```

This starts a dev server on `https://localhost:44366`. You'll need the [Office dev certs](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins) installed:

```bash
npx office-addin-dev-certs install
```

### Sideloading

1. Open Outlook (new or web)
2. Open any email → **Get Add-ins** → **My add-ins** → **Add a custom add-in** → **Add from file...**
3. Select `ADOIntegration/manifest.xml`

### Usage

1. Open an email you want to attach.
2. Click **"Attach to ADO"** in the ribbon.
3. On first use, configure your Azure DevOps org URL, project, and authentication (PAT or Entra ID).
4. Enter a work item ID and click **Add**. Repeat for multiple work items.
5. Click **Attach** — the email is uploaded as an `.eml` file to each selected work item.

### Authentication

Two methods supported, depending on your account type:

- **Personal Access Token (PAT)** — Required for **personal Microsoft accounts**. Generate a token at `https://dev.azure.com/{your-org}/_usersSettings/tokens` with **Work Items: Read & Write** scope. Paste it into the add-in settings. No Azure app registration needed.
- **Microsoft Entra ID (OAuth)** — Available for **work or school accounts** only. Signs in via a popup using MSAL.js. Requires an [Azure App Registration](https://portal.azure.com) with the `Azure DevOps user_impersonation` delegated permission and a **SPA** redirect URI pointing to the add-in's `taskpane.html`.

> **Which should I use?** If you log into Azure DevOps with a `@outlook.com`, `@hotmail.com`, or `@gmail.com` address, use **PAT**. If you use a corporate/school email (`@yourcompany.com`), either method works.

### Tech Stack

- TypeScript, React, Fluent UI
- Office.js (Outlook Mail Read add-in)
- Azure DevOps REST API v7.1
- MSAL.js for Entra ID authentication

---

Legacy: TFS Integration (archived)
-----------------------------------

The original VSTO add-in for classic Outlook + TFS is in `TFSIntegration/`. It is no longer maintained — VSTO is not supported in the new Outlook.

See [CHANGELOG.md](CHANGELOG.md) for version history. | [Privacy Policy](ADOIntegration/public/privacy.html) | [Terms of Use](ADOIntegration/public/terms.html)

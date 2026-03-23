# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repo contains two versions of an Outlook add-in that attaches emails to work items:

- **`TFSIntegration/`** — Legacy VSTO add-in (.NET 4.0, C#) targeting classic Outlook + TFS. No longer maintained.
- **`ADOIntegration/`** — Modern Office Add-in (TypeScript, React, Fluent UI) targeting new Outlook (Windows, web, Mac) + Azure DevOps. **Active development.**

## ADOIntegration — Build Commands

```bash
cd ADOIntegration

# Install dependencies
npm install

# Development server (https://localhost:3000)
npm start

# Production build
npm run build
```

No tests yet. Sideload for manual testing via the Outlook developer tools or `npx office-addin-debugging start manifest.json`.

## ADOIntegration — Architecture

Modern Office Add-in using TypeScript + React + Fluent UI + Office.js. Runs as a web app inside Outlook's webview.

**Entry points:**
- `manifest.json` — Unified manifest declaring ribbon button on `mailRead` context
- `src/taskpane/index.tsx` — React mount point, wraps app in FluentProvider
- `src/commands/commands.ts` — Ribbon command handler (opens task pane)

**Core flow:**
1. User opens email → clicks "Attach to ADO" in ribbon → task pane opens
2. `App.tsx` — Main component: auth gate → settings gate → work item UI
3. `components/ConnectionSettings.tsx` — Configure Azure DevOps org URL, project, and auth method (Entra ID or PAT)
4. `components/WorkItemInput.tsx` — Enter work item ID, fetches title via REST API
5. `components/WorkItemList.tsx` — Shows added work items with remove option
6. `components/AttachButton.tsx` — Exports email as EML via `getAsFileAsync()`, uploads to Azure DevOps (2-step: upload attachment → link to work item)

**Services:**
- `services/auth.ts` — MSAL.js Entra ID OAuth (popup flow)
- `services/patAuth.ts` — PAT-based auth fallback (Basic auth header)
- `services/azureDevOps.ts` — Azure DevOps REST API v7.1 (getWorkItem, attachFileToWorkItem, validateConnection)
- `services/outlook.ts` — Office.js email export (getAsFileAsync with fallback EML construction)

**Settings:** Persisted via `Office.context.roamingSettings` (roams across devices).

**Key deps:** `@fluentui/react-components`, `@azure/msal-browser`, `@azure/msal-react`, `office-js`

## TFSIntegration — Legacy (archived)

```bash
msbuild TFSIntegration.sln /p:Configuration=Debug
```

VSTO add-in, .NET 4.0, uses `Microsoft.TeamFoundation.Client` for TFS connectivity. See old code for reference only.

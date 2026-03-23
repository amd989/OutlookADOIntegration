# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2.0.0] - 2026-03-23

### Changed
- Complete rewrite as a modern Office Add-in (TypeScript, React, Fluent UI)
- Replaced TFS with Azure DevOps REST API v7.1
- Email attached as `.eml` instead of `.msg`
- Authentication via Personal Access Token or Microsoft Entra ID (replaces Windows-integrated TFS auth)
- Works in new Outlook (Windows, web, Mac) in addition to classic Outlook

### Removed
- VSTO/.NET dependency (legacy code preserved in `TFSIntegration/`)
- ClickOnce installer (replaced by Office Add-in sideloading)

## [1.0.0.9] - 2015-04-26

### Changed
- Renamed the title to depict you can add attachments to work items (bugs, tasks, etc.)

## [1.0.0.8] - 2015-01-28

### Added
- Background worker to avoid UI freeze

### Fixed
- Bug when adding email to multiple tasks

## [1.0.0.6] - 2014-10-31

### Added
- Initial release

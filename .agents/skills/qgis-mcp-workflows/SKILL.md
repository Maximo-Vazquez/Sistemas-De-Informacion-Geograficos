---
name: qgis-mcp-workflows
description: "Use when operating a live QGIS project through the QGIS MCP server: inspect layers, run geoprocessing, style maps, or export results. For general GIS questions or offline PyQGIS scripts, use the normal workflow."
---

# QGIS MCP Workflows

Use the connected QGIS MCP tools to work with the currently open QGIS project.

## Workflow

- Start with `ping` and `diagnose`. If the plugin and server versions do not match, resolve that before using project tools.
- Inspect the active project and its layers before making changes. Check layer IDs, geometry types, fields, coordinate reference systems, and data sources instead of guessing from layer names.
- Prefer purpose-built MCP tools for edits, processing, styling, and exports. Use `execute_code` only when the available tools cannot express the requested operation.
- Before editing, identify whether the user expects changes in the open project, a new output layer, or an exported file. Preserve source data when a derived result will satisfy the request.
- Verify operation results in QGIS by checking the affected layer, output path, feature count, or rendered map as appropriate.
- QGIS project changes in the open session are not necessarily saved to disk. Use `save_project` when the user asks to persist the project, and preserve the existing project path unless a new path is requested.
- Rely on the MCP tool's destructive annotations and client confirmation for irreversible edits. If a write call times out or its result is unclear, inspect the project state before retrying it.

The bridge must be running in QGIS for MCP calls to work. If it is unavailable, report the connection state and offer a PyQGIS script as a fallback.

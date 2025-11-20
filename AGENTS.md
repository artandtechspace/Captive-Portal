# Agent Working Agreements

Diese Richtlinien gelten für das gesamte Repository und definieren die Erwartungen für konsistente, wartbare Beiträge.

## General Writing Style
- Write documentation and other textual deliverables in German with clear sentences and appropriate Markdown structure (headings, lists, tables).
- **Constraint:** Keep the initial HTML file for portal pages strictly below **128 KB** (iOS CNA Limit). Move large assets to separate files.
- Ensure that every UI remains fully usable within a 900 × 572 px viewport.

## Build and Execution Process
- Run `npm run preflight` before every commit.
- Record all automated and manual checks in project logs or pull-request descriptions.

## Development Environment & Troubleshooting
- **Docker Network Conflicts:** Be aware that the default Docker bridge network (`172.17.x.x` range) frequently conflicts with public WiFi captive portals (e.g., Deutsche Bahn WiFiOnICE). Developers testing on Linux must ensure their Docker subnets do not overlap with the portal's DHCP range to avoid connectivity failures.
- **Manual Triggering:** Use plain HTTP URLs (e.g. `http://captive.apple.com`) to manually trigger the portal redirect logic if HTTPS fails silently.

## Writing Tests (Vitest)
- Use Vitest consistently (`describe`, `it`, `expect`, `vi`).
- Mock external dependencies using `vi.mock`.

## JavaScript and TypeScript Guidelines
- Prefer plain objects with explicit TypeScript type definitions over classes.
- Avoid `any`. Use `unknown` and narrow it afterwards.

## React Guidelines & Portal Constraints
- **No Persistent State:** Do not implement features that rely on `localStorage` or persistent Cookies (e.g., "Remember Me" or persistent language selection) as these are wiped immediately after the Captive Network Assistant closes.
- **Navigation:** Do not use `target="_blank"`. All links must open in the current frame/window to function correctly within the restricted CNA browser environment.
- **Error Handling:** Implement robust error handling for network requests, as CNAs often intercept or block requests unpredictably before full authentication.

## Browser and Platform Requirements
- Do not use modal dialogs (`alert`, `confirm`) in portal-specific code.
- Continuously document known limitations and workarounds for the iOS/macOS Captive Network Assistant.

## Documentation and Communication
- Describe all executed tests and manual checks in pull-request summaries.
# Agent Working Agreements

Diese Richtlinien gelten für das gesamte Repository und bilden den Rahmen für konsistente, wartbare Beiträge.

## Allgemeine Schreibweise
- Verfasse Dokumentation und sonstige Texte ausschließlich auf Deutsch, nutze klare Sätze und strukturiere Inhalte mit Markdown (Überschriften, Listen, Tabellen).
- Halte die initiale HTML-Datei von Portalseiten kleiner als 128 KB und lagere umfangreiche Assets aus.
- Stelle sicher, dass alle Oberflächen vollständig in einem Viewport von 900 × 572 px bedienbar sind.

## Build- und Ausführungsprozess
- Führe vor jedem Commit `npm run preflight` aus. Der Befehl baut das Projekt, führt Tests aus, prüft Typen und lintet den Code in einem Schritt.
- Optional kannst du die Einzelschritte (`npm run build`, `npm run test`, `npm run typecheck`, `npm run lint`) gezielt einsetzen, um lokale Probleme einzugrenzen.
- Halte alle automatischen und manuellen Checks in Projektprotokollen oder Pull-Request-Beschreibungen fest.

## Tests schreiben (Vitest)
- Verwende durchgehend Vitest (`describe`, `it`, `expect`, `vi`) und orientiere dich am vorhandenen Teststil.
- Lege Testdateien (`*.test.ts`, `*.test.tsx`) direkt neben den zu prüfenden Quellmodulen ab. Testumgebungen sind in den jeweiligen `vitest.config.ts`-Dateien definiert.
- Bereite Mocks mit `vi.mock('modul', async (importOriginal) => { ... })` vor. Verwende `importOriginal`, um reale Implementierungen selektiv zu übernehmen.
- Platziere kritische `vi.mock`-Aufrufe am Anfang der Testdatei (vor allen Imports) und nutze bei Bedarf `const myMock = vi.hoisted(() => vi.fn());`.
- Setze `beforeEach` ein, um Mocks mit `vi.resetAllMocks()` zurückzusetzen, und `afterEach`, um sie via `vi.restoreAllMocks()` wiederherzustellen.
- Erzeuge Mock-Funktionen mit `vi.fn()` und bestimme ihr Verhalten über `mockImplementation`, `mockResolvedValue` oder `mockRejectedValue`. Verwende `vi.spyOn` für Spies und restauriere sie anschließend.
- Häufig gemockte Module sind u. a. Node-Built-ins (`fs`, `fs/promises`, `os`, `path`, `child_process`), externe SDKs (`@google/genai`, `@modelcontextprotocol/sdk`) sowie interne Projektpakete.
- Teste Ink-Komponenten mit `render()` aus `ink-testing-library`, werte `lastFrame()` aus und kapsle sie in notwendige `Context.Provider`.
- Nutze `async`/`await` für asynchrone Logik. Bei Timern kommen `vi.useFakeTimers()`, `vi.advanceTimersByTimeAsync()` und `vi.runAllTimersAsync()` zum Einsatz. Promise-Ablehnungen prüfst du mit `await expect(promise).rejects.toThrow(...)`.
- Studiere vor neuen Tests bestehende Dateien, um Mocking-Reihenfolgen und Konventionen zu verstehen.

## Git-Workflow
- Die Hauptentwicklungsarbeit erfolgt auf dem Branch `main`.

## JavaScript und TypeScript
- Bevorzuge Plain-Objects mit klaren TypeScript-Typdefinitionen gegenüber Klassenkonstrukten.
- Nutze ES-Module (`import`/`export`) zur Abgrenzung von öffentlicher und privater API, anstatt auf Klassenkapselung zu setzen.
- Vermeide `any`. Greife bei unbekannten Werten zu `unknown` und führe anschließend Typverfeinerungen durch.
- Setze Type Assertions (`as ...`) nur sehr sparsam ein und hinterfrage sie kritisch.
- Für `switch`-Verzweigungen verwende im `default`-Zweig den Helfer `checkExhaustive` aus `packages/cli/src/utils/checks.ts`, um Exhaustivität sicherzustellen.
- Arbeite bei Daten-Transformationen bevorzugt mit Array-Operatoren wie `.map()`, `.filter()`, `.reduce()`, `.slice()` oder `.sort()`, um Immutabilität zu wahren.

## React-Richtlinien
- Implementiere ausschließlich Funktionskomponenten mit Hooks (`useState`, `useReducer`, …); Klassenkomponenten sind tabu.
- Halte Render-Funktionen rein. Nebenwirkungen, Abonnements und externe Synchronisation gehören in `useEffect` (mit vollständigen Abhängigkeiten) oder in Event-Handler.
- Mutierst du Zustand nie direkt. Verwende Spread-Operatoren, Kopien oder funktionale Updates (`setState(prev => ...)`).
- Befolge strikt die Rules of Hooks: Keine Hook-Aufrufe in Schleifen, Bedingungen oder verschachtelten Funktionen.
- Setze Refs nur ein, wenn sie zwingend erforderlich sind (z. B. DOM-Fokus, Animationen, Integration externer Bibliotheken) und greife nicht während des Renderns auf `ref.current` zu.
- Strukturiere Komponenten klein und wiederverwendbar. Ziehe gemeinsame Logik in Custom Hooks aus, statt sie zu duplizieren.
- Schreibe Code, der mit React-Concurrency kompatibel bleibt (z. B. durch funktionale State-Updates und vollständige Cleanups in Effekten).
- Vermeide unnötige `useEffect`-Einsätze; setze sie nur zur Synchronisation mit externen Zuständen ein.
- Optimierungen wie `useMemo`, `useCallback` oder `React.memo` sind nur nötig, wenn der React-Compiler sie nicht übernehmen kann. Konzentriere dich auf klaren, datenflussorientierten Code.
- Plane Datenabfragen so, dass sie parallel stattfinden können, nutze Suspense sinnvoll und präsentiere leichte Ladezustände sowie robuste Fehlerbehandlung.
- Gestalte Nutzererlebnisse nicht blockierend: Zeige dezente Platzhalter, behandle Fehler freundlich und ermögliche schrittweises Rendern verfügbarer Daten.

## Browser- und Plattformanforderungen
- Verzichte in portal-spezifischem Code auf `sessionStorage`, `localStorage` sowie modale Dialoge (`alert`, `confirm`).
- Dokumentiere bekannte Einschränkungen und Workarounds für den iOS/macOS Captive Network Assistant laufend.

## Dokumentation & Kommunikation
- Ergänze Release-Notes und Projektprotokolle um relevante Änderungen, Entscheidungen und offene Punkte.
- Beschreibe in Pull-Request-Zusammenfassungen stets die durchgeführten Tests und manuellen Prüfungen.

## Kommentarrichtlinie
- Schreibe nur dann Code-Kommentare, wenn sie einen klaren Mehrwert liefern. Nutze Kommentare nicht für Kommunikation mit dem Review-Team.

## Allgemeine Stilanforderungen
- Verwende in Flag-Namen Bindestriche statt Unterstrichen (z. B. `my-flag` statt `my_flag`).

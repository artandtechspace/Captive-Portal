# Agent Working Agreements

Diese Richtlinien gelten für das gesamte Repository und sollen sicherstellen, dass zukünftige Änderungen konsistent und pflegeleicht bleiben.

## Allgemeine Schreibweise
- Verwende für Dokumentation und Textinhalte deutsche Sprache in klaren, kurzen Sätzen.
- Strukturierte Informationen sollen mit Markdown-Überschriften, Listen oder Tabellen gegliedert werden.
- Halte die initiale HTML-Datei von Portalseiten kleiner als 128 KB; große Assets müssen ausgelagert werden.

## JavaScript und Browser-Kompatibilität
- Verzichte auf Abhängigkeiten von `sessionStorage`, `localStorage` oder modalen Dialogen (`alert`, `confirm`) in Portal-spezifischem Code.
- Stelle sicher, dass UI-Flächen in einem 900 × 572 px großen Viewport vollständig nutzbar sind.

## Tests und Dokumentation
- Beschreibe relevante Tests oder manuelle Prüfungen für Änderungen in der Zusammenfassung.
- Dokumentiere bekannte Einschränkungen und Workarounds für iOS/macOS Captive Network Assistant.

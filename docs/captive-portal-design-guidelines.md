# Design- und Implementierungsrichtlinien für Captive-Portale

Diese Richtlinien fassen die wichtigsten Anforderungen für die Gestaltung von Splash- und Login-Seiten in Captive-Portalen zusammen. Sie sollen sicherstellen, dass die Portale auf eingeschränkten Mini-Browsern zuverlässig funktionieren und eine gute Benutzererfahrung bieten.

## Ressourcengröße und Performance

- Halte die initiale HTML-Datei kleiner als 128 KB, damit iOS-Geräte die Seite korrekt anzeigen können.
- Vermeide inline Styles, Bilder und Skripte. Lade stattdessen optimierte externe Ressourcen nach.
- Minimiere JavaScript und CSS, um Ladezeiten zu verkürzen.

## JavaScript und Speicher

- Plane das Portal so, dass es ohne `sessionStorage` und `localStorage` funktioniert, da diese in den Captive-Portalen von iOS und macOS deaktiviert sein können.
- Verzichte auf modale Browserdialoge wie `window.alert()` oder `window.confirm()`, da sie nicht dargestellt werden.
- Nutze alternative Mechanismen (z. B. leichte State-Management-Lösungen) statt persistenter Cookies, da diese beim Schließen der Portalansicht verloren gehen.

## Responsive Gestaltung und Bedienung

- Entwerfe Layouts, die vollständig innerhalb eines Fensters mit fester Größe von 900 × 572 px dargestellt werden können.
- Achte auf einfache, leichtgewichtige Layouts und vermeide große Bilder oder komplexe Komponenten.
- Stelle sicher, dass wichtige Bedienelemente (Formulare, Buttons, Hinweise) ohne Scrollen erreichbar sind.

## Benutzererfahrung

- Gestalte den Anmeldeprozess so kurz wie möglich, da Cookies und lokale Speicherung nicht erhalten bleiben.
- Verzichte auf unnötige Weiterleitungen oder komplexe Single-Page-Applications.
- Biete eine barrierearme Darstellung mit klaren Anweisungen und sichtbarem Fokus-Management.

## Sicherheit und Datenschutz

- Stelle sicher, dass das Portal immer per HTTPS erreichbar ist.
- Biete transparente Datenschutz- und Einwilligungshinweise an und protokolliere notwendige Opt-ins (z. B. für Marketing).
- Berücksichtige die DSGVO bei der Erfassung und Verarbeitung personenbezogener Daten.

## Apple/macOS-spezifische Einschränkungen

- Neue Fenster oder Tabs können nicht geöffnet werden, plane alle Interaktionen innerhalb derselben Ansicht.
- Cookies werden nicht persistent gespeichert und gehen nach dem Schließen der Captive Network Assistant (CNA) verloren.
- Die CNA lässt sich nicht skalieren oder minimieren; überlange Seiten werden abgeschnitten.
- Teste das Portal regelmäßig auf iOS- und macOS-Geräten, um die Einhaltung dieser Einschränkungen zu überprüfen.

## Teststrategie

- Prüfe jede Iteration des Portals auf den wichtigsten Plattformen (iOS, macOS, Android, Windows).
- Dokumentiere Abweichungen und Workarounds für Plattformbeschränkungen.
- Automatisiere Smoke-Tests soweit möglich, um Regressionen zu vermeiden.

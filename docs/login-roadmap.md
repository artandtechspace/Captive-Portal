# Roadmap für Verbesserungen der Login-Seite

## Kurzfristig (1–2 Sprints)

- **Deutlichere Fehlermeldungen und Inline-Hinweise**  
  Aktuell wird bei fehlgeschlagenem Login nur ein generischer Toast mit der Fehlermeldung angezeigt (`toast({ title: translateString('errors.authenticationFailed', ...) })`).【F:src/pages/LoginPage.tsx†L108-L123】  
  Ergänze Feld-spezifische Fehlermeldungen und visuelles Feedback direkt unter den Eingabefeldern, um Benutzer:innen schneller auf Probleme hinzuweisen.
- **Bessere Tastatur-Navigation**  
  Die Checkbox zur Zustimmung der Nutzungsbedingungen ist zwar fokussierbar, aber der Fokusstil ist abhängig vom Browser. Ergänze klar sichtbare Fokus-Stile (z. B. `focus:ring`) für `Input`, `Checkbox` und `Button`, um die Barrierefreiheit zu erhöhen.【F:src/pages/LoginPage.tsx†L135-L186】
- **Ladezustand differenziert darstellen**  
  Während `busy` aktiv ist, wird nur das Formular deaktiviert und ein Spinner im Button angezeigt.【F:src/pages/LoginPage.tsx†L88-L121】【F:src/pages/LoginPage.tsx†L187-L214】  
  Füge einen globalen Ladeindikator oder eine Überlagerung hinzu, damit klar ist, dass eine Anfrage verarbeitet wird.

## Mittelfristig (3–5 Sprints)

- **Passwort-Sichtbarkeit steuern**  
  Das Passwortfeld erlaubt derzeit kein Umschalten der Sichtbarkeit (`type="password"`).【F:src/pages/LoginPage.tsx†L150-L165】  
  Ergänze ein Icon oder einen Button zum Anzeigen/Verbergen des Passworts, um Eingabefehler zu reduzieren.
- **Persistente Spracheinstellungen**  
  Die Seite nutzt `useTranslations()`, reagiert aber nur auf aktuelle Übersetzungen ohne Auswahlmöglichkeit.【F:src/pages/LoginPage.tsx†L28-L39】【F:src/pages/LoginPage.tsx†L202-L233】  
  Implementiere einen sichtbaren Sprachumschalter im Header und speichere die Auswahl (z. B. in `localStorage`).
- **Anonyme Anmeldung klarer trennen**  
  Der Button für den anonymen Login erscheint nur bei `state === 'anonymous'`, ohne zusätzliche Erläuterung.【F:src/pages/LoginPage.tsx†L215-L223】  
  Ergänze eine Beschreibung oder einen Hinweistext, der erklärt, wann und warum diese Option verfügbar ist.

## Langfristig (6+ Sprints)

- **Responsives Layout weiter optimieren**  
  Das Layout ist auf max. `max-w-lg` begrenzt und nutzt fixe Bildbreiten (`w-24`, `w-32`, `w-96`).【F:src/pages/LoginPage.tsx†L205-L233】【F:src/pages/LoginPage.tsx†L238-L257】  
  Überarbeite die Komponenten so, dass Logos und Kartenhöhe sich flexibler an unterschiedliche Bildschirmgrößen anpassen.
- **Erweiterte Sicherheitsfunktionen**  
  Aktuell gibt es keine Hinweise zu mehrstufiger Authentifizierung oder Passwort-Richtlinien.【F:src/pages/LoginPage.tsx†L135-L186】  
  Plane mittelfristig die Integration von MFA-Unterstützung und Hinweise zu sicheren Passwörtern.
- **Analytics & Erfolgsmessung**  
  Bisher werden keine Interaktionen (z. B. erfolgreiche/fehlgeschlagene Logins) clientseitig erfasst.【F:src/pages/LoginPage.tsx†L88-L214】  
  Implementiere ein anonymisiertes Tracking (unter Einhaltung der Datenschutzbestimmungen), um Engpässe zu identifizieren.

## Voraussetzungen & Abhängigkeiten

- Abstimmung mit dem Backend-Team zur Erweiterung der API für MFA und erweiterte Fehlermeldungen.【F:src/pages/LoginPage.tsx†L61-L123】
- UX-Review für Fokus-Stile, beschreibende Texte und die Positionierung neuer Bedienelemente.
- Datenschutz- und Security-Review vor der Einführung von Analytics und MFA.

# Design- und Implementierungsrichtlinien für Captive-Portale

Diese Richtlinien basieren auf technischen Einschränkungen von Captive Network Assistants (CNA) unter iOS, macOS, Android und Windows.

## Ressourcengröße und Performance

- **Initiales HTML-Limit (iOS):** Die *initiale* HTML-Datei (ohne externe Assets) muss zwingend **unter 128 KB** bleiben. Größere HTML-Dateien können dazu führen, dass das Portal auf iOS-Geräten gar nicht angezeigt wird, obwohl Assets nachgeladen werden dürften.
- **Vermeidung von Inline-Code:** Da das HTML-Limit strikt ist, lagere CSS und JavaScript in externe Dateien aus.

## Technische Auslösung und Netzwerkverhalten

- **HTTP vs. HTTPS Trigger:** Das Captive-Portal wird in der Regel durch eine HTTP-Anfrage (Port 80) ausgelöst. HTTPS-Anfragen (Port 443) können nicht ohne Zertifikatswarnung umgeleitet werden und führen oft zu einem Timeout ohne Portal-Anzeige.
- **Erkennungs-URLs (Status Codes):**
    - Apple-Geräte prüfen auf eine "Success"-Seite (Status 200) unter URLs wie `http://captive.apple.com/hotspot-detect.html`.
    - Android/Google-Geräte prüfen oft auf einen 204 (No Content) Status (z.B. `http://connectivitycheck.gstatic.com/generate_204`).
    - **Implikation:** Das Portal muss diese Requests abfangen und stattdessen die Login-Seite (Status 200) ausliefern, solange der Nutzer nicht authentifiziert ist.
- **Caching verhindern:** Sende strikte HTTP-Header (`Cache-Control: no-cache, no-store, must-revalidate`), um zu verhindern, dass Browser die Portal-Seite cachen und den Login-Flow beim nächsten Mal überspringen.

## JavaScript und Speicher

- **Keine Persistenz (Cookies/Storage):** Verlasse dich **niemals** auf `localStorage`, `sessionStorage` oder persistente Cookies für dauerhafte Einstellungen (wie "Sprache merken"). CNAs agieren oft als "Wegwerf-Sessions": Sobald der User auf "Fertig" klickt, werden alle Daten gelöscht.
- **Keine Modalen Dialoge:** `window.alert()` und `window.confirm()` werden in vielen CNA-Browsern unterdrückt und sollten durch HTML-Overlays ersetzt werden.

## Responsive Gestaltung und Bedienung

- **Viewport:** Das Layout muss in einem Fenster von **900 × 572 px** (typische Desktop-CNA-Größe) ohne horizontales Scrollen funktionieren.
- **Manuelles Auslösen:** Biete Nutzern den Hinweis, eine explizite HTTP-Seite (z.B. `http://neverssl.com`) aufzurufen, falls sich das Portal nicht automatisch öffnet. Dies umgeht Probleme mit HSTS/HTTPS.

## Apple/macOS-spezifische Einschränkungen

- **Keine neuen Fenster (`target="_blank"`):** Links, die versuchen, ein neues Fenster zu öffnen, werden im CNA oft ignoriert (öffnen im selben Frame) oder blockiert. Führe alle Navigationen im selben Fenster (`_self`) durch.
- **Ein-Seiten-Logik:** Versuche, den gesamten Login-Prozess auf einer URL oder mit minimalen Redirects abzubilden, um die CNA-Session stabil zu halten.

## Teststrategie und bekannte Konflikte

- **Docker-Netzwerk-Konflikt (Linux):** Entwickler mit Docker auf Linux haben oft Probleme, Captive Portals (z.B. im ICE/Bahn) zu erreichen.
    - *Ursache:* Das Standard-Docker-Netzwerk (`172.17.0.0/16` oder `172.18.0.0/16`) überschneidet sich oft mit den IP-Bereichen öffentlicher Hotspots.
    - *Lösung:* Vor dem Testen Docker stoppen oder die `default-address-pools` in der `daemon.json` ändern.
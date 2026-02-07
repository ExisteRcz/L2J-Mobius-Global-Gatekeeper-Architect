# L2J Mobius Global Gatekeeper Architect

Profesionální nástroj pro vývojáře **L2J Mobius (Interlude)**.

## ⚠️ Proč vidím jen modrou obrazovku?
Pokud otevřeš `index.html` přímo z disku (dvojklikem), prohlížeč zablokuje důležité funkce. Pro správný chod musí aplikace běžet na serveru (online nebo lokálním).

## 🚀 Jak z toho udělat PC aplikaci (bez instalace serveru)
Nejjednodušší cesta, jak mít "ikonu na ploše" bez instalace web serveru:

1. **Nahraj projekt na GitHub**:
   - Vytvoř repozitář na svém GitHubu.
   - Nahraj tam všechny soubory.
2. **Zapni GitHub Pages**:
   - Jdi do `Settings` -> `Pages`.
   - V sekci "Build and deployment" zvol branch `main` a složku `/(root)`.
   - Klikni na `Save`.
3. **Instalace do PC**:
   - Počkej cca 1 minutu, až ti GitHub vygeneruje adresu (např. `https://tvoje-jmeno.github.io/tvuj-repo/`).
   - Otevři tuto adresu v Chrome nebo Edge.
   - V adresním řádku vpravo uvidíš ikonu monitoru se šipkou (**Instalovat aplikaci**).
   - Klikni na ni. Aplikace se ti přidá do Startu a na plochu jako běžný program.

## ✨ Funkce
- **Vizuální Editor**: Navrhuj teleporty bez psaní kódu.
- **In-Game Simulace**: Vyzkoušej si, jak bude dialog vypadat ve hře.
- **AI Generátor**: Gemini API ti vytvoří XML a HTML soubory přímo pro Mobius.
- **Auto-Save**: Vše se ukládá do paměti prohlížeče, o nic nepřijdeš.

## 🛠 Vývojářské instrukce
Pokud chceš aplikaci upravovat lokálně a vidět změny, doporučuji použít rozšíření **"Live Server"** ve VS Code, nebo v terminálu spustit:
`npx serve .` (pokud máš Node.js) nebo `python -m http.server` (pokud máš Python).

---
*Vytvořeno jako součást vývojářského toolsetu pro L2J Mobius.*

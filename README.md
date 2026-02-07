# L2J Mobius Global Gatekeeper Architect

Tento nástroj je specializovaný editor pro tvorbu Global Gatekeepera pro projekt [L2J Mobius](https://gitlab.com/MobiusDevelopment/L2J_Mobius).

## Struktura projektu
Aplikace je navržena jako monolit pro maximální jednoduchost:
- `index.html`: Základní kostra a konfigurace modulů.
- `index.tsx`: Veškerá logika, UI komponenty a propojení s Gemini AI.
- `metadata.json`: Informace o aplikaci.
- `manifest.json`: Web manifest pro možnost instalace jako PWA.

## Hlavní funkce
1. **Editor**: Vizuální správa kategorií a teleportů.
2. **Preview**: Reálná simulace Lineage 2 dialogu.
3. **AI Code Generator**: Automatické generování XML a HTML kódu pro Mobius server pomocí Google Gemini.

## Instalace a běh
Aplikace nevyžaduje žádnou instalaci. Stačí otevřít `index.html` v libovolném moderním prohlížeči. Pro generování kódu je vyžadován přístup k internetu (API volání).

---
*Vytvořeno pro komunitu L2J Mobius Development.*
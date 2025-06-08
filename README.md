# Hidden Message Encoder / Decoder (emoji + text steganography)

![version](https://img.shields.io/badge/version-2025--06--07.11-blue)
![tampermonkey](https://img.shields.io/badge/Userscript-Tampermonkey-orange)
![License](https://img.shields.io/badge/license-MIT-green)

> Hide any UTF-8 text inside **invisible Unicode variation selectors**  (extending the excellent work of [emoji-encoder](https://github.com/paulgb/emoji-encoder))
---

## ⚡ Quick Start

1. **Install Tampermonkey**

3. **Grab the script**  
   *Preferred:* **Click** <kbd>Raw</kbd> on [`demojify.user.js`](./demojify.user.js).
   [>or click here<](https://raw.githubusercontent.com/aporeticaxis/demojify/main/demojify.user.js)
   Tampermonkey pops up an *Install* dialog automatically.  
   *Alternate:* Copy the code → Tampermonkey Dashboard → **➕ Create** → paste → **Save**.

5. Reload any page – the 🕵️ button appears bottom-right.

6. • **Encode:** `Ctrl + Shift + F` → type secret → pick emoji → copy  
   • **Decode:** select text → `Ctrl + Shift + V`

*(Everything runs 100 % locally – no data ever leaves your browser.)*

---

## 📸 UI Tour

| Screen | What to Capture | Suggested Filename |
| ------ | --------------- | ------------------ |
| Floating 🕵️ button | Full browser window, bottom-right badge highlighted | ![screenshot_fab.png](https://private-user-images.githubusercontent.com/123844654/452700135-908ba736-05b5-446a-8b50-6478711a11b7.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDkzNTEwMDgsIm5iZiI6MTc0OTM1MDcwOCwicGF0aCI6Ii8xMjM4NDQ2NTQvNDUyNzAwMTM1LTkwOGJhNzM2LTA1YjUtNDQ2YS04YjUwLTY0Nzg3MTFhMTFiNy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNjA4JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYwOFQwMjQ1MDhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT02OTIxN2VlMGMwNDRkNTc0YjkyZGIxYzllNWIzNjc3YjEyNGM5MDA1MTYxMjE4NDUyNTQ4YmI0NTFlNjY4MjUzJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.kRVMYLDjERJEgpxPmbZIkaoRqyJGOKaBLtGyFHW5_Lc) |
| Decode modal | Paste field + decoded result visible | ![screenshot_decode_modal.png](https://private-user-images.githubusercontent.com/123844654/452700140-0dc64eef-c251-4ea0-ab48-16918e141f1a.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDkzNTEwMDgsIm5iZiI6MTc0OTM1MDcwOCwicGF0aCI6Ii8xMjM4NDQ2NTQvNDUyNzAwMTQwLTBkYzY0ZWVmLWMyNTEtNGVhMC1hYjQ4LTE2OTE4ZTE0MWYxYS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNjA4JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYwOFQwMjQ1MDhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0xNTliZjNhZjA3YmNmMjFiZTQyZjczNGZkNjQ0ZWRlNzQ5OGQxNmM3ODQ4YmQ5OTk5NjBkOTFhMWNhMTc1ZTM1JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.XSIgR7l7josZ41WnJiG0VpJs0Zwn-OWWdyARvj_LLYQ) |
| Encode → 1-Click | Secret text, emoji grid, green “Copied!” toast | ![screenshot_encode_1click.png](https://private-user-images.githubusercontent.com/123844654/452700136-0560167a-ede2-4294-b490-5ef299c24b30.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDkzNTEwMDgsIm5iZiI6MTc0OTM1MDcwOCwicGF0aCI6Ii8xMjM4NDQ2NTQvNDUyNzAwMTM2LTA1NjAxNjdhLWVkZTItNDI5NC1iNDkwLTVlZjI5OWMyNGIzMC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNjA4JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYwOFQwMjQ1MDhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0zMGRkODExOWExOTc2MzMzZjliNjk4Yzc1YTk0YWEzMDZkOTA4ZWIyMTliN2U2MzU3YTNhODRjMDYyNmM4NjA4JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.-nqVfRZJPd_O5hgUG9u6mUaKl-8ol80WEnY4lKORmT0) |
| Encode → Free Form | Custom carriers area with mixed emoji/text | ![screenshot_encode_freeform.png](https://private-user-images.githubusercontent.com/123844654/452700138-97b18afa-d63d-4232-adb5-f1d34ee51577.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDkzNTEwMDgsIm5iZiI6MTc0OTM1MDcwOCwicGF0aCI6Ii8xMjM4NDQ2NTQvNDUyNzAwMTM4LTk3YjE4YWZhLWQ2M2QtNDIzMi1hZGI1LWYxZDM0ZWU1MTU3Ny5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNjA4JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYwOFQwMjQ1MDhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0yZGE2ZjEyMDBlZWIyZDI1NTQyMjhmMTQ1OTI0MzdjMzExMmNhMGM1MzNjNjJjOTliYjlmODMzYWNlNGE4MTM1JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.jB-_k-CL2WglyTrDKrplm4aI_JPZ1CI6X-8dLbw-b54) |
| **Beta Scanner** highlight | Encoded text inline + yellow dashed border + tooltip | ![screenshot_beta_scanner.png](https://private-user-images.githubusercontent.com/123844654/452700139-f53d90db-70b5-4c16-a984-428485e7e0fc.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDkzNTEwMDgsIm5iZiI6MTc0OTM1MDcwOCwicGF0aCI6Ii8xMjM4NDQ2NTQvNDUyNzAwMTM5LWY1M2Q5MGRiLTcwYjUtNGMxNi1hOTg0LTQyODQ4NWU3ZTBmYy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNjA4JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYwOFQwMjQ1MDhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1iY2E3MDhhMzc5ZTgxMmU4MTg5NGRhNmUxOTQ0N2EzNjI1YmJhOTM2NzA0NzIxNzQyZjBkYzMwOWY2ZGI3YWIyJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.z3xmt5R-11Xe-sIgUxCmZIZ2HObSL2gvWv6dcqNr0dQ)|

---

## ✨ Key Features

* **Invisible steganography** – uses the full 256-value variation-selector space.
* **Two encoding modes**

  * *1-Click* – fastest path: pick a single emoji/letter carrier.
  * *Free Form* – distribute bytes across any text/emoji string you supply.
* **Enhanced multi-encoding detection** – beta scanner detects 5+ encoding schemes (32-VS, 16-VS, ZW-SPACE, ZWJ-BINARY, auto-learned) with confidence validation and mapping identification.
* **Zero-dependency UI** – pure vanilla JS + CSS, SPA-safe (React, Vue, etc.).
* **Robust UTF-8 path** – custom byte encoder/decoder to bypass Firefox XRay quirks.

---

## 🔑 Shortcuts

| Action           | Keys                      | Context                           |
| ---------------- | ------------------------- | --------------------------------- |
| **Encode modal** | `Ctrl + Shift + F`        | anywhere                          |
| **Decode modal** | `Ctrl + Shift + V`        | anywhere (uses selection, if any) |
| **Close modal**  | `Esc`                     | inside modal                      |

---


## 🗺 Usage Guide

### Decode

1. **Select** any suspect text (optional).
2. Hit **`Ctrl + Shift + V`** – the modal auto-attempts all decode strategies.
3. If a payload exists, the green panel shows **“Hidden message:”**.

### Encode

* **1-Click**

  1. `Ctrl + Shift + F` → **1-Click** tab
  2. Type your secret → pick one carrier emoji/letter
  3. **Copy** – share the carrier anywhere.

* **Free Form**

  1. Same shortcut → **Free Form** tab
  2. Type secret → type or click emojis to build your custom carrier string
  3. **Encode Message** → copy.

### Beta Scanner (Enhanced Multi-Encoding Detection)

Flip the **🧪 "Highlight encoded text on page"** toggle in any modal.
The enhanced observer will:

* **Detect multiple encoding schemes**:
  - **32-VS**: Original Paul Butler method (0xFE00-0xFE0F, 0xE0100-0xE01EF)
  - **16-VS**: 4-bit nibble encoders using basic variation selectors
  - **ZW-SPACE**: Binary encoding with Zero Width Space (0x200B=1) / ZWNJ (0x200C=0)
  - **ZWJ-BINARY**: Binary encoding with Zero Width Joiner (0x200D=1) / ZWNJ (0x200C=0)
  - **Auto-learned**: Heuristic detection for unknown mapping patterns

* **Smart confidence checking** – validates decoded content as printable UTF-8 (≥75% readable)
* **Enhanced tooltips** showing:
  - Decoded message
  - Encoding type (e.g., "mapping: 32-VS" or "mapping: unknown")
  - **Copy raw selectors** button for unknown mappings (exports Unicode codepoints for external analysis)

* **Visual indicators** – mark encoded nodes with dashed yellow outline
* **Cross-SPA compatibility** – stays active across React/Vue navigations
* **Backward compatibility** – tries legacy methods first, then cascade detection

**Example tooltip output:**
```
Decoded: Hello World!
mapping: 32-VS

[📋 copy raw selectors]  // Only for unknown mappings
```

For unknown encodings, the raw selector button copies Unicode codepoints like:
`U+FE00 U+FE01 U+E0100` for advanced reverse engineering.

---

## 🧐 How It Works (nutshell)

```text
Secret "A"  → byte 0x41
            → Unicode VS  = U+FE41
            → rendered invisible after the chosen carrier glyph
```

* **Primary range**: U+FE00–FE0F (16 selectors)
* **Supplementary**: U+E0100–E01EF (240 selectors)
* Combined → full 0-255 byte coverage.

The script manually UTF-8-encodes/decodes without `TextEncoder` to dodge
Firefox XRay security wrappers that break typed arrays inside user scripts.

---

## 🐞 Troubleshooting

| Symptom                           | Fix                                                                    |
| --------------------------------- | ---------------------------------------------------------------------- |
| **No 🕵️ button**                 | Refresh, ensure Tampermonkey/Grease-Monkey is enabled for the site.    |
| **“No hidden message detected.”** | Verify the original wasn’t re-encoded by Slack/X; copy raw text. |
| **High CPU on long pages**        | Turn off Beta Scanner.                                                 |
| **Shortcuts ignored**             | Some sites intercept `ctrl+shift+F/V`; click the 🕵️ button instead.   |

---

## 🤝 Contributing

PRs welcome! Please include:

* Repro URL + browser + Tampermonkey version
* Dev-tools console logs with `[HiddenMsg]` prefix
* Before/after screenshots or GIF

---
[@aporeticaxis](https://x.com/aporeticaxis) – stay safe, share responsibly.

> **Disclaimer:** Use steganography ethically. You are accountable for any content you conceal.

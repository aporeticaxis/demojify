# Hidden Message Encoder / Decoder (emoji + text steganography)

![version](https://img.shields.io/badge/version-2025--06--07.11-blue)
![tampermonkey](https://img.shields.io/badge/Userscript-Tampermonkey-orange)

> Hide any UTF-8 text inside **invisible Unicode variation selectors**  (extending the excellent work of ![emoji-encoder](https://github.com/paulgb/emoji-encoder))
---

## ⚡ Quick Start

1. **Install Tampermonkey**

3. **Grab the script**  
   *Preferred:* **Click** <kbd>Raw</kbd> on [`demojify.user.js`](./demojify.user.js).
   [direct](https://raw.githubusercontent.com/aporeticaxis/demojify/main/demojify.user.js)
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
| Floating 🕵️ button | Full browser window, bottom-right badge highlighted | ![screenshot_fab.png](https://private-user-images.githubusercontent.com/123844654/452649549-01371d58-f96f-4ccc-8b27-eb3e5478edbb.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDkzMzEzNDgsIm5iZiI6MTc0OTMzMTA0OCwicGF0aCI6Ii8xMjM4NDQ2NTQvNDUyNjQ5NTQ5LTAxMzcxZDU4LWY5NmYtNGNjYy04YjI3LWViM2U1NDc4ZWRiYi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNjA3JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYwN1QyMTE3MjhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT05N2Y2ZDExMDZmYTA1Y2MyMzJjMDg4ZmRkNjU0OWIyNzMwMWIzOTQwNzU2OGM1ZDg4OTUxN2VlN2IwMjE4ZWY5JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.87-isCO4oCgoWJ7K1SqKHYaT4nuNtdBLH4ZlfMiAZX0) |
| Decode modal | Paste field + decoded result visible | ![screenshot_decode_modal.png](https://private-user-images.githubusercontent.com/123844654/452649569-dbe1db95-ca78-4a7d-8550-9affa4be791f.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDkzMzEzNDgsIm5iZiI6MTc0OTMzMTA0OCwicGF0aCI6Ii8xMjM4NDQ2NTQvNDUyNjQ5NTY5LWRiZTFkYjk1LWNhNzgtNGE3ZC04NTUwLTlhZmZhNGJlNzkxZi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNjA3JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYwN1QyMTE3MjhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT04MzNjNTA0NzdhNGE4YjQ2N2ZiMTFmZGIzNzIwYjFjZTU2OGY4ZDE2NGI4MzkxNDMxZmU1Y2VhYmIwMDMyZmUzJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.Ypnyb0Hv-3TiEjgdX3_X-3WXSrDQEBAh23Xon0qFIGw) |
| Encode → 1-Click | Secret text, emoji grid, green “Copied!” toast | ![screenshot_encode_1click.png](https://private-user-images.githubusercontent.com/123844654/452649563-b79e2f0d-46f6-4765-8450-6c92305f2c4a.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDkzMzEzNDgsIm5iZiI6MTc0OTMzMTA0OCwicGF0aCI6Ii8xMjM4NDQ2NTQvNDUyNjQ5NTYzLWI3OWUyZjBkLTQ2ZjYtNDc2NS04NDUwLTZjOTIzMDVmMmM0YS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNjA3JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYwN1QyMTE3MjhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1jY2I1MDQwZjg2YjYzZTNkZDY4YzkyMTc1YzI3MWYyMDIyM2QxZWM5MGU4NzMyOWVjM2Y5MTlkODhjOTQxZDA1JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.TDpbItyp6X_JbIy6aWzbK99i3QGLlrQ4sg_MZ3FYS3c) |
| Encode → Free Form | Custom carriers area with mixed emoji/text | ![screenshot_encode_freeform.png](https://private-user-images.githubusercontent.com/123844654/452649558-2fabc604-f221-464d-aab7-f204377f445e.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDkzMzEzNDgsIm5iZiI6MTc0OTMzMTA0OCwicGF0aCI6Ii8xMjM4NDQ2NTQvNDUyNjQ5NTU4LTJmYWJjNjA0LWYyMjEtNDY0ZC1hYWI3LWYyMDQzNzdmNDQ1ZS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNjA3JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYwN1QyMTE3MjhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00ZDliMGJiM2JiYTVjNGIyYzk2MDIzZTgxNGY3ZmJlNTJiMDcxMTgwMDFjYzc5NzE2NWZmMGYwYjY1M2ZiMzMzJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.dRLafVItfRHZO8clxxU0qjgztnfWzoAQBwujLWkfRqA) |
| **Beta Scanner** highlight | Encoded text inline + yellow dashed border + tooltip | ![screenshot_beta_scanner.png](https://private-user-images.githubusercontent.com/123844654/452649579-31e61918-8ce8-48dd-a374-822de490ac07.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDkzMzEzNDgsIm5iZiI6MTc0OTMzMTA0OCwicGF0aCI6Ii8xMjM4NDQ2NTQvNDUyNjQ5NTc5LTMxZTYxOTE4LThjZTgtNDhkZC1hMzc0LTgyMmRlNDkwYWMwNy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNjA3JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYwN1QyMTE3MjhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1hYjQyZDg4OGE2ZmUyNDJlYjEzYTVhM2ViZjM2YTg2N2YxNDgzN2QwM2MyNjhhODZkYjBkMjIyMTc4ZTIwMzRkJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.6qXYk3-c2-bd-2nlgruXfKnF4LZYZU_zyJLHwTDovDw)|

---

## ✨ Key Features

* **Invisible steganography** – uses the full 256-value variation-selector space.
* **Two encoding modes**

  * *1-Click* – fastest path: pick a single emoji/letter carrier.
  * *Free Form* – distribute bytes across any text/emoji string you supply.
* **Live beta scanner** – optional DOM observer that flags hidden payloads on any site.
* **Zero-dependency UI** – pure vanilla JS + CSS, SPA-safe (React, Vue, etc.).
* **Robust UTF-8 path** – custom byte encoder/decoder to bypass Firefox XRay quirks.

---

## 🔑 Shortcuts

| Action           | Keys                      | Context                           |
| ---------------- | ------------------------- | --------------------------------- |
| **Encode modal** | `Ctrl + Shift + F`        | anywhere                          |
| **Decode modal** | `Ctrl + Shift + V`        | anywhere (uses selection, if any) |
| **Quick decode** | double-click encoded blob | highlights + opens modal          |
| **Close modal**  | `Esc`                     | inside modal                      |

---

## 🛠 Installation (detailed)

```bash
# 1. Install the Tampermonkey extension for your browser
# 2. Pull the script
curl -O https://raw.githubusercontent.com/your-repo/hidden-message/main/hidden-message.user.js
# 3. In Tampermonkey Dashboard → Utilities → "Import from file" → select the downloaded file
# 4. Click Save
```

The metadata block already matches `@match *://*/*`, so the script is active everywhere.

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

### Beta Scanner

Flip the **🧪 “Highlight encoded text on page”** toggle in any modal.
The observer will:

* mark encoded nodes with a dashed yellow outline,
* reveal the decoded payload on hover,
* stay active across SPA navigations.

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

```

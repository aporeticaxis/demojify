# Hidden Message Encoder / Decoder (emoji + text steganography)

![version](https://img.shields.io/badge/version-2025--06--07.11-blue)
![tampermonkey](https://img.shields.io/badge/Userscript-Tampermonkey-orange)
![License](https://img.shields.io/badge/license-MIT-green)

> Hide any UTF-8 text inside **invisible Unicode variation selectors**  (extending the excellent work of [emoji-encoder](https://github.com/paulgb/emoji-encoder))
---

## ⚡ Quick Start

1. **Install Tampermonkey**

3. **Grab the script**  
   *Preferred:* **Click** <kbd>Raw</kbd> on [`demojify.user.js`](./demojify.user.js). | 
   [>or click here<](https://raw.githubusercontent.com/aporeticaxis/demojify/main/demojify.user.js)
   Tampermonkey pops up an *Install* dialog automatically.  
   *Alternate:* Copy the code → Tampermonkey Dashboard → **➕ Create** → paste → **Save**.

5. Reload any page – the 🕵️ button appears bottom-right.

*(Everything runs 100 % locally – no data ever leaves your browser.)*

---

## 📸 UI Tour

| Screen | What to Capture | Suggested Filename |
| ------ | --------------- | ------------------ |
| Decode modal | Paste field + decoded result visible | ![screenshot_decode_modal.png](https://github.com/user-attachments/assets/0dc64eef-c251-4ea0-ab48-16918e141f1a) |Add commentMore actions
| Encode → 1-Click | Secret text, emoji grid, green “Copied!” toast | ![screenshot_encode_1click.png](https://github.com/user-attachments/assets/0560167a-ede2-4294-b490-5ef299c24b30) |
| Encode → Free Form | Custom carriers area with mixed emoji/text | ![screenshot_encode_freeform.png](https://github.com/user-attachments/assets/97b18afa-d63d-4232-adb5-f1d34ee51577) |
| Floating 🕵️ button | Full browser window, bottom-right badge highlighted | ![screenshot_fab.png](https://github.com/user-attachments/assets/908ba736-05b5-446a-8b50-6478711a11b7) |
| **Beta Scanner** highlight | Encoded text inline + yellow dashed border + tooltip | ![screenshot_beta_scanner.png](https://github.com/user-attachments/assets/f53d90db-70b5-4c16-a984-428485e7e0fc)|
| **NEW: Floating Emoji Picker** | Chat-app-style picker with skin tones, categories, search | ![emoji_picker.png](https://github.com/user-attachments/assets/5d5520cc-bd59-49ee-aa12-057933148504) | 
| **NEW: Status Indicator** | Bottom-center yellow "Screener ON/OFF" message | ![scanner_shortcut_toggle_status.png](https://github.com/user-attachments/assets/36817402-4512-4c4e-87a5-105b487a9f5c) |

---


## ✨ Key Features

* **Invisible steganography** – uses the full 256-value variation-selector space.
* **Two encoding modes**

  * *1-Click* – fastest path: pick a single emoji/letter carrier.
  * *Free Form* – distribute bytes across any text/emoji string you supply.
* **Professional floating emoji picker** – chat-app-style interface with skin tone variations, category filtering, search, and recent/frequent emoji tracking.
* **Enhanced multi-encoding detection** – beta scanner detects 5+ encoding schemes (32-VS, 16-VS, ZW-SPACE, ZWJ-BINARY, auto-learned) with confidence validation and mapping identification.
* **Smart link handling** – tooltips automatically detect and render URLs as clickable links, with GIF preview for supported image links.
* **Visual status feedback** – bottom-screen status indicator shows screener on/off state when toggling via keyboard shortcuts.
* **Zero-dependency UI** – pure vanilla JS + CSS, SPA-safe (React, Vue, etc.).
* **Robust UTF-8 path** – custom byte encoder/decoder to bypass Firefox XRay quirks.

---

## 🔑 Shortcuts

| Action                    | Keys                      | Context                           |
| ------------------------- | ------------------------- | --------------------------------- |
| **Encode modal**          | `Ctrl + Shift + F`        | anywhere                          |
| **Decode modal**          | `Ctrl + Shift + V`        | anywhere (uses selection, if any) |
| **Toggle icon overlay**   | `Ctrl + Shift + ,`        | hide/show 🕵️ floating button     |
| **Toggle page scanner**   | `Ctrl + Shift + .`        | enable/disable page highlighting  |
| **Close modal**           | `Esc`                     | inside modal                      |

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

### Floating Emoji Picker (NEW)

The enhanced emoji picker provides a professional chat-app-style interface:

* **Access**: Click the 😊 button next to any text input field in encode mode
* **Features**:
  - **Search**: Type to filter emojis by name
  - **Categories**: Browse by Smileys, People, Animals, Food, etc.
  - **Skin Tones**: 6 variations (Default, Light, Medium-Light, Medium, Medium-Dark, Dark)
  - **Recent/Frequent**: Tracks your most used emojis
  - **Multi-Selection**: Picker stays open for multiple emoji selection

* **Skin Tone Variations**:
  - **Hover** over any emoji with skin tone support to see variations popup
  - **Hold** for 500ms or **click and drag** to select specific skin tones
  - Global skin tone preference applies to future selections

* **Smart Behaviors**:
  - Only one picker open at a time (XOR logic)
  - Click outside or press Esc to close
  - Automatic positioning to stay within viewport bounds
  - Remembers recent selections and skin tone preferences

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

### Smart Link Handling (NEW)

Beta scanner tooltips now intelligently handle URLs in decoded content:

* **Regular Links**: Automatically converts URLs to clickable hyperlinks
* **GIF Links**: Detects `.gif` URLs and embeds the image directly in tooltip
* **Image Preview**: Supports common image formats with fallback to clickable link
* **Security**: Handles CORS restrictions gracefully with error fallbacks
* **Auto-Detection**: Uses robust regex patterns to identify various URL formats

### Visual Status Indicator (NEW)

Get instant feedback when toggling the beta scanner:

* **Activation**: Press `Ctrl + Shift + .` when modal is closed
* **Display**: Yellow text appears at bottom-center of screen
* **Messages**: 
  - "Screener ON" (when enabling scanner)
  - "Screener OFF" (when disabling scanner)
* **Auto-Hide**: Status message fades after 3 seconds
* **Non-Intrusive**: Positioned to avoid interfering with page content

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

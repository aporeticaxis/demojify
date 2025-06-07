// ==UserScript==
// @name         Demojify - Hidden Message Encoder/Decoder (Enhanced Emoji/Text)
// @namespace    http://tampermonkey.net/
// @version      2025-06-07.11
// @description  Hide messages in emojis or text using advanced steganography. Encode (Ctrl+Shift+X) / Decode (Ctrl+Shift+V) or click the 🕵️ button.
// @author       @aporeticaxis [extending the work of https://github.com/paulgb/emoji-encoder]
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @downloadURL https://raw.githubusercontent.com/aporeticaxis/demojify/main/demojify.user.js
// @updateURL   https://raw.githubusercontent.com/aporeticaxis/demojify/main/demojify.user.js
// ==/UserScript==

(() => {
  'use strict';
  const log = (...a) => console.log('%c[HiddenMsg]', 'color:#e91e63', ...a);

  try {
    /* ---------- 1. Variation-selector helpers ---------- */
    const VS_START = 0xfe00,
      VS_SUP_START = 0xe0100,
      VS_END = 0xfe0f,
      VS_SUP_END = 0xe01ef;

    const toVS = (b) =>
      b < 16
        ? String.fromCodePoint(VS_START + b)
        : String.fromCodePoint(VS_SUP_START + (b - 16));

    const fromVS = (cp) => {
      if (cp >= VS_START && cp <= VS_END) {
        return cp - VS_START;
      }
      if (cp >= VS_SUP_START && cp <= VS_SUP_END) {
        return cp - VS_SUP_START + 16;
      }
      return null;
    };

    const visibleOnly = (txt) =>
      [...txt].filter((c) => fromVS(c.codePointAt(0)) === null).join('');

    // Safe text encoding for userscripts (avoids TypedArray/Xrays issues)
    const encodeMessage = (carrier, hidden) => {
      console.log('[HiddenMsg] encodeMessage called with:', { carrier, hidden });

      try {
        // Convert string to byte array manually to avoid TypedArray issues
        const bytes = [];
        for (let i = 0; i < hidden.length; i++) {
          const code = hidden.charCodeAt(i);
          if (code < 128) {
            bytes.push(code);
          } else if (code < 2048) {
            bytes.push(192 | (code >> 6));
            bytes.push(128 | (code & 63));
          } else if (code < 65536) {
            bytes.push(224 | (code >> 12));
            bytes.push(128 | ((code >> 6) & 63));
            bytes.push(128 | (code & 63));
          } else {
            bytes.push(240 | (code >> 18));
            bytes.push(128 | ((code >> 12) & 63));
            bytes.push(128 | ((code >> 6) & 63));
            bytes.push(128 | (code & 63));
          }
        }

        const chars = [...carrier];
        if (!chars.length) {
          console.log('[HiddenMsg] encodeMessage: No carrier characters');
          return null;
        }

        const per = Math.ceil(bytes.length / chars.length);
        let i = 0,
          out = '';
        for (const ch of chars) {
          out += ch;
          for (let j = 0; j < per && i < bytes.length; j++) {
            out += toVS(bytes[i++]);
          }
        }

        console.log('[HiddenMsg] encodeMessage result:', {
          originalLength: hidden.length,
          bytesLength: bytes.length,
          outputLength: out.length,
          output: out
        });
        return out;
      } catch (error) {
        console.error('[HiddenMsg] encodeMessage error:', error);
        return null;
      }
    };

    // Safe text decoding for userscripts (avoids TypedArray/Xrays issues)
    const decodeMessage = (txt) => {
      console.log('[HiddenMsg] decodeMessage called with text length:', txt.length);

      try {
        const bytes = [];
        for (const cp of [...txt].map((c) => c.codePointAt(0))) {
          const b = fromVS(cp);
          if (b !== null) {
            bytes.push(b);
          }
        }
        if (!bytes.length) {
          console.log('[HiddenMsg] decodeMessage: No variation selector bytes found');
          return null;
        }

        // Manually decode UTF-8 bytes to avoid TypedArray issues
        let result = '';
        let i = 0;
        while (i < bytes.length) {
          let byte1 = bytes[i++];

          if (byte1 < 128) {
            // Single byte character (ASCII)
            result += String.fromCharCode(byte1);
          } else if ((byte1 & 0xE0) === 0xC0) {
            // Two byte character
            if (i >= bytes.length) break;
            let byte2 = bytes[i++];
            result += String.fromCharCode(((byte1 & 0x1F) << 6) | (byte2 & 0x3F));
          } else if ((byte1 & 0xF0) === 0xE0) {
            // Three byte character
            if (i + 1 >= bytes.length) break;
            let byte2 = bytes[i++];
            let byte3 = bytes[i++];
            result += String.fromCharCode(((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F));
          } else if ((byte1 & 0xF8) === 0xF0) {
            // Four byte character (convert to surrogate pair)
            if (i + 2 >= bytes.length) break;
            let byte2 = bytes[i++];
            let byte3 = bytes[i++];
            let byte4 = bytes[i++];
            let codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);
            if (codePoint > 0xFFFF) {
              codePoint -= 0x10000;
              result += String.fromCharCode(0xD800 + (codePoint >> 10));
              result += String.fromCharCode(0xDC00 + (codePoint & 0x3FF));
            } else {
              result += String.fromCharCode(codePoint);
            }
          } else {
            // Invalid byte, skip
            continue;
          }
        }

        console.log('[HiddenMsg] decodeMessage result:', {
          bytesLength: bytes.length,
          resultLength: result.length,
          result: result
        });
        return result || null;
      } catch (error) {
        console.error('[HiddenMsg] decodeMessage error:', error);
        return null;
      }
    };

    /* ---------- 2. Enhanced Encoding System ---------- */
    const EMOJIS = ['😊','😍','🥳','😎','🤖','👋','🎉','🔥','💯','⭐','🌟','💎','🚀','💪','👍','❤️','💖','🌈','🦄','🎈','🎊','🌺','🌸','🌻','🌷','🍀','🌙','☀️','⚡','✨','🎯','🏆','🎪','🎭','🎨','🎵','🎶','🎸','🎤','📱','💻','⌚','🎮','📷','🔮','💡','🔑','⚽','🏀','🎾','⚾'];

    const ALPHABET = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

    // Enhanced encoding that preserves custom carrier format (safe for userscripts)
    const encodeToCarriers = (message, carriersText) => {
      console.log('[HiddenMsg] encodeToCarriers called with:', { message, carriersText });

      if (!carriersText.length) {
        console.log('[HiddenMsg] encodeToCarriers: No carriers text provided');
        return null;
      }

      try {
        // Convert string to byte array manually to avoid TypedArray issues
        const bytes = [];
        for (let i = 0; i < message.length; i++) {
          const code = message.charCodeAt(i);
          if (code < 128) {
            bytes.push(code);
          } else if (code < 2048) {
            bytes.push(192 | (code >> 6));
            bytes.push(128 | (code & 63));
          } else if (code < 65516) {
            bytes.push(224 | (code >> 12));
            bytes.push(128 | ((code >> 6) & 63));
            bytes.push(128 | (code & 63));
          } else {
            bytes.push(240 | (code >> 18));
            bytes.push(128 | ((code >> 12) & 63));
            bytes.push(128 | ((code >> 6) & 63));
            bytes.push(128 | (code & 63));
          }
        }

        // Find positions where we can encode (avoid double spacing)
        const chars = [...carriersText];
        const encodePositions = [];

        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          const prevChar = i > 0 ? chars[i - 1] : null;
          const nextChar = i + 1 < chars.length ? chars[i + 1] : null;

          // Encode into characters that:
          // 1. Are not spaces
          // 2. Are NOT preceded by a space (avoids visual double spacing)
          // 3. Prefer characters at the end of words or standalone characters
          if (char !== ' ' && prevChar !== ' ') {
            encodePositions.push(i);
          }
        }

        if (encodePositions.length === 0) {
          // Fallback: use all non-space characters
          for (let i = 0; i < chars.length; i++) {
            if (chars[i] !== ' ') {
              encodePositions.push(i);
            }
          }
        }

        console.log('[HiddenMsg] Encode positions:', encodePositions);

        // Distribute bytes across encode positions
        const bytesPerPosition = Math.ceil(bytes.length / encodePositions.length);
        let result = '';
        let byteIndex = 0;

        for (let i = 0; i < chars.length; i++) {
          result += chars[i];

          // If this is an encode position and we have bytes left
          if (encodePositions.includes(i) && byteIndex < bytes.length) {
            // Add variation selectors for this position's portion of bytes
            for (let j = 0; j < bytesPerPosition && byteIndex < bytes.length; j++) {
              result += toVS(bytes[byteIndex++]);
            }
          }
        }

        console.log('[HiddenMsg] encodeToCarriers result:', {
          originalLength: message.length,
          bytesLength: bytes.length,
          carriersTextLength: carriersText.length,
          encodePositionsLength: encodePositions.length,
          outputLength: result.length,
          result: result
        });
        return result;
      } catch (error) {
        console.error('[HiddenMsg] encodeToCarriers error:', error);
        return null;
      }
    };

    // Safe multi-carrier decoding for userscripts (avoids TypedArray/Xrays issues)
    const decodeFromCarriers = (text) => {
      console.log('[HiddenMsg] decodeFromCarriers called with text length:', text.length);

      try {
        const parts = text.split(/\s+/);
        const bytes = [];

        for (const part of parts) {
          // Extract variation selectors from each carrier part
          for (const cp of [...part].map((c) => c.codePointAt(0))) {
            const b = fromVS(cp);
            if (b !== null) {
              bytes.push(b);
            }
          }
        }

        if (bytes.length === 0) {
          console.log('[HiddenMsg] decodeFromCarriers: No variation selector bytes found');
          return null;
        }

        // Use the same manual UTF-8 decoding as decodeMessage
        let result = '';
        let i = 0;
        while (i < bytes.length) {
          let byte1 = bytes[i++];

          if (byte1 < 128) {
            // Single byte character (ASCII)
            result += String.fromCharCode(byte1);
          } else if ((byte1 & 0xE0) === 0xC0) {
            // Two byte character
            if (i >= bytes.length) break;
            let byte2 = bytes[i++];
            result += String.fromCharCode(((byte1 & 0x1F) << 6) | (byte2 & 0x3F));
          } else if ((byte1 & 0xF0) === 0xE0) {
            // Three byte character
            if (i + 1 >= bytes.length) break;
            let byte2 = bytes[i++];
            let byte3 = bytes[i++];
            result += String.fromCharCode(((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F));
          } else if ((byte1 & 0xF8) === 0xF0) {
            // Four byte character (convert to surrogate pair)
            if (i + 2 >= bytes.length) break;
            let byte2 = bytes[i++];
            let byte3 = bytes[i++];
            let byte4 = bytes[i++];
            let codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);
            if (codePoint > 0xFFFF) {
              codePoint -= 0x10000;
              result += String.fromCharCode(0xD800 + (codePoint >> 10));
              result += String.fromCharCode(0xDC00 + (codePoint & 0x3FF));
            } else {
              result += String.fromCharCode(codePoint);
            }
          } else {
            // Invalid byte, skip
            continue;
          }
        }

        console.log('[HiddenMsg] decodeFromCarriers result:', {
          partsLength: parts.length,
          bytesLength: bytes.length,
          resultLength: result.length,
          result: result
        });
        return result || null;
      } catch (error) {
        console.error('[HiddenMsg] decodeFromCarriers error:', error);
        return null;
      }
    };

    /* ---------- 3. Styles ---------- */
    GM_addStyle(`
      .hidden-msg-floating-btn{position:fixed;bottom:20px;right:20px;width:56px;height:56px;background:#e91e63;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:28px;color:#fff;box-shadow:0 4px 12px rgba(233,30,99,.45);transition:.3s;z-index:2147483647}
      .hidden-msg-floating-btn:hover{transform:scale(1.1) rotate(5deg)}

      .hidden-msg-modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:2147483648}
      .hidden-msg-container{background:white;border-radius:16px;padding:24px;width:90%;max-width:500px;max-height:90vh;overflow-y:auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#333}
      .hidden-msg-header{text-align:center;margin-bottom:24px}
      .hidden-msg-title{font-size:24px;font-weight:bold;margin:0 0 16px 0;color:#333}
      .hidden-msg-description{color:#666;margin-bottom:20px;line-height:1.5}

      .hidden-msg-toggle{position:relative;display:inline-flex;background:#f0f0f0;border-radius:25px;padding:4px;margin-bottom:24px}
      .hidden-msg-toggle-option{padding:8px 20px;border-radius:20px;cursor:pointer;transition:all 0.3s;font-weight:500;color:#666}
      .hidden-msg-toggle-option.active{background:#333;color:white}

      .hidden-msg-input{width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:14px;margin-bottom:16px;resize:vertical;min-height:80px;background:white;color:#333}
      .hidden-msg-input:focus{outline:none;border-color:#e91e63}

      .hidden-msg-paste-btn{display:inline-flex;align-items:center;gap:6px;background:#e91e63;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;margin-bottom:16px}
      .hidden-msg-paste-btn:hover{background:#d81b60}
      .hidden-msg-paste-btn:disabled{background:#ccc;cursor:not-allowed}

      .hidden-msg-section-title{font-weight:600;margin:20px 0 12px 0;color:#333}
      .hidden-msg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:8px;margin-bottom:20px}
      .hidden-msg-grid-item{width:40px;height:40px;border:1px solid #ddd;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;font-size:18px;background:white}
      .hidden-msg-grid-item:hover{border-color:#e91e63;background:#f8f8f8}
      .hidden-msg-grid-item.selected{border-color:#e91e63;background:#e91e63;color:white}

      .hidden-msg-output-container{margin:16px 0}
      .hidden-msg-output{background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:12px;margin-bottom:8px;min-height:60px;font-family:monospace;white-space:pre-wrap;word-break:break-all}
      .hidden-msg-output:empty:before{content:"Your encoded message will appear here...";color:#999;font-style:italic}
      .hidden-msg-copy-btn{display:inline-flex;align-items:center;gap:6px;background:#28a745;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;transition:all 0.2s}
      .hidden-msg-copy-btn:hover{background:#218838;transform:translateY(-1px)}
      .hidden-msg-copy-btn:active{transform:translateY(0)}

      .hidden-msg-footer{text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid #eee}
      .hidden-msg-link{color:#e91e63;text-decoration:none;font-size:14px}
      .hidden-msg-link:hover{text-decoration:underline}

      .hidden-msg-close{position:absolute;top:16px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;color:#999;padding:4px}
      .hidden-msg-close:hover{color:#333}

      .hidden-msg-decode-result{background:#e8f5e8;border:1px solid #c3e6c3;border-radius:8px;padding:16px;margin:16px 0;color:#2d5a2d;word-wrap:break-word;word-break:break-word;white-space:pre-wrap;overflow-wrap:break-word}
      .hidden-msg-decode-result.no-message{background:#fff3cd;border-color:#ffeaa7;color:#8d6e63;word-wrap:break-word;word-break:break-word;white-space:pre-wrap;overflow-wrap:break-word}

      .hidden-msg-highlight{position:relative;background:rgba(255,235,59,0.3);border:2px dashed #ffc107;border-radius:4px;cursor:pointer;display:inline;padding:2px 4px;margin:0 2px}

      /* Completely disable CSS tooltip - we'll use JavaScript only */
      .hidden-msg-highlight::after{display:none !important}

      .hidden-msg-hover-tooltip{position:fixed;background:#333;color:white;padding:12px 16px;border-radius:8px;font-size:14px;max-width:350px;word-wrap:break-word;z-index:2147483650;pointer-events:none;opacity:0;transition:opacity 0.2s ease;box-shadow:0 8px 24px rgba(0,0,0,0.4);border:1px solid #555}
      .hidden-msg-hover-tooltip.show{opacity:1}
      .hidden-msg-hover-tooltip button{pointer-events:auto}

      .hidden-msg-encode-tabs{margin-top:16px}
      .hidden-msg-tab-nav{display:flex;background:#f0f0f0;border-radius:8px;padding:4px;margin-bottom:20px}
      .hidden-msg-tab-option{flex:1;padding:8px 16px;text-align:center;border-radius:6px;cursor:pointer;transition:all 0.3s;font-weight:500;color:#666}
      .hidden-msg-tab-option.active{background:#e91e63;color:white}
      .hidden-msg-tab-option:hover:not(.active){background:#e8e8e8}

      .hidden-msg-tab-content{display:block}

      .hidden-msg-carrier-display{min-height:50px;max-height:120px;overflow-y:auto;background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:12px;margin-bottom:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}
      .hidden-msg-carrier-display:empty:before{content:"Selected carriers will appear here...";color:#999;font-style:italic}

      .hidden-msg-carrier-item{background:#e91e63;color:white;padding:4px 8px;border-radius:4px;font-size:16px;display:flex;align-items:center;gap:4px}
      .hidden-msg-carrier-remove{background:rgba(255,255,255,0.3);border:none;color:white;width:16px;height:16px;border-radius:50%;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center}
      .hidden-msg-carrier-remove:hover{background:rgba(255,255,255,0.5)}

      .hidden-msg-emoji-selector{max-height:200px;overflow-y:auto;background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:16px;margin-bottom:16px}
      .hidden-msg-emoji-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:8px}
      .hidden-msg-emoji-item{width:40px;height:40px;border:1px solid #ddd;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;font-size:18px;background:white}
      .hidden-msg-emoji-item:hover{border-color:#e91e63;background:#f8f8f8;transform:scale(1.05)}
    `);

    /* ---------- 4. Enhanced Modal System ---------- */
    function createModal(selectedText = '', preferredMode = 'decode') {
      // Remove any existing modals
      document.querySelector('.hidden-msg-modal')?.remove();

      const modal = document.createElement('div');
      modal.className = 'hidden-msg-modal';

      modal.innerHTML = `
        <div class="hidden-msg-container">
          <button class="hidden-msg-close">×</button>

          <div class="hidden-msg-header">
            <h1 class="hidden-msg-title">Hide a message in an emoji</h1>
            <p class="hidden-msg-description">This tool allows you to encode a hidden message into an emoji or alphabet letter. You can copy and paste text with a hidden message in it to decode the message.</p>

            <div class="hidden-msg-toggle">
              <div class="hidden-msg-toggle-option active" data-mode="decode">Decode</div>
              <div class="hidden-msg-toggle-option" data-mode="encode">Encode</div>
            </div>

            <div class="hidden-msg-beta-toggle">
              <label style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;cursor:pointer">
                <input type="checkbox" id="beta-scanner" style="margin:0">
                <span>🧪 Beta: Highlight encoded text on page</span>
              </label>
            </div>
          </div>

          <div class="hidden-msg-content">
            <!-- Decode Mode -->
            <div class="hidden-msg-decode-mode" style="display:none">
              <button class="hidden-msg-paste-btn" id="paste-btn">📋 Paste from Clipboard</button>
              <textarea class="hidden-msg-input" placeholder="Paste text to decode here..." id="decode-input"></textarea>
              <div class="hidden-msg-decode-result" id="decode-result" style="display:none"></div>
            </div>

            <!-- Encode Mode -->
            <div class="hidden-msg-encode-mode">
              <textarea class="hidden-msg-input" placeholder="Enter text to encode" id="encode-input"></textarea>

              <!-- Encode Tabs -->
              <div class="hidden-msg-encode-tabs">
                <div class="hidden-msg-tab-nav">
                  <div class="hidden-msg-tab-option active" data-tab="1-click">1-Click</div>
                  <div class="hidden-msg-tab-option" data-tab="free-form">Free Form</div>
                </div>

                <!-- 1-Click Tab (Real-time encoding) -->
                <div class="hidden-msg-tab-content" id="tab-1-click">
                  <div class="hidden-msg-section-title">Pick an emoji</div>
                  <div class="hidden-msg-grid" id="emoji-grid"></div>

                  <div class="hidden-msg-section-title">Or pick a standard alphabet letter</div>
                  <div class="hidden-msg-grid" id="alphabet-grid"></div>

                  <div class="hidden-msg-output-container">
                    <div class="hidden-msg-output" id="output-area-1click"></div>
                    <button class="hidden-msg-copy-btn" id="copy-btn-1click" style="display:none">📋 Copy to Clipboard</button>
                  </div>
                </div>

                <!-- Free Form Tab (Manual encoding) -->
                <div class="hidden-msg-tab-content" id="tab-free-form" style="display:none">
                  <div class="hidden-msg-section-title">Custom Carriers</div>
                  <input type="text" class="hidden-msg-input" placeholder="Type or click emojis to add carriers like 'hello world' or '🎄🎅🤶'" id="custom-carriers" style="min-height:40px;margin-bottom:16px">

                  <div class="hidden-msg-section-title">Choose Any Emoji to Add</div>
                  <div class="hidden-msg-emoji-selector" id="emoji-selector"></div>

                  <button class="hidden-msg-paste-btn" id="encode-btn">🔮 Encode Message</button>

                  <div class="hidden-msg-output-container">
                    <div class="hidden-msg-output" id="output-area-freeform"></div>
                    <button class="hidden-msg-copy-btn" id="copy-btn-freeform" style="display:none">📋 Copy to Clipboard</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="hidden-msg-footer">
            <a href="https://github.com/paulgb/emoji-encoder" class="hidden-msg-link" target="_blank">Source on GitHub</a>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      setupModalEvents(modal, selectedText, preferredMode);
      return modal;
    }

    function setupModalEvents(modal, selectedText, preferredMode = 'decode') {
      const closeBtn = modal.querySelector('.hidden-msg-close');
      const toggleOptions = modal.querySelectorAll('.hidden-msg-toggle-option');
      const encodeMode = modal.querySelector('.hidden-msg-encode-mode');
      const decodeMode = modal.querySelector('.hidden-msg-decode-mode');
      const encodeInput = modal.querySelector('#encode-input');
      const decodeInput = modal.querySelector('#decode-input');
      const outputArea1Click = modal.querySelector('#output-area-1click');
      const outputAreaFreeForm = modal.querySelector('#output-area-freeform');
      const decodeResult = modal.querySelector('#decode-result');
      const pasteBtn = modal.querySelector('#paste-btn');
      const customCarriers = modal.querySelector('#custom-carriers');
      const emojiSelector = modal.querySelector('#emoji-selector');
      const tabOptions = modal.querySelectorAll('.hidden-msg-tab-option');
      const tab1Click = modal.querySelector('#tab-1-click');
      const tabFreeForm = modal.querySelector('#tab-free-form');

      let currentMode = preferredMode;
      let currentTab = '1-click';
      let selectedCarriers1Click = [];

      // Set initial mode display based on preferred mode
      if (preferredMode === 'encode') {
        encodeMode.style.display = 'block';
        decodeMode.style.display = 'none';
        toggleOptions.forEach(opt => {
          opt.classList.toggle('active', opt.dataset.mode === 'encode');
        });
      } else {
        encodeMode.style.display = 'none';
        decodeMode.style.display = 'block';
        toggleOptions.forEach(opt => {
          opt.classList.toggle('active', opt.dataset.mode === 'decode');
        });
      }

      // Use the global tryDecodeText function (defined below)

      // Pre-fill with selected text - RESPECT preferredMode
      if (selectedText) {
        if (preferredMode === 'decode') {
          // User explicitly wants decode mode
          decodeInput.value = selectedText;
          const decoded = tryDecodeText(selectedText);
          if (decoded) {
            showDecodeResult(decoded);
          }
        } else {
          // User explicitly wants encode mode
          encodeInput.value = selectedText;
        }
      }

      // Close modal
      closeBtn.onclick = () => modal.remove();
      modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
      };

      // Mode toggle
      toggleOptions.forEach(option => {
        option.onclick = () => {
          currentMode = option.dataset.mode;
          toggleOptions.forEach(opt => {
            opt.classList.toggle('active', opt === option);
          });

          if (currentMode === 'encode') {
            encodeMode.style.display = 'block';
            decodeMode.style.display = 'none';
          } else {
            encodeMode.style.display = 'none';
            decodeMode.style.display = 'block';
          }
        };
      });

      // Setup tab switching
      tabOptions.forEach(option => {
        option.onclick = () => {
          currentTab = option.dataset.tab;
          tabOptions.forEach(opt => {
            opt.classList.toggle('active', opt === option);
          });

          if (currentTab === '1-click') {
            tab1Click.style.display = 'block';
            tabFreeForm.style.display = 'none';
          } else {
            tab1Click.style.display = 'none';
            tabFreeForm.style.display = 'block';
          }
        };
      });

      // Setup grids for 1-click tab
      setupEmojiGrid(modal);
      setupAlphabetGrid(modal);

      // Setup Free Form emoji selector
      setupFreeFormEmojiSelector(modal);

      // Setup encoding with enhanced carrier logic for both tabs
      function getAllCarriers1Click() {
        return [...selectedCarriers1Click];
      }

      function getAllCarriersFreeForm() {
        // Return the entire custom carriers text as-is to preserve formatting
        return customCarriers.value.trim();
      }

      function update1ClickOutput() {
        const message = encodeInput.value;
        const carriers = getAllCarriers1Click();
        const copyBtn1Click = modal.querySelector('#copy-btn-1click');

        if (!message || carriers.length === 0) {
          outputArea1Click.textContent = '';
          copyBtn1Click.style.display = 'none';
          return;
        }

        // Use only the first selected carrier like the original demo
        const carrier = carriers[0];
        const encoded = encodeMessage(carrier, message);
        outputArea1Click.textContent = encoded || '';

        // Show/hide copy button based on encoded content
        if (encoded) {
          copyBtn1Click.style.display = 'inline-flex';
          copyBtn1Click.onclick = () => {
            navigator.clipboard.writeText(encoded).then(() => {
              // Visual feedback
              const origText = copyBtn1Click.innerHTML;
              copyBtn1Click.innerHTML = '✅ Copied!';
              copyBtn1Click.style.background = '#218838';
              setTimeout(() => {
                copyBtn1Click.innerHTML = origText;
                copyBtn1Click.style.background = '#28a745';
              }, 1000);
            }).catch(() => {
              copyBtn1Click.innerHTML = '❌ Failed';
              setTimeout(() => copyBtn1Click.innerHTML = '📋 Copy to Clipboard', 1000);
            });
          };
        } else {
          copyBtn1Click.style.display = 'none';
        }
      }


      // Real-time encoding for 1-click tab
      encodeInput.oninput = () => {
        if (currentTab === '1-click') {
          update1ClickOutput();
        }
      };

      // Encode button functionality for Free Form mode
      const encodeBtn = modal.querySelector('#encode-btn');
      encodeBtn.onclick = () => {
        const message = encodeInput.value.trim();

        if (!message) {
          alert('Please enter text to encode');
          return;
        }

        // Get carriers text (preserves format like "testcle :)")
        const carriersText = getAllCarriersFreeForm();

        if (!carriersText) {
          alert('Please enter custom carrier text or select emojis');
          return;
        }

        // Use format-preserving encoding for Free Form
        const finalEncoded = encodeToCarriers(message, carriersText);

        console.log('[HiddenMsg] Free Form encoding debug:', {
          message,
          carriersText,
          finalEncoded,
          encodedLength: finalEncoded ? finalEncoded.length : 0,
          carriersTextLength: carriersText.length
        });

        if (finalEncoded) {
          // Clear placeholder and show encoded text
          outputAreaFreeForm.innerHTML = '';
          outputAreaFreeForm.textContent = finalEncoded;

          // Add visual indicator that encoding happened
          const indicator = document.createElement('div');
          indicator.style.cssText = 'font-size:12px;color:#666;margin-top:8px;font-style:italic;';
          indicator.textContent = `✅ Encoded ${message.length} character message into ${carriersText.length} carrier(s) (${finalEncoded.length} total chars with variation selectors)`;
          outputAreaFreeForm.appendChild(indicator);

          // Show and setup the copy button for Free Form
          const copyBtnFreeForm = modal.querySelector('#copy-btn-freeform');
          copyBtnFreeForm.style.display = 'inline-flex';
          copyBtnFreeForm.onclick = () => {
            navigator.clipboard.writeText(finalEncoded).then(() => {
              // Visual feedback
              const origText = copyBtnFreeForm.innerHTML;
              copyBtnFreeForm.innerHTML = '✅ Copied!';
              copyBtnFreeForm.style.background = '#218838';
              setTimeout(() => {
                copyBtnFreeForm.innerHTML = origText;
                copyBtnFreeForm.style.background = '#28a745';
              }, 1000);
            }).catch(() => {
              copyBtnFreeForm.innerHTML = '❌ Failed';
              setTimeout(() => copyBtnFreeForm.innerHTML = '📋 Copy to Clipboard', 1000);
            });
          };

          // Visual feedback for the encode button
          const origText = encodeBtn.innerHTML;
          encodeBtn.innerHTML = '✅ Encoded!';
          setTimeout(() => encodeBtn.innerHTML = origText, 1000);
        } else {
          alert('Encoding failed - check console for details');
        }
      };

      // Setup decoding with enhanced mapping display
      function showDecodeResult(result) {
        decodeResult.style.display = 'block';
        decodeResult.className = 'hidden-msg-decode-result';

        // Handle both old string format and new object format for backward compatibility
        if (typeof result === 'string') {
          decodeResult.textContent = `Hidden message: ${result}`;
        } else if (result && result.text) {
          // Enhanced display with mapping information
          const mappingInfo = result.mapping || 'unknown';
          const details = result.details ? ` (${result.details})` : '';
          decodeResult.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">Hidden message: ${result.text}</div>
            <div style="color: #666; font-size: 12px;">Encoding: ${mappingInfo}${details}</div>
          `;
        }
      }

      function showNoMessage() {
        decodeResult.style.display = 'block';
        decodeResult.className = 'hidden-msg-decode-result no-message';
        decodeResult.textContent = 'No hidden message detected.';
      }

      // Paste button functionality
      pasteBtn.onclick = async () => {
        try {
          const text = await navigator.clipboard.readText();
          decodeInput.value = text;
          // Trigger input event to decode automatically
          decodeInput.dispatchEvent(new Event('input'));
        } catch (err) {
          console.warn('Could not paste from clipboard:', err);
          pasteBtn.textContent = '❌ Paste failed';
          setTimeout(() => pasteBtn.innerHTML = '📋 Paste from Clipboard', 2000);
        }
      };

      decodeInput.oninput = () => {
        const text = decodeInput.value;
        if (!text) {
          decodeResult.style.display = 'none';
          return;
        }

        const decoded = tryDecodeText(text);
        if (decoded) {
          showDecodeResult(decoded);
        } else {
          showNoMessage();
        }
      };

      // Grid selection handlers for 1-click tab (single selection like original demo)
      function handle1ClickGridSelection(item, value) {
        // Clear all previous selections
        modal.querySelectorAll('.hidden-msg-grid-item').forEach(gridItem => {
          gridItem.classList.remove('selected');
        });
        selectedCarriers1Click = [];

        // Select this item
        item.classList.add('selected');
        selectedCarriers1Click = [value];

        update1ClickOutput();
      }

      // Handler for Free Form emoji selector - no longer needed since we add directly to text field
      function handleFreeFormEmojiSelection(emoji) {
        // This function is no longer used - emojis are added directly in setupFreeFormEmojiSelector
      }

      // Beta scanner functionality
      const betaScanner = modal.querySelector('#beta-scanner');
      let currentTooltip = null;

      // Set checkbox state based on cached value
      betaScanner.checked = betaScannerEnabled;

      betaScanner.onchange = () => {
        betaScannerEnabled = betaScanner.checked;
        if (betaScannerEnabled) {
          startPageScanning();
        } else {
          stopPageScanning();
        }
      };

      modal.handle1ClickGridSelection = handle1ClickGridSelection;
      modal.handleFreeFormEmojiSelection = handleFreeFormEmojiSelection;
    }

    /* ---------- 5. Enhanced Beta Page Scanner with Multi-Encoding Detection ---------- */
    let scannerObserver = null;
    let highlightedElements = new Set();
    let betaScannerEnabled = false; // Cache beta scanner state

    // Confidence checking function
    function isLikelyText(str) {
      if (!str) return false;
      const printable = str.match(/[\p{L}\p{N}\p{P}\p{Zs}]/gu) || [];
      return printable.length / str.length > 0.75;
    }

    // Helper function for UTF-8 validation
    function tryUtf8(bytes) {
      try {
        let result = '';
        let i = 0;
        while (i < bytes.length) {
          let byte1 = bytes[i++];

          if (byte1 < 128) {
            // Single byte character (ASCII)
            result += String.fromCharCode(byte1);
          } else if ((byte1 & 0xE0) === 0xC0) {
            // Two byte character
            if (i >= bytes.length) break;
            let byte2 = bytes[i++];
            result += String.fromCharCode(((byte1 & 0x1F) << 6) | (byte2 & 0x3F));
          } else if ((byte1 & 0xF0) === 0xE0) {
            // Three byte character
            if (i + 1 >= bytes.length) break;
            let byte2 = bytes[i++];
            let byte3 = bytes[i++];
            result += String.fromCharCode(((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F));
          } else if ((byte1 & 0xF8) === 0xF0) {
            // Four byte character (convert to surrogate pair)
            if (i + 2 >= bytes.length) break;
            let byte2 = bytes[i++];
            let byte3 = bytes[i++];
            let byte4 = bytes[i++];
            let codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);
            if (codePoint > 0xFFFF) {
              codePoint -= 0x10000;
              result += String.fromCharCode(0xD800 + (codePoint >> 10));
              result += String.fromCharCode(0xDC00 + (codePoint & 0x3FF));
            } else {
              result += String.fromCharCode(codePoint);
            }
          } else {
            // Invalid byte, skip
            continue;
          }
        }
        return result;
      } catch (error) {
        return null;
      }
    }

    // Known encoding mappings
    const KNOWN_MAPS = [
      {
        name: '32-VS',
        cpToByte: (cp) => {
          if (cp >= 0xFE00 && cp <= 0xFE0F) return cp - 0xFE00;        // 0-15
          if (cp >= 0xE0100 && cp <= 0xE01EF) return cp - 0xE0100 + 16; // 16-31
          return null;
        }
      },
      {
        name: '16-VS',
        cpToByte: (cp) => {
          if (cp >= 0xFE00 && cp <= 0xFE0F) return cp - 0xFE00;        // 0-15 (4-bit nibbles)
          return null;
        }
      },
      {
        name: 'ZW-SPACE',
        cpToByte: (cp) => {
          if (cp === 0x200B) return 1;  // ZWSP = 1
          if (cp === 0x200C) return 0;  // ZWNJ = 0
          return null;
        }
      },
      {
        name: 'ZWJ-BINARY',
        cpToByte: (cp) => {
          if (cp === 0x200D) return 1;  // ZWJ = 1
          if (cp === 0x200C) return 0;  // ZWNJ = 0
          return null;
        }
      }
    ];

    // Cascade decoder with multiple encoding scheme detection
    function bruteDecode(codePoints) {
      if (!codePoints || codePoints.length === 0) return null;

      // Try each known mapping
      for (const mapping of KNOWN_MAPS) {
        const bytes = [];
        let validMapping = true;

        for (const cp of codePoints) {
          const byte = mapping.cpToByte(cp);
          if (byte !== null) {
            bytes.push(byte);
          } else if (cp >= 0x200B) {
            // This is a zero-width character we don't recognize for this mapping
            validMapping = false;
            break;
          }
          // Ignore non-zero-width characters for this mapping attempt
        }

        if (validMapping && bytes.length > 0) {
          let decodedText = null;

          if (mapping.name === '16-VS') {
            // Special handling for 4-bit nibble encoding
            if (bytes.length % 2 === 0) {
              const fullBytes = [];
              for (let i = 0; i < bytes.length; i += 2) {
                fullBytes.push((bytes[i] << 4) | bytes[i + 1]);
              }
              decodedText = tryUtf8(fullBytes);
            }
          } else if (mapping.name.includes('BINARY') || mapping.name.includes('ZW')) {
            // Binary encoding - convert bits to bytes
            if (bytes.length >= 8) {
              const fullBytes = [];
              for (let i = 0; i < bytes.length; i += 8) {
                let byte = 0;
                for (let j = 0; j < 8 && i + j < bytes.length; j++) {
                  byte |= (bytes[i + j] << (7 - j));
                }
                fullBytes.push(byte);
              }
              decodedText = tryUtf8(fullBytes);
            }
          } else {
            // Standard byte encoding (like 32-VS)
            decodedText = tryUtf8(bytes);
          }

          if (decodedText && isLikelyText(decodedText)) {
            return { text: decodedText, mapping: mapping.name };
          }
        }
      }

      // Try auto-learning for unknown mappings
      const autoResult = autoLearnMapping(codePoints);
      if (autoResult) {
        return autoResult;
      }

      return null;
    }

    // Auto-learning heuristic for unknown mappings
    function autoLearnMapping(cps) {
      if (!cps || cps.length < 16) return null; // Need sufficient data

      // Group consecutive zero-width characters
      const zwGroups = [];
      let currentGroup = [];

      for (const cp of cps) {
        if (cp >= 0x200B || (cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF)) {
          currentGroup.push(cp);
        } else if (currentGroup.length > 0) {
          zwGroups.push([...currentGroup]);
          currentGroup = [];
        }
      }
      if (currentGroup.length > 0) {
        zwGroups.push(currentGroup);
      }

      if (zwGroups.length === 0) return null;

      // Try to detect patterns
      const uniqueChars = [...new Set(cps.filter(cp =>
        cp >= 0x200B || (cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF)
      ))];

      // If we have 2-16 unique characters, try simple substitution
      if (uniqueChars.length >= 2 && uniqueChars.length <= 16) {
        // Try treating each unique character as a different value
        const charToValue = {};
        uniqueChars.forEach((char, index) => {
          charToValue[char] = index;
        });

        const values = cps.map(cp => charToValue[cp]).filter(v => v !== undefined);

        // Try different interpretations
        const attempts = [];

        // Attempt 1: Direct byte values
        if (uniqueChars.length <= 256) {
          attempts.push(values);
        }

        // Attempt 2: Binary if exactly 2 unique chars
        if (uniqueChars.length === 2 && values.length >= 8) {
          const bytes = [];
          for (let i = 0; i < values.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8 && i + j < values.length; j++) {
              byte |= (values[i + j] << (7 - j));
            }
            bytes.push(byte);
          }
          attempts.push(bytes);
        }

        // Try each attempt
        for (const attempt of attempts) {
          const text = tryUtf8(attempt);
          if (text && isLikelyText(text)) {
            return {
              text: text,
              mapping: 'auto-learned',
              details: `${uniqueChars.length} unique chars`
            };
          }
        }
      }

      return null;
    }

    function startPageScanning() {
      log('🧪 Enhanced beta scanner activated - scanning for multiple encoding schemes...');

      // Initial scan
      scanPageForEncodedText();

      // Set up mutation observer for dynamic content
      const MutationObs = window.MutationObserver || window.webkitMutationObserver;
      if (MutationObs) {
        scannerObserver = new MutationObs(() => {
          // Debounce the scanning
          clearTimeout(scannerObserver.timeout);
          scannerObserver.timeout = setTimeout(scanPageForEncodedText, 500);
        });

        scannerObserver.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    }

    function stopPageScanning() {
      log('🧪 Enhanced beta scanner deactivated');

      // Stop observer
      if (scannerObserver) {
        scannerObserver.disconnect();
        scannerObserver = null;
      }

      // Remove all highlights
      highlightedElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.replaceChild(document.createTextNode(element.textContent), element);
        }
      });
      highlightedElements.clear();

      // Remove any tooltips
      document.querySelectorAll('.hidden-msg-hover-tooltip').forEach(el => el.remove());
    }

    function scanPageForEncodedText() {
      // Get all text nodes in the document
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            // Skip script, style, and already highlighted content
            if (node.parentElement.tagName === 'SCRIPT' ||
                node.parentElement.tagName === 'STYLE' ||
                node.parentElement.closest('.hidden-msg-modal') ||
                node.parentElement.classList.contains('hidden-msg-highlight')) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        },
        false
      );

      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node);
      }

      // Check each text node for encoded content using the same logic as the modal
      textNodes.forEach(textNode => {
        const text = textNode.textContent;
        if (!text || text.length < 2) return;

        // Use the same decode function as the modal for consistency
        const result = tryDecodeText(text);

        if (result && result.text) {
          console.log('[HiddenMsg] Beta scanner found encoded text:', {
            originalText: text,
            decodedText: result.text,
            mapping: result.mapping,
            details: result.details
          });

          const mapping = result.mapping || 'unknown';
          const details = result.details || '';
          highlightEncodedText(textNode, text, result.text, mapping, details);
        }
      });
    }

    function highlightEncodedText(textNode, originalText, decodedText, mapping = 'unknown', details = '') {
      // Create highlight wrapper
      const highlight = document.createElement('span');
      highlight.className = 'hidden-msg-highlight';
      highlight.textContent = originalText;

      // Store decoding information for tooltip
      highlight.dataset.decodedText = decodedText;
      highlight.dataset.mapping = mapping;
      highlight.dataset.details = details;
      highlight.dataset.originalText = originalText;

      // Add hover functionality
      let hoverTimeout;
      highlight.addEventListener('mouseenter', (e) => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          const target = e.target;
          const storedDecodedText = target.dataset.decodedText;
          const storedMapping = target.dataset.mapping;
          const storedDetails = target.dataset.details;
          const storedOriginalText = target.dataset.originalText;

          showHoverTooltip(target, storedDecodedText, storedMapping, storedDetails, storedOriginalText);
        }, 100);
      });

      highlight.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        hideHoverTooltip();
      });

      // Replace text node with highlighted version
      if (textNode.parentNode) {
        textNode.parentNode.replaceChild(highlight, textNode);
        highlightedElements.add(highlight);
      }
    }

    function showHoverTooltip(element, decodedText, mapping = 'unknown', details = '', originalText = '') {
      // Remove any existing tooltip
      hideHoverTooltip();

      console.log('[HiddenMsg] showHoverTooltip called with:', {
        decodedText,
        mapping,
        details,
        originalText: originalText.substring(0, 50) + '...'
      });

      // Hide CSS tooltip by adding class to the element
      element.classList.add('has-js-tooltip');

      const tooltip = document.createElement('div');
      tooltip.className = 'hidden-msg-hover-tooltip';

      // Create tooltip content
      const content = document.createElement('div');
      content.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 4px;">Decoded: ${decodedText}</div>
        <div style="color: #ccc; font-size: 12px;">mapping: ${mapping}${details ? ` (${details})` : ''}</div>
      `;

      // Add "copy raw selectors" button for unknown mappings
      if (mapping === 'unknown' || mapping === 'auto-learned') {
        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = '📋 copy raw selectors';
        copyBtn.style.cssText = `
          background: #666;
          color: white;
          border: none;
          padding: 2px 6px;
          margin-top: 4px;
          border-radius: 3px;
          font-size: 10px;
          cursor: pointer;
          display: block;
        `;
        copyBtn.onclick = (e) => {
          e.stopPropagation();

          // Extract raw variation selectors and zero-width chars
          const rawSelectors = [...originalText]
            .map(c => c.codePointAt(0))
            .filter(cp => cp >= 0x200B || (cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF))
            .map(cp => `U+${cp.toString(16).toUpperCase()}`)
            .join(' ');

          navigator.clipboard.writeText(rawSelectors).then(() => {
            copyBtn.innerHTML = '✅ copied!';
            setTimeout(() => copyBtn.innerHTML = '📋 copy raw selectors', 1000);
          }).catch(() => {
            copyBtn.innerHTML = '❌ failed';
            setTimeout(() => copyBtn.innerHTML = '📋 copy raw selectors', 1000);
          });
        };
        content.appendChild(copyBtn);
      }

      tooltip.appendChild(content);
      document.body.appendChild(tooltip);

      // Position tooltip - ensure it's visible
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Default positioning
      let left = rect.left;
      let top = rect.bottom + 5;

      // Adjust if tooltip would go off-screen
      if (left + 300 > viewportWidth) {
        left = viewportWidth - 310; // Account for tooltip max-width + margin
      }
      if (left < 10) {
        left = 10;
      }

      if (top + 100 > viewportHeight) {
        top = rect.top - 105; // Show above element instead
      }

      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';

      // Show tooltip immediately (remove delay)
      tooltip.classList.add('show');

      // Store reference for cleanup
      window.currentTooltip = tooltip;
      window.currentTooltipElement = element;
    }

    function hideHoverTooltip() {
      if (window.currentTooltip) {
        window.currentTooltip.remove();
        window.currentTooltip = null;
      }

      // Remove the class that hides CSS tooltip
      if (window.currentTooltipElement) {
        window.currentTooltipElement.classList.remove('has-js-tooltip');
        window.currentTooltipElement = null;
      }
    }

    // Enhanced decode function for scanner that tries legacy methods first, then cascade
    function tryDecodeText(text) {
      if (!text || !text.trim()) return null;

      // Try legacy methods first for backward compatibility
      let decoded = decodeMessage(text);
      if (decoded) return { text: decoded, mapping: '32-VS' };

      decoded = decodeFromCarriers(text);
      if (decoded) return { text: decoded, mapping: '32-VS' };

      // Try trimming whitespace and retrying legacy methods
      const trimmed = text.trim();
      if (trimmed !== text) {
        decoded = decodeMessage(trimmed);
        if (decoded) return { text: decoded, mapping: '32-VS' };

        decoded = decodeFromCarriers(trimmed);
        if (decoded) return { text: decoded, mapping: '32-VS' };
      }

      // Use enhanced cascade decoder as fallback
      const cps = [...text].map(c => c.codePointAt(0))
                           .filter(cp => cp >= 0x200B);

      if (cps.length > 0) {
        const result = bruteDecode(cps);
        if (result) return result;
      }

      return null;
    }

    function setupEmojiGrid(modal) {
      const grid = modal.querySelector('#emoji-grid');
      grid.innerHTML = '';

      EMOJIS.forEach(emoji => {
        const item = document.createElement('div');
        item.className = 'hidden-msg-grid-item';
        item.textContent = emoji;
        item.onclick = () => modal.handle1ClickGridSelection(item, emoji);
        grid.appendChild(item);
      });
    }

    function setupAlphabetGrid(modal) {
      const grid = modal.querySelector('#alphabet-grid');
      grid.innerHTML = '';

      ALPHABET.forEach(letter => {
        const item = document.createElement('div');
        item.className = 'hidden-msg-grid-item';
        item.textContent = letter;
        item.onclick = () => modal.handle1ClickGridSelection(item, letter);
        grid.appendChild(item);
      });
    }

    function setupFreeFormEmojiSelector(modal) {
      const selector = modal.querySelector('#emoji-selector');
      const customCarriers = modal.querySelector('#custom-carriers');
      const selectorGrid = document.createElement('div');
      selectorGrid.className = 'hidden-msg-emoji-grid';

      // Comprehensive emoji list with all common emojis
      const ALL_EMOJIS = [
        // Smileys & People
        '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','🫠','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢','🫣','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😶‍🌫️','😏','😒','🙄','😬','😮‍💨','🤥','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','😵‍💫','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','☹️','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾',
        // Hand gestures
        '👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','👊','✊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏',
        // Body parts
        '✍️','💅','🤳','💪','🦾','🦵','🦿','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','🫦',
        // People
        '👶','🧒','👦','👧','🧑','👱','👨','🧔','🧔‍♂️','🧔‍♀️','👨‍🦰','👨‍🦱','👨‍🦳','👨‍🦲','👩','👩‍🦰','🧑‍🦰','👩‍🦱','🧑‍🦱','👩‍🦳','🧑‍🦳','👩‍🦲','🧑‍🦲','👱‍♀️','👱‍♂️','🧓','👴','👵',
        // Animals & Nature
        '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🕸️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔',
        // Food & Drink
        '🍎','🍏','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫒','🌽','🥕','🫑','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','🫖','☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾',
        // Activity & Sports
        '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎵','🎶','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎲','♠️','♥️','♦️','♣️','♟️','🃏','🀄','🎴',
        // Travel & Places
        '🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🛴','🚲','🛵','🏍️','🛺','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩️','💺','🛰️','🚀','🛸','🚁','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢','⚓','🪝','⛽','🚧','🚦','🚥','🗺️','🗿','🗽','🗼','🏰','🏯','🏟️','🎡','🎢','🎠','⛲','⛱️','🏖️','🏝️','🏜️','🌋','⛰️','🏔️','🗻','🏕️','⛺','🛖','🏠','🏡','🏘️','🏚️','🏗️','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛️','⛪','🕌','🛕','🕍','🕋','⛩️','🛤️','🛣️','🗾','🎑','🏞️','🌅','🌄','🌠','🎇','🎆','🌇','🌆','🏙️','🌃','🌌','🌉','🌁',
        // Objects
        '⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🪫','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🪜','🧰','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧴','🧷','🧹','🧽','🧯','🛒','🚬','💀',
        // Symbols
        '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧️','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'
      ];

      ALL_EMOJIS.forEach(emoji => {
        const item = document.createElement('div');
        item.className = 'hidden-msg-emoji-item';
        item.textContent = emoji;
        item.onclick = () => {
          // Add emoji to custom carriers text field
          customCarriers.value += emoji;
        };
        selectorGrid.appendChild(item);
      });

      selector.appendChild(selectorGrid);
    }

    // Simplified functions for backward compatibility
    function showDecodeBubble(sel) {
      const selectedText = sel ? sel.toString() : '';
      createModal(selectedText, 'decode');
    }

    function showEncodeBubble(sel) {
      const selectedText = sel ? sel.toString() : '';
      createModal(selectedText, 'encode');
    }

    /* ---------- 6. Shortcuts ---------- */
    document.addEventListener('keydown', (e) => {
      if (!e.ctrlKey || !e.shiftKey) {
        return;
      }

      // Debug logging
      console.log('[HiddenMsg] Keyboard event:', {
        key: e.key,
        keyLower: e.key.toLowerCase(),
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey
      });

      if (e.key.toLowerCase() === 'v') {
        // Ctrl+Shift+V = Toggle decode mode
        e.preventDefault();
        e.stopPropagation();
        console.log('[HiddenMsg] V key detected - opening decode mode');

        const existingModal = document.querySelector('.hidden-msg-modal');
        if (existingModal) {
          // Modal is open, close it
          existingModal.remove();
        } else {
          // No modal open, open decode mode with selected text
          const sel = window.getSelection();
          if (sel && sel.toString().trim()) {
            showDecodeBubble(sel);
          } else {
            showDecodeBubble(null);
          }
        }
      } else if (e.key.toLowerCase() === 'f') {
        // Ctrl+Shift+X = Toggle encode mode
        e.preventDefault();
        e.stopPropagation();
        console.log('[HiddenMsg] F key detected - opening encode mode');

        const existingModal = document.querySelector('.hidden-msg-modal');
        if (existingModal) {
          // Modal is open, close it
          existingModal.remove();
        } else {
          // No modal open, open encode mode with selected text
          const sel = window.getSelection();
          console.log('[HiddenMsg] About to call showEncodeBubble with:', sel ? sel.toString() : 'null');
          if (sel && sel.toString().trim()) {
            showEncodeBubble(sel);
          } else {
            showEncodeBubble(null);
          }
        }
      }
    });

    /* ---------- 7. Menu commands ---------- */
    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('Encode hidden message…', () => showEncodeBubble(null));
      GM_registerMenuCommand('Decode selection', () => {
        const s = window.getSelection();
        if (s && s.toString().trim()) {
          showDecodeBubble(s);
        } else {
          alert('Select some text first');
        }
      });
    }

    /* ---------- 8. Floating button ---------- */
    (function () {
      const BTN_ID = 'hidden-msg-floating-btn';
      const ensureBtn = () => {
        if (!document.body || document.getElementById(BTN_ID)) {
          return;
        }
        const btn = document.createElement('div');
        btn.id = BTN_ID;
        btn.className = 'hidden-msg-floating-btn';
        btn.innerHTML = '🕵️';
        btn.onclick = () => showDecodeBubble(null);
        btn.style.zIndex = '2147483647';
        document.body.appendChild(btn);
        // React-safe: re-check after React's micro-task finishes
        setTimeout(() => { if (!document.getElementById(BTN_ID)) ensureBtn(); }, 0);
      };
      const MutationObs =
        window.MutationObserver || window.webkitMutationObserver;
      ensureBtn();
      if (MutationObs) {
        new MutationObs(ensureBtn).observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }
    })();

    /* ---------- 9. Double-click quick decode ---------- */
    let last = 0;
    document.addEventListener('click', () => {
      const now = Date.now();
      if (now - last < 300) {
        const sel = window.getSelection();
        if (sel && sel.toString().trim() && decodeMessage(sel.toString())) {
          showDecodeBubble(sel);
        }
      }
      last = now;
    });

    log('Loaded — Encode: Ctrl+Shift+F | Decode: Ctrl+Shift+V');

  } catch (err) {
    console.error('[HiddenMsg] userscript failed:', err);
  }
})();

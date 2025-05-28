const maxLinks = 150;
let linksMap = new Map();
let currentInput = "";
let overlayActive = false;

function generateShortcodes(limit) {
  const codes = [];
  const chars = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < chars.length; i++) {
    for (let j = 0; j < chars.length; j++) {
      codes.push(chars[i] + chars[j]);
      if (codes.length === limit) return codes;
    }
  }
  return codes;
}

function labelLinks() {
  const allLinks = Array.from(document.querySelectorAll("a[href]"));
  const shortcodes = generateShortcodes(maxLinks);
  const overlayStyle = document.createElement('style');
  overlayStyle.textContent = `
    .link-overlay-label {
      position: absolute;
      background: yellow;
      color: black;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 4px;
      border-radius: 3px;
      z-index: 9999999;
      pointer-events: none;
    }
  `;
  document.head.appendChild(overlayStyle);

  let count = 0;
  for (let link of allLinks) {
    if (count >= maxLinks) break;
    const rect = link.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const code = shortcodes[count];
    linksMap.set(code, link.href);

    const span = document.createElement("span");
    span.textContent = code;
    span.className = "link-overlay-label";
    span.style.left = `${rect.left + window.scrollX}px`;
    span.style.top = `${rect.top + window.scrollY}px`;
    document.body.appendChild(span);
    count++;
  }
  overlayActive = true;
}

function clearLabels() {
  document.querySelectorAll(".link-overlay-label").forEach(e => e.remove());
  linksMap.clear();
  currentInput = "";
  overlayActive = false;
}

function handleKeyInput(event) {
  if (!overlayActive || event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;

  const char = event.key.toLowerCase();
  if (!/[a-z]/.test(char)) return;

  currentInput += char;
  if (currentInput.length === 2) {
    const url = linksMap.get(currentInput);
    if (url) window.open(url, '_blank');
    clearLabels();
  }
}

window.addEventListener("activateLinkOverlay", () => {
  clearLabels();
  labelLinks();
});

document.addEventListener("keydown", handleKeyInput);

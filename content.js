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
    background: #efd24f; /* You can customize this */
    color: black;
    font-size: 22px;
    font-weight: 900;
    padding: 1px 6px;
    border-radius: 4px;
    z-index: 9999999;
    pointer-events: none;
    font-family: monospace;
    text-transform: uppercase;
  }

  .link-toast-popup {
    display: flex;
    align-items: center;
    gap: 8px;
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgb(1, 85, 174);
    color: white;
    padding: 10px 20px;
    font-size: 20px;
    font-weight: 400;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 99999999;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .link-toast-popup.show {
    opacity: 1;
  }

  .link-toast-popup svg.toast-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
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
    span.textContent = code.toUpperCase();  // Display in uppercase
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

function openUrlInNewTab(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.click();
}




function handleKeyInput(event) {
  const key = event.key.toLowerCase();

  if (!overlayActive) return;

  // Cancel overlay with ESC
  if (event.key === "Escape") {
    clearLabels();
    return;
  }

  // Ignore modifier keys
  if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;

  if (!/[a-z]/.test(key)) return;

  currentInput += key;

  if (currentInput.length === 2) {
  const url = linksMap.get(currentInput);
  if (url) {
    openUrlInNewTab(url);
    clearLabels();
  } else {
    showInvalidToast();
    clearLabels();
  }
}

}

function showInvalidToast() {
  const existing = document.querySelector('.link-toast-popup');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'link-toast-popup';
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
         viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" 
         class="toast-icon">
      <path stroke-linecap="round" stroke-linejoin="round" 
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 
            1.948 3.374h14.71c1.73 0 2.813-1.874 
            1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 
            0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
    <span>Invalid link code</span>
  `;
  document.body.appendChild(toast);

  void toast.offsetWidth; // trigger reflow for transition
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}



window.addEventListener("activateLinkOverlay", () => {
  clearLabels();
  labelLinks();
});

document.addEventListener("keydown", handleKeyInput);

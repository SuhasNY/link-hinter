chrome.commands.onCommand.addListener((command) => {
  if (command === "activate-links") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => window.dispatchEvent(new CustomEvent("activateLinkOverlay"))
      });
    });
  }
});
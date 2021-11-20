const storage = chrome.storage.local;

storage.get(["shortcutKeys"], function (result) {
  const storedKeys = result.shortcutKeys.split("+");
  for (let key of storedKeys) {
    shortcutKeys[key] = true;
  }
  const shortcutSpan = document.getElementById("shortcut");
  shortcutSpan.innerText = result.shortcutKeys;
});
const shortcutButton = document.getElementById("shortcutButton");

let shortcutKeys = {};
storage.get(["shortcutKeys"], (result) => {});

function keydownUpdateShortcut(e) {
  e.preventDefault();
  shortcutKeys[e.key.toLowerCase()] = true;
}

function keyupUpdateShortcut(e) {
  window.removeEventListener("keydown", keydownUpdateShortcut);
  console.log("shortcut set to", { shortcutKeys });
  document.getElementById("shortcut").innerText =
    Object.keys(shortcutKeys).sort().join("+");

  storage.set({ shortcutKeys: Object.keys(shortcutKeys).join("+") });
  window.removeEventListener("keyup", keyupUpdateShortcut);
  const shortcutButton = document.getElementById("shortcutButton");
  shortcutButton.innerText = "Update Shortcut";

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { shortcutUpdated: "The shortcut has been updated." },
      function (response) {
        console.log(response.ack);
      }
    );
  });
}

shortcutButton.addEventListener("click", (e) => {
  shortcutKeys = {};
  e.target.innerText = "Waiting...";
  window.addEventListener("keydown", keydownUpdateShortcut);
  window.addEventListener("keyup", keyupUpdateShortcut);
});

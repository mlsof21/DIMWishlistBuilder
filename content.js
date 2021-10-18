let rolls = {};

function copyToTextarea() {
  const wishlistText = document.querySelector("div > form > textarea");
  const errorSpan = document.getElementById("wishlistErrors");
  const roll = wishlistText.value;
  const textarea = document.getElementById("wishlistTextarea");
  const weaponHash = roll.split("&")[0].substr(17);
  const weaponName = getWeaponName(weaponHash);
  let shouldScroll = false;

  if (isRollInWishlist(roll, weaponHash)) {
    errorSpan.style.display = "block";
    errorSpan.innerText = "This roll already exists in wishlist.";
  } else {
    if (!(weaponHash in rolls)) {
      rolls[weaponHash] = {};
      rolls[weaponHash]["name"] = weaponName;
      rolls[weaponHash]["rolls"] = [];
      rolls[weaponHash]["notes"] = "";
      rolls[weaponHash]["tags"] = "";
      shouldScroll = true;
    }
    rolls[weaponHash]["rolls"].push(roll);
    let fullText = buildRollsForTextarea();
    textarea.value = fullText;
    textarea.setSelec;

    setLocalStorage(fullText);

    errorSpan.style.display = "none";
    errorSpan.innerText = "";
  }
}

function buildRollsForTextarea() {
  let fullText = "";
  for (var weaponHash in rolls) {
    fullText += `// ${rolls[weaponHash]["name"]}\n`;
    fullText += `//notes:${rolls[weaponHash]["notes"]}|tags:${rolls[weaponHash]["tags"]}\n`;
    for (const roll of rolls[weaponHash]["rolls"]) {
      fullText += `${roll}\n`;
    }
    fullText += "\n";
  }
  return fullText;
}

function setLocalStorage() {
  const json = JSON.stringify(rolls);
  chrome.storage.local.set({ wishlistData: json }, () => {
    console.log("wishlistData set to ", json);
  });
}

let timeout = null;
function onTextareaInput(e) {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    console.log(
      "User has stopped typing. Parsing the textarea and updating localStorage."
    );

    parseTextarea();
    buildRollsForTextarea();
    setLocalStorage();
  }, 5000);
}

function parseTextarea() {
  const text = document.getElementById("wishlistTextarea").value;
  const weapons = text.split("\n\n").filter((t) => t);
  rolls = {};
  for (const weapon of weapons) {
    const items = weapon.split("\n");
    const weaponRolls = items.slice(2);
    let weaponHash = weaponRolls[0].split("&")[0].substr(17);
    if (weaponHash.indexOf("-") === 0) {
      weaponHash = weaponHash.substr(1);
    }

    const weaponName = items[0].substr(3);
    const notes = items[1].split("|")[0].substr(8).trim();
    const tags = items[1].split("|")[1].substr(5).trim();
    rolls[weaponHash] = {};
    rolls[weaponHash]["name"] = weaponName;
    rolls[weaponHash]["notes"] = notes;
    rolls[weaponHash]["tags"] = tags;
    rolls[weaponHash]["rolls"] = weaponRolls;
  }
}

function getWeaponName(hash) {
  return manifest.DestinyInventoryItemDefinition[hash].displayProperties.name;
}

async function copyWishlistToClipboard() {
  const wishlistText = document.getElementById("wishlistTextarea").value;
  const copyButton = document.getElementById("copyToClipboardButton");
  copyButton.innerText = "Copied!";
  setTimeout(() => (copyButton.innerText = "Copy to Clipboard"), 2000);
  await navigator.clipboard.writeText(wishlistText);
}

function isRollInWishlist(newRoll, weapon) {
  if (weapon in rolls) {
    for (const roll of rolls[weapon]["rolls"]) {
      if (newRoll === roll) {
        return true;
      }
    }
  }
  return false;
}

function toggleWishlist(e) {
  e.stopPropagation();
  const div = document.getElementById("wishlistDiv");
  const button = document.getElementById("toggleWishlistButton");
  if (div.style.display === "flex") {
    div.style.display = "none";
    button.innerText = "Show Wishlist";
  } else {
    div.style.display = "flex";
    button.innerText = "Hide Wishlist";
  }
}

function contains(selector, text) {
  var elements = document.querySelectorAll(selector);
  return [].filter.call(elements, function (element) {
    return RegExp(text).test(element.textContent);
  });
}

// function getAddToWishlistButton() {
//   const addButton = document.createElement("div");
//   addButton.innerText = "Add Current Item to Wishlist";
//   addButton.id = "addToWishlistButton";
//   addButton.addEventListener("click", copyToTextarea, false);

//   return addButton;
// }

function getToggleButton() {
  const toggleButton = document.createElement("div");
  toggleButton.id = "toggleWishlistButton";
  toggleButton.innerText = "Hide Wishlist";
  toggleButton.addEventListener("click", toggleWishlist, false);

  return toggleButton;
}

// function getWishlistTextArea() {
//   const textarea = document.createElement("textarea");
//   textarea.cols = 100;
//   textarea.rows = 50;
//   textarea.id = "wishlistTextarea";
//   textarea.spellcheck = false;
//   // textarea.style.color = "rgb(255, 255, 255)";
//   // textarea.style.display = "inline-block";
//   // textarea.style.boxShadow = "rgb(245, 245, 245) 0px 0px 0px 1px inset";
//   // textarea.style.background = "rgba(255, 255, 255, 0.05)";

//   textarea.addEventListener("input", onTextareaInput, false);

//   chrome.storage.local.get(["wishlistData"], (result) => {
//     console.log("Value is currently " + result.wishlistData);
//     rolls = JSON.parse(result.wishlistData);
//     textarea.value = buildRollsForTextarea();
//   });

//   return textarea;
// }

// function getCopyToClipboardButton() {
//   const copyButton = document.createElement("div");
//   copyButton.innerText = "Copy to Clipboard";
//   copyButton.id = "copyToClipboardButton";
//   //   copyButton.style.height = "20px";
//   //   copyButton.style.boxShadow = "rgb(245, 245, 245) 0px 0px 0px 1px inset";
//   //   copyButton.style.marginBottom = "10px";
//   //   copyButton.style.padding = "5px";
//   //   copyButton.style.color = "rgb(255, 255, 255)";
//   //   copyButton.style.cursor = "pointer";
//   copyButton.addEventListener("click", copyWishlistToClipboard, false);

//   return copyButton;
// }

// function getErrorSpan() {
//   const errorSpan = document.createElement("span");
//   errorSpan.id = "wishlistErrors";
//   //   errorSpan.style.color = "rgb(255, 255, 255)";
//   //   errorSpan.style.background = "rgb(255, 0, 0, 0.25)";
//   //   errorSpan.style.marginBottom = "5px";
//   //   errorSpan.style.padding = "2px";
//   //   errorSpan.style.letterSpacing = "0.2em";
//   //   errorSpan.style.display = "none";

//   return errorSpan;
// }

// courtesy https://robkendal.co.uk/blog/2020-04-17-saving-text-to-client-side-file-using-vanilla-js
function downloadToFile(content, filename, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });

  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
}

// function getSaveToTextFileButton() {
//   const saveButton = document.createElement("div");
//   saveButton.innerText = "Save to File";
//   saveButton.id = "saveToFileButton";
//   //   saveButton.style.height = "20px";
//   //   saveButton.style.boxShadow = "rgb(245, 245, 245) 0px 0px 0px 1px inset";
//   //   saveButton.style.marginBottom = "10px";
//   //   saveButton.style.padding = "5px";
//   //   saveButton.style.color = "rgb(255, 255, 255)";
//   //   saveButton.style.cursor = "pointer";
//   saveButton.addEventListener("click", () => {
//     const textArea = document.getElementById("wishlistTextarea");

//     downloadToFile(textArea.value, "dim-wishlist.txt", "text/plain");
//   });
//   return saveButton;
// }

function addEventListeners() {
  const addToWishlistButton = document.getElementById("addToWishlistButton");
  addToWishlistButton.addEventListener("click", copyToTextarea, false);

  const copyToClipboardButton = document.getElementById(
    "copyToClipboardButton"
  );
  copyToClipboardButton.addEventListener(
    "click",
    copyWishlistToClipboard,
    false
  );

  const wishlistTextarea = document.getElementById("wishlistTextarea");
  wishlistTextarea.addEventListener("input", onTextareaInput, false);

  const saveToFilebutton = document.getElementById("saveToFileButton");
  saveToFilebutton.addEventListener("click", () => {
    const textArea = document.getElementById("wishlistTextarea");

    downloadToFile(textArea.value, "dim-wishlist.txt", "text/plain");
  });
}

function addElements() {
  const root = document.getElementById("root");

  const wishlistDiv = document.createElement("div");
  wishlistDiv.id = "wishlistDiv";
  wishlistDiv.innerHTML = `
    <div id="addToWishlistButton">Add Current Item to Wishlist</div>
    <div id="copyToClipboardButton">Copy to Clipboard</div>
    <textarea cols="90" rows="50" id="wishlistTextarea" spellcheck="false"></textarea>
    <span id="wishlistErrors"></span>
    <div id="saveToFileButton">Save to File</div>
  `;

  const toggleButton = getToggleButton();

  root.appendChild(wishlistDiv);
  addEventListeners();

  chrome.storage.local.get(["wishlistData"], (result) => {
    const wishlistTextarea = document.getElementById("wishlistTextarea");
    console.log("Value is currently " + result.wishlistData);
    rolls = JSON.parse(result.wishlistData);
    wishlistTextarea.value = buildRollsForTextarea();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Insert") {
      copyToTextarea();
    }
  });

  const span = contains("span", "Gunsmith")[0];
  span.parentElement.insertBefore(toggleButton, span);
}

let manifest = {};

async function getManifest() {
  const response = await fetch(
    "https://www.bungie.net/Platform/Destiny2/Manifest/",
    { headers: { "x-api-key": "897a3b5426fb4564b05058cad181b602" } }
  );
  const responseJson = await response.json();

  const jsonWorld = responseJson["Response"]["jsonWorldContentPaths"]["en"];
  const fullManifest = await fetch("https://www.bungie.net" + jsonWorld);
  const fullManifestJson = await fullManifest.json();

  manifest = fullManifestJson;
}

getManifest();

let observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (!mutation.addedNodes) return;

    for (let i = 0; i < mutation.addedNodes.length; i++) {
      // do things to your newly added nodes here
      let node = mutation.addedNodes[i];
      if (node.nodeName.toLowerCase() == "main") {
        addElements();
        break;
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});

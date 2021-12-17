let storage = chrome.storage.local;
let rolls = {};
let weaponMap = {};
let addingEnabled = true;
let shortcutKeys = "Insert";
let perkSelectedClass = "";
let currentWeapon = "";
let alertShown = false;

function copyToTextarea() {
  const errorSpan = document.getElementById("wishlistErrors");

  const rollType = getRollType();
  const textarea = document.getElementById("wishlistTextarea");
  const { weaponName, weaponHash, roll } = getRollInfo();
  currentWeapon = weaponName;

  const rollKey = `${weaponName} (${rollType})`;

  if (perkSelectedClass === "") {
    setSelectedClass(weaponHash, roll.split("&")[1].substr(6).split(",")[0]);
    console.log({ perkSelectedClass });
  }

  if (isRollInWishlist(roll, rollKey)) {
    errorSpan.classList.add("error");
    errorSpan.innerText = "This roll already exists in wishlist.";
  } else {
    if (!(rollKey in rolls)) {
      rolls[rollKey] = {};
      rolls[rollKey]["name"] = weaponName;
      rolls[rollKey]["rolls"] = [];
      rolls[rollKey]["notes"] = `${rollType}-`;
    }
    rolls[rollKey]["rolls"].push(roll);
    let fullText = buildRollsForTextarea();
    textarea.value = fullText;

    const startHighlight = textarea.value.indexOf(roll);

    textarea.focus();
    textarea.setSelectionRange(startHighlight, startHighlight + roll.length);

    setLocalStorage("wishlistData", JSON.stringify(rolls));

    errorSpan.classList.remove("error");
    errorSpan.innerText = "";
  }
}

function getRollInfo() {
  const wishlistText = document.querySelector("div > form > textarea");
  const roll = wishlistText.value;
  const weaponHash = roll.split("&")[0].substr(17);
  return { weaponName: weaponMap[weaponHash], roll, weaponHash };
}

function getRollType() {
  const checkedRadio = document.querySelector("input[name=rollType]:checked");
  return checkedRadio.value;
}

function buildRollsForTextarea() {
  let fullText = "";
  for (var weaponKey in rolls) {
    fullText += `// ${weaponKey}\n`;
    fullText += `//notes:${rolls[weaponKey]["notes"]}\n`;
    for (const roll of rolls[weaponKey]["rolls"]) {
      fullText += `${roll}\n`;
    }
    fullText += "\n";
  }
  return fullText;
}

function setLocalStorage(key, value) {
  storage.set({ key: value }, () => {
    console.log(`${key} set to ${value}`);
  });
}

async function getLocalStorage(key) {
  return new Promise((resolve, reject) => {
    storage.get([key], (result) => {
      console.log(`${key} currently set to ${result[key]}`);
      try {
        resolve(JSON.parse(result[key]));
      } catch (e) {
        resolve(result[key]);
      }
    });
  });
}

let timeout = null;
function onTextareaInput(e) {
  clearTimeout(timeout);
  const addButton = document.getElementById("addToWishlistButton");
  disableButton(addButton, copyToTextarea, false, "Updating...Please Wait");
  timeout = setTimeout(() => {
    console.log(
      "User has stopped typing. Parsing the textarea and updating localStorage."
    );

    parseTextarea();
    buildRollsForTextarea();
    setLocalStorage("wishlistData", JSON.stringify(rolls));
    enableButton(addButton, copyToTextarea, true, "Add to Wishlist");
  }, 2000);
}

function disableButton(button, func, adding = false, newText = "") {
  console.log(button.id, "disabled");
  button.classList.add("disabled");
  button.removeEventListener("click", func);
  button.innerText = newText === "" ? button.innerText : newText;
  addingEnabled = adding;
}

function enableButton(button, func, adding = true, newText = "") {
  console.log(button.id, "enabled");
  button.classList.remove("disabled");
  button.addEventListener("click", func);
  button.innerText = newText === "" ? button.innerText : newText;
  addingEnabled = adding;
}

function parseTextarea() {
  const text = document.getElementById("wishlistTextarea").value;
  const weapons = text.split("\n\n").filter((t) => t);
  rolls = {};
  for (const weapon of weapons) {
    const items = weapon.split("\n");
    const weaponRolls = items.slice(2);

    //Don't add back a weapon if it doesn't have any rolls
    if (weaponRolls && weaponRolls.length > 0) {
      let weaponHash =
        weaponRolls[0].indexOf("&") >= 0
          ? weaponRolls[0].split("&")[0].substr(17)
          : weaponRolls[0].substr(17);
      if (weaponHash.indexOf("-") === 0) {
        weaponHash = weaponHash.substr(1);
      }

      const weaponKey = items[0].substr(3);
      const notes = items[1].substr(8).trim();
      rolls[weaponKey] = {};
      rolls[weaponKey]["name"] = weaponMap[weaponHash];
      rolls[weaponKey]["notes"] = notes;
      rolls[weaponKey]["rolls"] = weaponRolls;
    }
  }
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

function setSelectedClass(itemId, perkId) {
  const perkEle = document.querySelector(
    `[data-for^=getContent-${itemId}_perk_${perkId}]`
  );

  if (isSelected(perkEle)) {
    perkSelectedClass = perkEle.classList[perkEle.classList.length - 1];
    chrome.storage.local.set({ perkSelectedClass: perkSelectedClass }, () => {
      console.log("perkSelectedClass set to ", perkSelectedClass);
    });
  }
}

function onSelect(e) {
  console.log("Selection changed");
  const perkButton = document.getElementById("selectPerksButton");
  const textarea = e.target;
  const first = textarea.selectionStart;
  const last = textarea.selectionEnd;
  const { itemId, perks } = getItemIdAndPerksFromSelection(
    textarea.value.substring(first, last).trim()
  );

  if (itemId && perks.length > 0) {
    if (isCurrentWeapon(itemId)) {
      enableButton(perkButton, selectCurrentRoll, true);
    } else {
      disableButton(perkButton, selectCurrentRoll, true);
      if (!alertShown) {
        alert(
          "Please search the weapon for the current selection if you would like to highlight the perks."
        );
        alertShown = true;
      }
    }
  } else {
    disableButton(perkButton, selectCurrentRoll, true);
  }
}

function isCurrentWeapon(itemId) {
  const { weaponName } = getRollInfo();
  return weaponName === weaponMap[itemId];
}

function getItemIdAndPerksFromSelection(selection) {
  try {
    const item = selection.split("&")[0];
    const itemId = item.split("=")[1];
    let perks = [];
    if (selection.split("&").length > 1) {
      perks = selection
        .split("&")[1]
        .substr(6)
        .split(",")
        .filter((p) => p);
    }
    return { itemId, perks };
  } catch (error) {
    console.error(error);
    return { itemId: null, perks: null };
  }
}

function selectCurrentRoll(e) {
  const textarea = document.getElementById("wishlistTextarea");
  const first = textarea.selectionStart;
  const last = textarea.selectionEnd;
  const selected = textarea.value.substring(first, last).trim();
  const itemId = selected.split("&")[0].substr(17);
  const perks = selected.split("&")[1].substr(6).split(",");
  console.log({ itemId }, { perks });

  if (
    document.querySelector(`[data-for^=getContent-${itemId}_perk_${perks[0]}]`)
  ) {
    // Deselect the currently selected perks for the weapon
    const selectedPerks = document.querySelectorAll(
      `.${perkSelectedClass}[data-for*=column]`
    );
    for (const perk of selectedPerks) {
      perk.click();
    }
  }

  for (const perkId of perks) {
    const perkEle = document.querySelector(
      `[data-for^=getContent-${itemId}_perk_${perkId}]`
    );

    if (perkEle === null) {
      console.log(
        "No perk element found for this query selector:",
        `[data-for^=getContent-${itemId}_perk_${perkId}]`
      );
      break;
    }

    if (!isSelected(perkEle)) {
      perkEle.click();
    }
  }
}

function isSelected(perkEle) {
  return (
    window.getComputedStyle(perkEle, null).backgroundColor !==
    "rgba(0, 0, 0, 0)"
  );
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

function getToggleButton() {
  const toggleButton = document.createElement("div");
  toggleButton.id = "toggleWishlistButton";
  toggleButton.innerText = "Hide Wishlist";
  toggleButton.addEventListener("click", toggleWishlist, false);

  return toggleButton;
}

// courtesy https://robkendal.co.uk/blog/2020-04-17-saving-text-to-client-side-file-using-vanilla-js
function downloadToFile(content, filename, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });

  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
}

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
  wishlistTextarea.addEventListener("select", onSelect, false);

  const saveToFileButton = document.getElementById("saveToFileButton");
  saveToFileButton.addEventListener("click", () => {
    const textArea = document.getElementById("wishlistTextarea");

    downloadToFile(textArea.value, "dim-wishlist.txt", "text/plain");
  });

  const selectButton = document.getElementById("selectPerksButton");
  selectButton.addEventListener("click", selectCurrentRoll, false);

  document.addEventListener("keydown", keydownShortcut);
  document.addEventListener("keyup", keyupShortcut);
}

let keysPressed = {};

function keydownShortcut(event) {
  keysPressed[event.key.toLowerCase()] = true;
  console.log("keydown", event.key, { keysPressed });
  if (isShortcutPressed()) {
    event.preventDefault();
    console.log(`Shortcut (${shortcutKeys}) pressed`);
    if (addingEnabled) {
      copyToTextarea();
    } else {
      setTimeout(() => {
        removeWarning();
      }, 2000);
      addWarning();
    }
  }
}

function keyupShortcut() {
  keysPressed = {};
}

function isShortcutPressed() {
  if (Object.keys(keysPressed).sort().join("+") === shortcutKeys) {
    keysPressed = {};
    return true;
  }
  return false;
}

function addWarning() {
  const error = document.getElementById("wishlistErrors");
  console.log("Adding warning class to errorSpan");
  error.innerText = "Currently parsing new input in wishlist. Please wait...";
  error.classList.add("warning");
}

function removeWarning() {
  const error = document.getElementById("wishlistErrors");
  console.log("Removing warning class from errorSpan");
  error.innerText = "";
  error.classList.remove("warning");
}

function addElements() {
  const root = document.getElementById("root");

  const wishlistDiv = document.createElement("div");
  wishlistDiv.id = "wishlistDiv";
  wishlistDiv.innerHTML = `
    <div class="buttons">
			<div id="addToWishlistButton" class="wishlistButton">Add to Wishlist</div>
    	<div id="copyToClipboardButton" class="wishlistButton">Copy to Clipboard</div>
			<div id="saveToFileButton" class="wishlistButton">Save to File</div>
      <div id="selectPerksButton" class="wishlistButton">Select Perks</div>
			<div class="radios" id="typeRadios">
				<input type="radio" name="rollType" id="PvE" value="PvE" checked>
				<label for="PvE">PvE</label>
				<input type="radio" name="rollType" id="PvP" value="PvP">
				<label for="PvP">PvP</label>
				<input type="radio" name="rollType" id="GM" value="GM">
				<label for="GM">GM</label>
			</div>
		</div>
    <textarea cols="90" rows="50" id="wishlistTextarea" spellcheck="false"></textarea>
    <span id="wishlistErrors"></span>   
  `;

  const toggleButton = getToggleButton();

  root.appendChild(wishlistDiv);
  addEventListeners();

  getLocalStorage("wishlistData").then((result) => {
    rolls = result;
    const wishlistTextarea = document.getElementById("wishlistTextarea");
    wishlistTextarea.value = buildRollsForTextarea();
  });

  getLocalStorage("shortcutKeys").then((result) => (shortcutKeys = result));

  storage.get(["perkSelectedClass"], (result) => {
    perkSelectedClass = result.perkSelectedClass;
    console.log("perkSelectedClass is currently", result.perkSelectedClass);
  });

  const span = contains("span", "Gunsmith")[0];
  span.parentElement.insertBefore(toggleButton, span);
}

async function getManifest() {
  const response = await fetch(
    "https://www.bungie.net/Platform/Destiny2/Manifest/",
    { headers: { "x-api-key": "897a3b5426fb4564b05058cad181b602" } }
  );
  const responseJson = await response.json();

  const jsonWorld =
    responseJson["Response"]["jsonWorldComponentContentPaths"]["en"][
      "DestinyInventoryItemDefinition"
    ];
  const itemManifest = await fetch("https://www.bungie.net" + jsonWorld);
  const itemManifestJson = await itemManifest.json();

  for (const hash in itemManifestJson) {
    weaponMap[hash] = itemManifestJson[hash].displayProperties.name;
  }
}

getManifest();

let observer = new MutationObserver(async (mutations) => {
  mutations.forEach(async (mutation) => {
    if (!mutation.addedNodes) return;

    for (let i = 0; i < mutation.addedNodes.length; i++) {
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

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.shortcutUpdated === "The shortcut has been updated.")
    sendResponse({ ack: "Acknowledged." });
  getLocalStorage("shortcutKeys").then((result) => (shortcutKeys = result));
  return true;
});

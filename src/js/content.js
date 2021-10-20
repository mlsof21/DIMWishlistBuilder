let rolls = {};
let addingEnabled = true;

function copyToTextarea() {
  const wishlistText = document.querySelector("div > form > textarea");
  const errorSpan = document.getElementById("wishlistErrors");
  const roll = wishlistText.value;
  const typeOfRoll = getRollType();
  const textarea = document.getElementById("wishlistTextarea");
  const weaponHash = roll.split("&")[0].substr(17);
  const weaponName = weaponMap[weaponHash];
  const rollKey = `${weaponName} (${typeOfRoll})`;

  if (isRollInWishlist(roll, rollKey)) {
    errorSpan.style.display = "block";
    errorSpan.innerText = "This roll already exists in wishlist.";
  } else {
    if (!(rollKey in rolls)) {
      rolls[rollKey] = {};
      rolls[rollKey]["name"] = weaponName;
      rolls[rollKey]["rolls"] = [];
      rolls[rollKey]["notes"] = `${typeOfRoll}-`;
    }
    rolls[rollKey]["rolls"].push(roll);
    let fullText = buildRollsForTextarea();
    textarea.value = fullText;

    const startHighlight = textarea.value.indexOf(roll);

    textarea.focus();
    textarea.setSelectionRange(startHighlight, startHighlight + roll.length);

    setLocalStorage(fullText);

    errorSpan.style.display = "none";
    errorSpan.innerText = "";
  }
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

function setLocalStorage() {
  const json = JSON.stringify(rolls);
  chrome.storage.local.set({ wishlistData: json }, () => {
    console.log("wishlistData set to ", json);
  });
}

let timeout = null;
function onTextareaInput(e) {
  clearTimeout(timeout);
  const addButton = document.getElementById("addToWishlistButton");
  disableButton(addButton, copyToTextarea);
  timeout = setTimeout(() => {
    console.log(
      "User has stopped typing. Parsing the textarea and updating localStorage."
    );

    parseTextarea();
    buildRollsForTextarea();
    setLocalStorage();
    enableButton(addButton, copyToTextarea);
  }, 5000);
}

function disableButton(button, func) {
  button.classList.add("disabled");
  button.removeEventListener("click", func);
  button.innerText = "Updating...Please wait";
  addingEnabled = false;
}

function enableButton(button, func) {
  button.classList.remove("disabled");
  button.addEventListener("click", func);
  button.innerText = "Add to Wishlist";
  addingEnabled = true;
}

function parseTextarea() {
  const text = document.getElementById("wishlistTextarea").value;
  const weapons = text.split("\n\n").filter((t) => t);
  rolls = {};
  for (const weapon of weapons) {
    const items = weapon.split("\n");
    const weaponRolls = items.slice(2);
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

  const saveToFilebutton = document.getElementById("saveToFileButton");
  saveToFilebutton.addEventListener("click", () => {
    const textArea = document.getElementById("wishlistTextarea");

    downloadToFile(textArea.value, "dim-wishlist.txt", "text/plain");
  });
}

function pressShortcutKey(event) {
  if (event.key === "Insert") {
    if (addingEnabled) {
      copyToTextarea();
    } else {
      setTimeout(() => {
        const error = document.getElementById("wishlistErrors");
        console.log("Removing warning class from errorSpan");
        error.classList.remove("warning");
      }, 3000);
      const error = document.getElementById("wishlistErrors");
      console.log("Adding warning class to errorSpan");
      error.classList.add("warning");
    }
  }
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

  chrome.storage.local.get(["wishlistData"], (result) => {
    const wishlistTextarea = document.getElementById("wishlistTextarea");
    console.log("Value is currently " + result.wishlistData);
    rolls = JSON.parse(result.wishlistData);
    wishlistTextarea.value = buildRollsForTextarea();
  });

  document.addEventListener("keydown", pressShortcutKey);

  const span = contains("span", "Gunsmith")[0];
  span.parentElement.insertBefore(toggleButton, span);
}

let weaponMap = {};

async function getManifest() {
  const response = await fetch(
    "https://www.bungie.net/Platform/Destiny2/Manifest/",
    { headers: { "x-api-key": "897a3b5426fb4564b05058cad181b602" } }
  );
  const responseJson = await response.json();

  const jsonWorld = responseJson["Response"]["jsonWorldContentPaths"]["en"];
  const fullManifest = await fetch("https://www.bungie.net" + jsonWorld);
  const fullManifestJson = await fullManifest.json();

  for (const hash in fullManifestJson.DestinyInventoryItemDefinition) {
    weaponMap[hash] =
      fullManifestJson.DestinyInventoryItemDefinition[
        hash
      ].displayProperties.name;
  }
}

getManifest();

let observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
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

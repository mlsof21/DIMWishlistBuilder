let storage = chrome.storage.local;
let rolls = {};
let addingEnabled = true;
let shortcutKeys = 'insert';
let weaponNameByHash = {};
let manifest;

const singleClick = new Event('click', {
  bubbles: true,
  cancelable: true,
});

async function getWishlistText() {
  const wishlistButton = [...document.querySelectorAll('button')].filter((a) =>
    a.textContent.includes('Copy Wishlist Item')
  )[0];
  wishlistButton.dispatchEvent(singleClick);

  return await navigator.clipboard.readText();
}

async function copyToTextarea() {
  const roll = await getWishlistText();
  const weaponHash = roll.split('&')[0].substring(17);
  const weaponName = weaponNameByHash[weaponHash];

  const errorSpan = document.getElementById('wishlistErrors');
  const typeOfRoll = getRollType();
  const textarea = document.getElementById('wishlistTextarea');
  const rollKey = `${weaponName} (${typeOfRoll})`;
  console.log(`Wishlist roll: ${roll}`);

  if (isRollInWishlist(roll, rollKey)) {
    errorSpan.classList.add('error');
    errorSpan.innerText = 'This roll already exists in wishlist.';
  } else {
    if (!(rollKey in rolls)) {
      rolls[rollKey] = {};
      rolls[rollKey]['name'] = weaponName;
      rolls[rollKey]['rolls'] = [];
      rolls[rollKey]['notes'] = `${typeOfRoll}-`;
    }
    rolls[rollKey]['rolls'].push(roll);
  }
  let fullText = buildRollsForTextarea();
  textarea.value = fullText;

  const startHighlightIndex = textarea.value.indexOf(roll);

  textarea.focus();
  textarea.setSelectionRange(startHighlightIndex, startHighlightIndex + startHighlightIndex.length);

  setLocalStorage(fullText);

  errorSpan.classList.remove('error');
  errorSpan.innerText = '';
}

function getRollType() {
  const checkedRadio = document.querySelector('input[name=rollType]:checked');
  return checkedRadio.value;
}

function buildRollsForTextarea() {
  let fullText = '';
  for (var weaponKey in rolls) {
    fullText += `// ${weaponKey}\n`;
    fullText += `//notes:${rolls[weaponKey]['notes']}\n`;
    for (const roll of rolls[weaponKey]['rolls']) {
      fullText += `${roll}\n`;
    }
    fullText += '\n';
  }
  return fullText;
}

function setLocalStorage() {
  const json = JSON.stringify(rolls);
  storage.set({ wishlistData: json }, () => {
    console.log('wishlistData set to ', json);
  });
}

let timeout = null;
function onTextareaInput(e) {
  clearTimeout(timeout);
  const addButton = document.getElementById('addToWishlistButton');
  disableAddButton(addButton, copyToTextarea);
  timeout = setTimeout(() => {
    console.log('User has stopped typing. Parsing the textarea and updating localStorage.');

    parseTextarea();
    let fullText = buildRollsForTextarea();
    e.target.value = fullText;
    setLocalStorage(fullText);
    enableAddButton(addButton, copyToTextarea);
  }, 2000);
}

function disableAddButton(button, func) {
  button.classList.add('disabled');
  button.removeEventListener('click', func);
  button.innerText = 'Updating...Please wait';
  addingEnabled = false;
}

function enableAddButton(button, func) {
  button.classList.remove('disabled');
  button.addEventListener('click', func);
  button.innerText = 'Add to Wishlist';
  addingEnabled = true;
}

function parseTextarea() {
  const text = document.getElementById('wishlistTextarea').value;
  const weapons = text.split('\n\n').filter((t) => t);
  rolls = {};
  for (const weapon of weapons) {
    const items = weapon.trim().split('\n');
    let weaponKey = '';
    let weaponName = '';
    let weaponHash = '';
    let actualWeaponName = '';
    let notes = '';
    let typeOfRoll = 'PvE';
    const weaponRolls = [];
    for (let item of items) {
      item = item.trim();

      if (item.startsWith('// ')) {
        weaponName = item.substr(3);
        continue;
      }
      if (item.startsWith('dimwishlist')) {
        weaponRolls.push(item);
        continue;
      }
      if (item.startsWith('//notes:')) {
        notes = item.substr(8).trim();
        continue;
      }
    }
    if (weaponRolls && weaponRolls.length > 0) {
      weaponHash =
        weaponRolls[0].indexOf('&') >= 0 ? weaponRolls[0].split('&')[0].substring(17) : weaponRolls[0].substring(17);
      if (weaponHash.indexOf('-') === 0) {
        weaponHash = weaponHash.substring(1);
      }
    }

    actualWeaponName = weaponNameByHash[weaponHash];
    const restOfNameLine = weaponName.replace(actualWeaponName, '').trim();
    if (restOfNameLine.toLowerCase().includes('pve')) {
      typeOfRoll = 'PvE';
    }
    if (restOfNameLine.toLowerCase().includes('pvp')) {
      typeOfRoll = 'PvP';
    }
    if (restOfNameLine.toLowerCase().includes('gm')) {
      typeOfRoll = 'GM';
    }

    weaponKey = `${actualWeaponName} (${typeOfRoll})`;
    rolls[weaponKey] = {};
    rolls[weaponKey]['name'] = actualWeaponName;
    rolls[weaponKey]['notes'] = notes;
    rolls[weaponKey]['rolls'] = weaponRolls;
  }
}

async function copyWishlistToClipboard() {
  const wishlistText = document.getElementById('wishlistTextarea').value;
  const copyButton = document.getElementById('copyToClipboardButton');
  copyButton.innerText = 'Copied!';
  setTimeout(() => (copyButton.innerText = 'Copy to Clipboard'), 2000);
  await navigator.clipboard.writeText(wishlistText);
}

function isRollInWishlist(newRoll, weapon) {
  if (weapon in rolls) {
    for (const roll of rolls[weapon]['rolls']) {
      if (newRoll === roll) {
        return true;
      }
    }
  }
  return false;
}

function toggleWishlist(e) {
  e.stopPropagation();
  const div = document.getElementById('wishlistDiv');
  const button = document.getElementById('toggleWishlistButton');
  if (div.style.display === 'flex') {
    div.style.display = 'none';
    button.innerText = 'Show Wishlist';
  } else {
    div.style.display = 'flex';
    button.innerText = 'Hide Wishlist';
  }
}

function contains(selector, text) {
  var elements = document.querySelectorAll(selector);
  return [].filter.call(elements, function (element) {
    return RegExp(text).test(element.textContent);
  });
}

function getToggleButton() {
  const toggleButton = document.createElement('div');
  toggleButton.id = 'toggleWishlistButton';
  toggleButton.innerText = 'Hide Wishlist';
  toggleButton.addEventListener('click', toggleWishlist, false);

  return toggleButton;
}

// courtesy https://robkendal.co.uk/blog/2020-04-17-saving-text-to-client-side-file-using-vanilla-js
function downloadToFile(content, filename, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });

  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
}

function addEventListeners() {
  const addToWishlistButton = document.getElementById('addToWishlistButton');
  addToWishlistButton.addEventListener('click', copyToTextarea, false);

  const copyToClipboardButton = document.getElementById('copyToClipboardButton');
  copyToClipboardButton.addEventListener('click', copyWishlistToClipboard, false);

  const wishlistTextarea = document.getElementById('wishlistTextarea');
  wishlistTextarea.addEventListener('input', onTextareaInput, false);

  const saveToFileButton = document.getElementById('saveToFileButton');
  saveToFileButton.addEventListener('click', () => {
    const textArea = document.getElementById('wishlistTextarea');

    downloadToFile(textArea.value, 'dim-wishlist.txt', 'text/plain');
  });

  const modalButton = document.getElementById('wishlistModalButton');
  modalButton.addEventListener('click', openModal, false);

  const span = document.getElementsByClassName('close')[0];
  span.addEventListener('click', closeModal, false);
}

function openModal() {
  const modal = document.getElementById('wishlistModal');
  console.log('opening modal');
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('wishlistModal');
  console.log('closing modal');
  modal.style.display = 'none';
}

let keysPressed = {};

function keydownShortcut(event) {
  // event.preventDefault();
  keysPressed[event.key.toLowerCase()] = true;
  if (isShortcutPressed()) {
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

function keyupShortcut(event) {
  delete keysPressed[event.key.toLowerCase()];
}

function isShortcutPressed() {
  if (Object.keys(keysPressed).sort().join('+').includes(shortcutKeys)) {
    console.log('Shortcut was pressed');
    keysPressed = {};
    return true;
  }
  return false;
}

function addWarning() {
  const error = document.getElementById('wishlistErrors');
  console.log('Adding warning class to errorSpan');
  error.innerText = 'Currently parsing new input in wishlist. Please wait...';
  error.classList.add('warning');
}

function removeWarning() {
  const error = document.getElementById('wishlistErrors');
  error.innerText = '';
  error.classList.remove('warning');
}

function addElements() {
  const main = document.getElementsByTagName('main')[0];

  const wishlistDiv = document.createElement('div');
  wishlistDiv.id = 'wishlistDiv';
  wishlistDiv.innerHTML = `
    <div class="buttons">
      <div id="addToWishlistButton" class="wishlistButton">Add to Wishlist</div>
      <div id="copyToClipboardButton" class="wishlistButton">Copy to Clipboard</div>
      <div id="saveToFileButton" class="wishlistButton">Save to File</div>
      <div class="radios" id="typeRadios">
        <input type="radio" name="rollType" id="PvE" value="PvE" checked />
        <label for="PvE">PvE</label>
        <input type="radio" name="rollType" id="PvP" value="PvP" />
        <label for="PvP">PvP</label>
        <input type="radio" name="rollType" id="GM" value="GM" />
        <label for="GM">GM</label>
      </div>
      <div id="wishlistModalButton" class="modalButton">?</div>
    </div>
    <textarea
      cols="50"
      rows="50"
      id="wishlistTextarea"
      spellcheck="false"
    ></textarea>
    <span id="wishlistErrors"></span>
  `;

  const modal = document.createElement('div');
  modal.id = 'wishlistModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>DIM Wishlist Builder Help</h2>
      <p>When adding a new roll, in the case that a selected perk has an Enhanced version, the builder will add a row for each permutation of the perks.</p>
      <ul>
        <li>Use INSERT as a keyboard shortcut to insert a new roll</li>
        <li>Only add notes where indicated by the weapon section (<code>//notes:</code>)</li>
      </ul>
    </div>`;

  const toggleButton = getToggleButton();

  main.appendChild(wishlistDiv);
  main.appendChild(modal);
  addEventListeners();

  storage.get(['wishlistData'], (result) => {
    const wishlistTextarea = document.getElementById('wishlistTextarea');
    console.log('Value is currently ' + result.wishlistData);
    if (result.wishlistData) {
      rolls = JSON.parse(result.wishlistData);
      wishlistTextarea.value = buildRollsForTextarea();
    }
  });

  getShortcutKeys();

  document.addEventListener('keydown', keydownShortcut);
  document.addEventListener('keyup', keyupShortcut);
  document.addEventListener(
    'click',
    function (event) {
      const modal = document.getElementById('wishlistModal');
      if (event.target === modal) {
        closeModal();
      }
    },
    false
  );

  const searchDiv = document.querySelector('.search');
  searchDiv.parentElement.insertBefore(toggleButton, searchDiv);

  observer.disconnect();
}

function getShortcutKeys() {
  storage.get(['shortcutKeys'], (result) => {
    if (result.shortcutKeys !== undefined) {
      console.log('ShortcutKeys currently set to', result.shortcutKeys);
      shortcutKeys = result.shortcutKeys;
    } else {
      storage.set({ shortcutKeys: shortcutKeys });
    }
  });
}

async function getManifest() {
  const response = await fetch('https://www.bungie.net/Platform/Destiny2/Manifest/', {
    headers: { 'x-api-key': '897a3b5426fb4564b05058cad181b602' },
  });
  const responseJson = await response.json();

  const jsonWorld = responseJson['Response']['jsonWorldContentPaths']['en'];
  const fullManifest = await fetch('https://www.bungie.net' + jsonWorld);
  manifest = await fullManifest.json();

  createMaps();
}

function createMaps() {
  for (const hash in manifest.DestinyInventoryItemDefinition) {
    const item = manifest.DestinyInventoryItemDefinition[hash];

    // Only map weapons
    if (item.itemType === 3) {
      weaponNameByHash[hash] = manifest.DestinyInventoryItemDefinition[hash].displayProperties.name;
    }
  }
}

getManifest();

let observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (!mutation.addedNodes) return;

    for (let i = 0; i < mutation.addedNodes.length; i++) {
      let node = mutation.addedNodes[i];
      let classList = node.classList;
      if (classList.contains('perks')) {
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
  if (request.shortcutUpdated === 'The shortcut has been updated.') sendResponse({ ack: 'Acknowledged.' });
  getShortcutKeys();
  return true;
});

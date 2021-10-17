const weaponList = ["Auto Rifle", "Hand Cannon", "Pulse Rifle", "Scout Rifle", "Sidearm", "Submachine Gun", "Bow", "Shotgun", "Sniper Rifle", "Fusion Rifle", "Trace Rifle", "Grenade Launcher", "Rocket Launcher", "Linear Fusion Rifle", "Machinegun", "Sword"];

let rolls = {};

function copyToTextarea() {
    console.log("Entering copyToTextArea");
    const wishlistText = document.querySelector("div > form > textarea");
    const errorSpan = document.getElementById("wishlistErrors")
    const roll = wishlistText.value;
    const textarea = document.getElementById("wishlistTextarea");
    const weaponName = getWeaponName();
    let shouldScroll = false;

    if (isRollInWishlist(roll, weaponName)) {
        errorSpan.style.display = "block";
        errorSpan.innerText = "This roll already exists in wishlist."
    }
    else {
        if (!(weaponName in rolls)) {
            rolls[weaponName] = {}
            rolls[weaponName]["rolls"] = [];
            rolls[weaponName]["notes"] = "";
            rolls[weaponName]["tags"] = "";
            shouldScroll = true;
        }
        rolls[weaponName]["rolls"].push(roll);
        let fullText = buildRollsForTextarea();
        textarea.value = fullText;

        if (shouldScroll) {
            textarea.scrollTop = textarea.scrollHeight;
        }

        setLocalStorage(fullText);

        errorSpan.style.display = "none";
        errorSpan.innerText = "";
    }
}

function buildRollsForTextarea() {
    let fullText = "";
    for (var weapon in rolls) {
        fullText += `// ${weapon}\n`;
        fullText += `//notes: ${rolls[weapon]["notes"]}|tags:${rolls[weapon]["tags"]}\n`;
        for (const roll of rolls[weapon]["rolls"]) {
            fullText += `${roll}\n`
        }
        fullText += "\n"
    }
    return fullText;
}

function setLocalStorage() {
    const json = JSON.stringify(rolls);
    chrome.storage.local.set({ "wishlistData": json }, () => {
        console.log("wishlistData set to ", json);
    });
}

let timeout = null;
function onTextareaInput(e) {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        console.log("User has stopped typing. Parsing the textarea and updating localStorage.");

        parseTextarea();
        buildRollsForTextarea();
        setLocalStorage();
    }, 5000)
}

function parseTextarea() {
    const text = document.getElementById("wishlistTextarea").value;
    const weapons = text.split("\n\n").filter(t => t);
    rolls = {}
    for (const weapon of weapons) {
        const items = weapon.split("\n");
        const weaponName = items[0].substr(3);
        const notes = items[1].split("|")[0].substr(8);
        const tags = items[1].split("|")[1].substr(5);
        const weaponRolls = items.slice(2);
        rolls[weaponName] = {}
        rolls[weaponName]["notes"] = notes;
        rolls[weaponName]["tags"] = tags;
        rolls[weaponName]["rolls"] = weaponRolls;
    }
}

function getWeaponName() {
    for (let i = 0; i < weaponList.length; i++) {
        const spans = contains("span", weaponList[i]);
        if (spans.length >= 1) {
            if (spans[0].parentElement.children[0].tagName === "H1") {
                return spans[0].parentElement.children[0].innerHTML;
            }
        }
    }
    return "";
}

// function getNewBlock(weapon, newRoll, text) {
//     const beginningIndex = text.indexOf(`// ${weapon}`);
//     const endingIndex = text.indexOf("\n\n", beginningIndex);
//     return text.slice(0, endingIndex - 1) + `\n${newRoll}` + text.slice(endingIndex);
// }

async function copyWishlistToClipboard() {
    const wishlistText = document.getElementById("wishlistTextarea").value;
    const copyButton = document.getElementById("copyToClipboardButton");
    copyButton.innerText = "Copied!";
    setTimeout(() => copyButton.innerText = "Copy to Clipboard", 2000);
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
    const button = document.getElementById("toggleButton");
    if (div.style.display === "flex") {
        div.style.display = "none";
        button.innerText = "Show Wishlist"
    }
    else {
        div.style.display = "flex";
        button.innerText = "Hide Wishlist"
    }
}

function contains(selector, text) {
    var elements = document.querySelectorAll(selector);
    return [].filter.call(elements, function (element) {
        return RegExp(text).test(element.textContent);
    });
}

function getAddToWishlistButton() {
    const addButton = document.createElement("div");
    addButton.innerText = "Add Current Item to Wishlist";
    addButton.id = "addButton";
    addButton.style.height = "20px";
    addButton.style.boxShadow = "rgb(245, 245, 245) 0px 0px 0px 1px inset";
    addButton.style.marginTop = "10px";
    addButton.style.marginBottom = "10px";
    addButton.style.padding = "5px";
    addButton.style.color = "rgb(255, 255, 255)";
    addButton.style.cursor = "pointer";
    addButton.addEventListener("click", copyToTextarea, false);

    return addButton;
}

function getToggleButton() {
    const toggleButton = document.createElement("div");
    toggleButton.id = "toggleButton";
    toggleButton.innerText = "Hide Wishlist";
    toggleButton.style.display = "inline-block";
    toggleButton.style.marginRight = "10px";
    toggleButton.style.boxShadow = "rgb(245, 245, 245) 0px 0px 0px 1px inset";
    toggleButton.style.padding = "5px";
    toggleButton.addEventListener("click", toggleWishlist, false);

    return toggleButton;
}

function getWishlistTextArea() {
    const textarea = document.createElement("textarea");
    textarea.cols = 100;
    textarea.rows = 50;
    textarea.id = "wishlistTextarea";
    textarea.spellcheck = false;
    textarea.style.color = "rgb(255, 255, 255)";
    textarea.style.display = "inline-block";
    textarea.style.boxShadow = "rgb(245, 245, 245) 0px 0px 0px 1px inset";
    textarea.style.background = "rgba(255, 255, 255, 0.05)";

    textarea.addEventListener("input", onTextareaInput, false);

    chrome.storage.local.get(["wishlistData"], (result) => {
        console.log("Value is currently " + result.wishlistData);
        rolls = JSON.parse(result.wishlistData);
        textarea.value = buildRollsForTextarea();
    })

    return textarea;
}

function getCopyToClipboardButton() {
    const copyButton = document.createElement("div");
    copyButton.innerText = "Copy to Clipboard";
    copyButton.id = "copyToClipboardButton";
    copyButton.style.height = "20px";
    copyButton.style.boxShadow = "rgb(245, 245, 245) 0px 0px 0px 1px inset";
    copyButton.style.marginBottom = "10px";
    copyButton.style.padding = "5px";
    copyButton.style.color = "rgb(255, 255, 255)";
    copyButton.style.cursor = "pointer";
    copyButton.addEventListener("click", copyWishlistToClipboard, false);

    return copyButton;
}

function getErrorSpan() {
    const errorSpan = document.createElement("span");
    errorSpan.id = "wishlistErrors";
    errorSpan.style.color = "rgb(255, 255, 255)";
    errorSpan.style.background = "rgb(255, 0, 0, 0.25)";
    errorSpan.style.marginBottom = "5px";
    errorSpan.style.padding = "2px";
    errorSpan.style.letterSpacing = "0.2em";
    errorSpan.style.display = "none";

    return errorSpan;
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

function getSaveToTextFileButton() {
    const saveButton = document.createElement("div");
    saveButton.innerText = "Save to File";
    saveButton.id = "saveToFileButton";
    saveButton.style.height = "20px";
    saveButton.style.boxShadow = "rgb(245, 245, 245) 0px 0px 0px 1px inset";
    saveButton.style.marginBottom = "10px";
    saveButton.style.padding = "5px";
    saveButton.style.color = "rgb(255, 255, 255)";
    saveButton.style.cursor = "pointer";
    saveButton.addEventListener('click', () => {
        const textArea = document.getElementById("wishlistText");

        downloadToFile(textArea.value, 'dim-wishlist.txt', 'text/plain');
    });
    return saveButton;
}

function addElements() {
    const root = document.getElementById("root");

    const wishlistDiv = document.createElement("div");
    wishlistDiv.style.display = "flex";
    wishlistDiv.style.flexDirection = "column";
    wishlistDiv.id = "wishlistDiv";

    const toggleButton = getToggleButton();

    root.appendChild(wishlistDiv);

    wishlistDiv.appendChild(getAddToWishlistButton());
    wishlistDiv.appendChild(getCopyToClipboardButton());
    wishlistDiv.appendChild(getWishlistTextArea());
    wishlistDiv.appendChild(getErrorSpan());
    wishlistDiv.appendChild(getSaveToTextFileButton());

    document.addEventListener("keydown", (event) => {
        if (event.key === "Insert") {
            copyToTextarea();
        }
    });

    const span = contains("span", "Gunsmith")[0];
    span.parentElement.insertBefore(toggleButton, span);
}

let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (!mutation.addedNodes) return

        for (let i = 0; i < mutation.addedNodes.length; i++) {
            // do things to your newly added nodes here
            let node = mutation.addedNodes[i]
            console.log(node.nodeName);
            if (node.nodeName.toLowerCase() == "main") {
                addElements();
                break;
            }
        }
    })
})

observer.observe(document.body, {
    childList: true
    , subtree: true
    , attributes: false
    , characterData: false
})
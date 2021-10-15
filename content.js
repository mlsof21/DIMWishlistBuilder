console.info("Adding button to copy wishlist");

function copyToTextarea() {
    console.log("Entering copyToTextArea");
    const wishlistText = document.querySelector("div > form > textarea");
    const errorSpan = document.getElementById("wishlistErrors")
    const text = wishlistText.value;
    const textarea = document.getElementById("wishlistTextarea");

    if (isInWishlist(text, textarea.value)) {
        errorSpan.style.display = "block";
        errorSpan.innerText = "This item already exists in wishlist."
    }
    else {
        const fullText = textarea.value + text + "\n";
        textarea.value = fullText;
        chrome.storage.local.set({"wishlistText": fullText}, () => {
            console.log("Value is set to " + fullText)
        });

        errorSpan.style.display = "none";
        errorSpan.innerText = "";
    }
}

async function copyWishlistToClipboard() {
    const wishlistText = document.getElementById("wishlistTextarea").value;
    const copyButton = document.getElementById("copyToClipboardButton");
    copyButton.innerText = "Copied!";
    setTimeout(() => copyButton.innerText = "Copy to Clipboard", 2000);
    await navigator.clipboard.writeText(wishlistText);
}

function isInWishlist(text, existingText) {
    const items = existingText.split("\n").filter(i => i);
    for (let i = 0; i < items.length; i++) {
        if (text === items[i]) {
            return true;
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
    textarea.style.color = "rgb(255, 255, 255)";
    textarea.style.display = "inline-block";
    textarea.style.boxShadow = "rgb(245, 245, 245) 0px 0px 0px 1px inset";
    textarea.style.background = "rgba(255, 255, 255, 0.05)";

    chrome.storage.local.get(["wishlistText"], (result) => {
        console.log("Value is currently " + result.wishlistText);
        textarea.value = result.wishlistText;
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
    errorSpan.style.padding = "2px";
    errorSpan.style.letterSpacing = "0.2em";
    errorSpan.style.display = "none";

    return errorSpan;
}

function addElements() {
    const root = document.getElementById("root");
    const main = document.getElementById("main");

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
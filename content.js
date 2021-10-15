console.info("Adding button to copy wishlist");

async function copyToTextarea() {
    console.log("Entering", this)
    const wishlistText = document.querySelector("div > form > textarea");
    const text = wishlistText.value;

    const textarea = document.getElementById("wishlistTextarea");
    textarea.value += text + "\n";
}

function toggleWishlist() {
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

function addElements() {
    const root = document.getElementById("root");
    const main = document.getElementById("main");
    
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.id = "wishlistDiv";

    const toggleButton = document.createElement("div");
    toggleButton.id = "toggleButton";
    toggleButton.innerText = "Hide Wishlist";
    toggleButton.style.display = "inline-block";
    toggleButton.style.marginRight = "10px";
    toggleButton.style.boxShadow = "rgb(245, 245, 245) 0px 0px 0px 1px inset";
    toggleButton.style.padding = "5px";
    toggleButton.addEventListener("click", toggleWishlist, false);
    root.insertBefore(toggleButton, main);

    const addButton = document.createElement("button");
    addButton.innerText = "Add Current Item to Wishlist";
    addButton.id = "addButton";
    addButton.style.height = "20px";

    const textarea = document.createElement("textarea");
    textarea.cols = 100;
    textarea.rows = 50;
    textarea.id = "wishlistTextarea";

    root.appendChild(div);

    console.log("Adding button");
    div.appendChild(addButton);

    console.log("Adding textarea");
    div.appendChild(textarea);

    document.getElementById("addButton").addEventListener("click", copyToTextarea, false);
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
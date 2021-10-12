console.info("Adding button to copy wishlist");

async function copyToTextarea() {
    const wishlistText = document.querySelector("div > form > textarea");
    const text = wishlistText.value;

    const textarea = document.getElementById("wishlistTextarea");
    textarea.value += text + "\n";
}


// const root = document.getElementById("root");
function addElements() {
    const root = document.getElementById("root");

    const newButton = document.createElement("button");
    newButton.innerText = "Add Current Item to Textarea";
    newButton.id = "addButton";

    const textarea = document.createElement("textarea");
    textarea.cols = 100;
    textarea.rows = 1000;
    textarea.id = "wishlistTextarea";

    root.appendChild(newButton);
    root.appendChild(textarea);

    document.getElementById("addButton").addEventListener("click", copyToTextarea, false);
    document.addEventListener("keydown", (event) => {
        console.log("Capturing key event");
        console.log(event);
        if (event.key == "Insert") {
            copyToTextarea();
        }
    });
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
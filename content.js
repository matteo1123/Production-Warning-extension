// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSelectedText") {
        const selectedText = window.getSelection().toString();
        sendResponse({ text: selectedText });
    }
});

// Log to verify the content script is loaded
console.log('Production Warning script loaded successful');

// Create hover box element
const hoverBox = document.createElement('div');
hoverBox.style.cssText = `
    position: fixed;
    background-color: #ff0000;
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 10000;
    display: none;
`;
document.body.appendChild(hoverBox);

let targetUrl = "";

// Function to add hover listeners to an element
function addHoverListeners(element) {
    element.addEventListener('mouseover', function(e) {
        hoverBox.textContent = "Production!";
        hoverBox.style.display = 'block';
        hoverBox.style.left = e.pageX + 10 + 'px';
        hoverBox.style.top = e.pageY + 10 + 'px';
    });

    element.addEventListener('mouseout', function() {
        hoverBox.style.display = 'none';
    });
}

// Function to process elements
function processElements(rootElement) {
    if (window.location.href.includes(targetUrl)) {
        // Process regular elements
        rootElement.querySelectorAll("a, button").forEach(element => {
            addHoverListeners(element);
        });

        // Process iframes
        rootElement.querySelectorAll("iframe").forEach(iframe => {
            try {
                // Only process same-origin iframes
                if (iframe.contentDocument) {
                    processElements(iframe.contentDocument);
                    
                    // Observe iframe content for changes
                    observer.observe(iframe.contentDocument.body, {
                        childList: true,
                        subtree: true
                    });
                }
            } catch (e) {
                // Skip cross-origin iframes
                console.log("Cannot access iframe due to same-origin policy");
            }
        });
    }
}

// Set up the mutation observer
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    processElements(node);
                    
                    // If the new node is an iframe, process it
                    if (node.tagName === 'IFRAME') {
                        try {
                            node.addEventListener('load', () => {
                                if (node.contentDocument) {
                                    processElements(node.contentDocument);
                                }
                            });
                        } catch (e) {
                            console.log("Cannot access iframe due to same-origin policy");
                        }
                    }
                }
            });
        }
    });
});

// Initialize when the target URL is retrieved
chrome.storage.sync.get(['targetUrl'], function(result) {
    targetUrl = result.targetUrl;
    console.log("Production warning extension: target url configured as", targetUrl);
    
    // Process existing elements
    processElements(document);
    
    // Start observing the document for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});



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
    background-color: #cc0000;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 10000;
    display: none;
    border: 1px solid #ffd700;
    font-weight: bold;
`;
document.body.appendChild(hoverBox);

// Create focus bar
const focusBar = document.createElement('div');
focusBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #1a1a1a;
    color: #ffd700;
    padding: 10px 0;
    z-index: 10001;
    display: none;
    text-align: center;
    border-bottom: 2px solid #ffd700;
`;

// Create main focus text
const mainFocus = document.createElement('div');
mainFocus.style.cssText = `
    font-size: 24px;
    margin-bottom: 8px;
    color: #ffd700;
    font-weight: bold;
`;
focusBar.appendChild(mainFocus);

// Create links container
const linksContainer = document.createElement('div');
linksContainer.style.cssText = `
    display: flex;
    justify-content: space-around;
    font-size: 14px;
    padding: 0 20px;
`;
focusBar.appendChild(linksContainer);

document.body.appendChild(focusBar);

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
        rootElement.querySelectorAll("a, button, div.switch, input, label, iframe").forEach(element => {
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

// Function to update focus bar
function updateFocusBar(focusData) {
    if (!focusData || !focusData.enabled) {
        focusBar.style.display = 'none';
        return;
    }

    mainFocus.textContent = focusData.mainFocus;
    linksContainer.innerHTML = '';
    
    if (focusData.links) {
        focusData.links.forEach(({key, value}) => {
            const link = document.createElement('a');
            link.href = value;
            link.textContent = key;
            link.style.cssText = `
                color: #ffd700;
                text-decoration: none;
                padding: 6px 12px;
                border-radius: 4px;
                background-color: #2a2a2a;
                border: 1px solid #ffd700;
                transition: all 0.3s ease;
                margin: 0 4px;
            `;
            link.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#cc0000';
                this.style.borderColor = '#cc0000';
                this.style.color = '#ffffff';
            });
            link.addEventListener('mouseout', function() {
                this.style.backgroundColor = '#2a2a2a';
                this.style.borderColor = '#ffd700';
                this.style.color = '#ffd700';
            });
            linksContainer.appendChild(link);
        });
    }
    
    focusBar.style.display = 'block';
    // Adjust body padding to prevent content from going under the focus bar
    document.body.style.paddingTop = focusBar.offsetHeight + 'px';
}

// Listen for focus mode updates
chrome.storage.sync.get(['focusMode'], function(result) {
    if (result.focusMode) {
        updateFocusBar(result.focusMode);
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.focusMode) {
        updateFocusBar(changes.focusMode.newValue);
    }
});



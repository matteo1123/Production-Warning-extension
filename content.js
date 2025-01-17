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

// Add logo container
const logoContainer = document.createElement('div');
logoContainer.style.cssText = `
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
`;

const logo = document.createElement('img');
logo.src = chrome.runtime.getURL('icons/icon32.png');
logo.style.width = '32px';
logo.style.height = '32px';
logoContainer.appendChild(logo);
focusBar.appendChild(logoContainer);

// Add focus label
const focusLabel = document.createElement('div');
focusLabel.style.cssText = `
    font-size: 12px;
    color: #cc0000;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
`;
focusLabel.textContent = "Current Focus";
focusBar.appendChild(focusLabel);

// Update main focus styling
const mainFocus = document.createElement('div');
mainFocus.style.cssText = `
    font-size: 24px;
    color: #ffd700;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
`;

// Add emphasis arrows
const leftArrow = document.createElement('span');
leftArrow.textContent = '>';
leftArrow.style.color = '#cc0000';
leftArrow.style.fontWeight = 'bold';

const rightArrow = document.createElement('span');
rightArrow.textContent = '<';
rightArrow.style.color = '#cc0000';
rightArrow.style.fontWeight = 'bold';

const focusText = document.createElement('span');
mainFocus.appendChild(leftArrow);
mainFocus.appendChild(focusText);
mainFocus.appendChild(rightArrow);
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

let targetUrl1 = "";
let targetUrl2 = "";

// Function to check if URL matches either target
function isTargetUrl(url) {
    return url.includes(targetUrl1) || url.includes(targetUrl2);
}

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
    if (isTargetUrl(window.location.href)) {
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

// Initialize when the target URLs are retrieved
chrome.storage.sync.get(['targetUrl1', 'targetUrl2'], function(result) {
    targetUrl1 = result.targetUrl1 || "";
    targetUrl2 = result.targetUrl2 || "";
    console.log("Production warning extension: target urls configured as", targetUrl1, targetUrl2);
    
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

    focusText.textContent = focusData.mainFocus;
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



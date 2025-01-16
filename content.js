// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSelectedText") {
        const selectedText = window.getSelection().toString();
        sendResponse({ text: selectedText });
    }
});

// Log to verify the content script is loaded
console.log('Content script loaded successful');

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
chrome.storage.sync.get(['targetUrl'], function(result) {
    targetUrl = result.targetUrl;
});

if (window.location.href.includes(targetUrl)) {
    document.querySelectorAll("a").forEach(link => {
        link.addEventListener('mouseover', function(e) {
                hoverBox.textContent = "Production!";
                hoverBox.style.display = 'block';
                hoverBox.style.left = e.pageX + 10 + 'px';
                hoverBox.style.top = e.pageY + 10 + 'px';
        });

        link.addEventListener('mouseout', function() {
            hoverBox.style.display = 'none';
        });
    });
    document.querySelectorAll("button").forEach(link => {
        link.addEventListener('mouseover', function(e) {
                hoverBox.textContent = "Production!";
                hoverBox.style.display = 'block';
                hoverBox.style.left = e.pageX + 10 + 'px';
                hoverBox.style.top = e.pageY + 10 + 'px';
        });

        link.addEventListener('mouseout', function() {
            hoverBox.style.display = 'none';
        });
    });
} else {
    console.log("Production warning extension: not target url", window.location.href.includes(targetUrl), window.location.href, targetUrl);
}


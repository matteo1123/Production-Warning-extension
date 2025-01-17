document.addEventListener('DOMContentLoaded', function() {
    const enableFocus = document.getElementById('enableFocus');
    const mainFocus = document.getElementById('mainFocus');
    const linkPairs = document.getElementById('linkPairs');
    const addLinkBtn = document.getElementById('addLink');
    const saveBtn = document.getElementById('save');

    // Load existing settings
    chrome.storage.sync.get(['focusMode'], function(result) {
        if (result.focusMode) {
            enableFocus.checked = result.focusMode.enabled;
            mainFocus.value = result.focusMode.mainFocus || '';
            if (result.focusMode.links) {
                result.focusMode.links.forEach(addLinkPair);
            }
        }
    });

    function addLinkPair(existing = { key: '', value: '' }) {
        // Don't add if we've reached the limit
        if (linkPairs.children.length >= 8) {
            return;
        }

        const pair = document.createElement('div');
        pair.className = 'link-pair';
        
        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.placeholder = 'Link Text';
        keyInput.value = existing.key;

        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.placeholder = 'URL';
        valueInput.value = existing.value;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.onclick = () => {
            pair.remove();
            // Re-enable add button if we're below limit
            if (linkPairs.children.length < 8) {
                addLinkBtn.disabled = false;
            }
        };

        pair.appendChild(keyInput);
        pair.appendChild(valueInput);
        pair.appendChild(removeBtn);
        linkPairs.appendChild(pair);

        // Disable add button if we've reached the limit
        if (linkPairs.children.length >= 8) {
            addLinkBtn.disabled = true;
        }
    }

    addLinkBtn.addEventListener('click', () => {
        if (linkPairs.children.length < 8) {
            addLinkPair();
        }
    });

    saveBtn.addEventListener('click', function() {
        const links = [];
        const pairs = linkPairs.getElementsByClassName('link-pair');
        
        for (let pair of pairs) {
            const inputs = pair.getElementsByTagName('input');
            if (inputs[0].value && inputs[1].value) {
                links.push({
                    key: inputs[0].value,
                    value: inputs[1].value
                });
            }
        }

        const focusMode = {
            enabled: enableFocus.checked,
            mainFocus: mainFocus.value,
            links: links
        };

        chrome.storage.sync.set({ focusMode }, function() {
            alert('Focus mode settings saved!');
        });
    });

    // Listen for storage changes to update UI when links are added via context menu
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.focusMode) {
            const newFocusMode = changes.focusMode.newValue;
            if (newFocusMode && newFocusMode.links) {
                // Clear existing links
                linkPairs.innerHTML = '';
                // Add all links
                newFocusMode.links.forEach(addLinkPair);
            }
        }
    });
}); 
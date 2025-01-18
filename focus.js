document.addEventListener('DOMContentLoaded', function() {
    const enableFocus = document.getElementById('enableFocus');
    const focusList = document.getElementById('focusList');
    const addFocusBtn = document.getElementById('addFocus');
    const saveBtn = document.getElementById('save');
    
    const MAX_FOCUSES = 10;
    const MAX_LINKS = 8;

    function updateAddFocusButton() {
        const focusCount = focusList.querySelectorAll('.focus-item').length;
        addFocusBtn.disabled = focusCount >= MAX_FOCUSES;
        addFocusBtn.title = focusCount >= MAX_FOCUSES ? 
            `Maximum ${MAX_FOCUSES} focus topics allowed` : 
            'Add a new focus topic';
    }

    function createLinkPairs(container, links = []) {
        container.innerHTML = '';
        links.forEach(link => addLinkPair(container, link));
        
        const addLinkBtn = document.createElement('button');
        addLinkBtn.textContent = 'Add Link';
        addLinkBtn.style.marginTop = '8px';
        addLinkBtn.className = 'add-link-btn';
        
        const linkCount = container.querySelectorAll('.link-pair').length;
        addLinkBtn.disabled = linkCount >= MAX_LINKS;
        addLinkBtn.title = linkCount >= MAX_LINKS ? 
            `Maximum ${MAX_LINKS} links allowed` : 
            'Add a new link';
            
        addLinkBtn.onclick = () => {
            if (container.querySelectorAll('.link-pair').length < MAX_LINKS) {
                addLinkPair(container);
                // Update button state after adding link
                const newLinkCount = container.querySelectorAll('.link-pair').length;
                addLinkBtn.disabled = newLinkCount >= MAX_LINKS;
                addLinkBtn.title = newLinkCount >= MAX_LINKS ? 
                    `Maximum ${MAX_LINKS} links allowed` : 
                    'Add a new link';
            }
        };
        container.appendChild(addLinkBtn);
    }

    function addLinkPair(container, existing = { key: '', value: '' }) {
        if (container.querySelectorAll('.link-pair').length >= MAX_LINKS) return;

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
        removeBtn.className = 'remove-link-btn';
        removeBtn.onclick = () => {
            pair.remove();
            // Update add link button state after removing a link
            const addLinkBtn = container.querySelector('.add-link-btn');
            const linkCount = container.querySelectorAll('.link-pair').length;
            addLinkBtn.disabled = linkCount >= MAX_LINKS;
            addLinkBtn.title = linkCount >= MAX_LINKS ? 
                `Maximum ${MAX_LINKS} links allowed` : 
                'Add a new link';
        };

        pair.appendChild(keyInput);
        pair.appendChild(valueInput);
        pair.appendChild(removeBtn);
        container.insertBefore(pair, container.lastChild);
    }

    function createFocusItem(focus = { name: '', links: [], active: false }) {
        const focusItem = document.createElement('div');
        focusItem.className = `focus-item${focus.active ? ' active' : ''}`;
        
        const focusName = document.createElement('input');
        focusName.type = 'text';
        focusName.value = focus.name;
        focusName.placeholder = 'Enter focus name';
        focusName.className = 'focus-name';

        const linksContainer = document.createElement('div');
        linksContainer.className = 'links-container';
        createLinkPairs(linksContainer, focus.links);

        const controls = document.createElement('div');
        controls.className = 'focus-controls';

        const setActiveBtn = document.createElement('button');
        setActiveBtn.textContent = focus.active ? 'Active' : 'Set Active';
        setActiveBtn.style.backgroundColor = focus.active ? '#cc0000' : '#2a2a2a';
        setActiveBtn.className = 'set-active-btn';
        setActiveBtn.onclick = () => {
            document.querySelectorAll('.focus-item').forEach(item => {
                item.classList.remove('active');
                const activeBtn = item.querySelector('.set-active-btn');
                if (activeBtn) {
                    activeBtn.textContent = 'Set Active';
                    activeBtn.style.backgroundColor = '#2a2a2a';
                }
            });
            focusItem.classList.add('active');
            setActiveBtn.textContent = 'Active';
            setActiveBtn.style.backgroundColor = '#cc0000';
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => {
            focusItem.remove();
            updateAddFocusButton();
        };

        controls.appendChild(setActiveBtn);
        controls.appendChild(deleteBtn);

        focusItem.appendChild(focusName);
        focusItem.appendChild(linksContainer);
        focusItem.appendChild(controls);

        updateAddFocusButton();
        return focusItem;
    }

    // Load existing settings
    chrome.storage.sync.get(['focusMode'], function(result) {
        if (result.focusMode) {
            enableFocus.checked = result.focusMode.enabled;
            
            const focuses = result.focusMode.focuses || [{
                name: result.focusMode.mainFocus || '',
                links: result.focusMode.links || [],
                active: true
            }];

            focuses.forEach(focus => {
                focusList.appendChild(createFocusItem(focus));
            });
        }
        updateAddFocusButton();
    });

    addFocusBtn.addEventListener('click', () => {
        if (focusList.querySelectorAll('.focus-item').length < MAX_FOCUSES) {
            focusList.appendChild(createFocusItem());
            updateAddFocusButton();
        }
    });

    saveBtn.addEventListener('click', function() {
        const focuses = [];
        document.querySelectorAll('.focus-item').forEach(item => {
            const links = [];
            item.querySelectorAll('.link-pair').forEach(pair => {
                const inputs = pair.getElementsByTagName('input');
                if (inputs[0].value && inputs[1].value) {
                    links.push({
                        key: inputs[0].value,
                        value: inputs[1].value
                    });
                }
            });

            focuses.push({
                name: item.querySelector('.focus-name').value,
                links: links,
                active: item.classList.contains('active')
            });
        });

        const focusMode = {
            enabled: enableFocus.checked,
            focuses: focuses,
            mainFocus: focuses.find(f => f.active)?.name || '',
            links: focuses.find(f => f.active)?.links || []
        };

        chrome.storage.sync.set({ focusMode }, function() {
            alert('Focus mode settings saved!');
        });
    });
}); 
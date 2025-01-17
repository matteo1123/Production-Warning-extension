document.addEventListener('DOMContentLoaded', function() {
    const targetUrl1Input = document.getElementById('targetUrl1');
    const targetUrl2Input = document.getElementById('targetUrl2');
    const saveButton = document.getElementById('save');

    // Load saved URLs
    chrome.storage.sync.get(['targetUrl1', 'targetUrl2'], function(result) {
        targetUrl1Input.value = result.targetUrl1 || '';
        targetUrl2Input.value = result.targetUrl2 || '';
    });

    saveButton.addEventListener('click', function() {
        chrome.storage.sync.set({
            targetUrl1: targetUrl1Input.value,
            targetUrl2: targetUrl2Input.value
        }, function() {
            alert('Settings saved!');
        });
    });
}); 
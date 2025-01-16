document.addEventListener('DOMContentLoaded', function() {
  // Load saved URL
  chrome.storage.sync.get(['targetUrl'], function(result) {
    document.getElementById('targetUrl').value = result.targetUrl || '';
  });

  // Save URL when button is clicked
  document.getElementById('save').addEventListener('click', function() {
    const targetUrl = document.getElementById('targetUrl').value;
    chrome.storage.sync.set({ targetUrl: targetUrl }, function() {
      alert('Settings saved!');
    });
  });
}); 
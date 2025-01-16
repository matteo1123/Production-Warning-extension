document.addEventListener('DOMContentLoaded', function() {
  // Load saved URL
  let targetUrl = "";
  chrome.storage.sync.get(['targetUrl'], function(result) {
    targetUrl = result.targetUrl || '';
    document.getElementById('targetUrl').value = targetUrl;
  });

  // Save URL when button is clicked
  document.getElementById('save').addEventListener('click', function() {
    targetUrl = document.getElementById('targetUrl').value;
    chrome.storage.sync.set({ targetUrl: targetUrl }, function() {
      alert('Settings saved!');
    });
  });
}); 
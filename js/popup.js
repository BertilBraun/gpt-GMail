function getSetting(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
}

async function displaySetting() {
  const apiKey = await getSetting("apiKey");
  const name = await getSetting("name");
  if (apiKey) {
    document.getElementById("api-key-display").textContent =
      "API Key: " + apiKey.substr(0, 6) + "..." + apiKey.substr(-3);
  }
  if (name) {
    document.getElementById("name-display").textContent = "Name: " + name;
  }
}

document
  .getElementById("settings-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const apiKey = document.getElementById("api-key-input").value;
    const name = document.getElementById("name-input").value;

    if (apiKey) {
      chrome.storage.sync.set({ apiKey: apiKey }, function () {
        displaySetting();
      });
    }

    if (name) {
      chrome.storage.sync.set({ name: name }, function () {
        displaySetting();
      });
    }
  });

displaySetting();

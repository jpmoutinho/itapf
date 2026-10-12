const defaults = { hideNsfw: true, hidePortraits: true };
const inputs = {
  hideNsfw: document.querySelector("#hideNsfw"),
  hidePortraits: document.querySelector("#hidePortraits")
};

chrome.storage.local.get(defaults, (saved) => {
  for (const key of Object.keys(defaults)) inputs[key].checked = saved[key];
});

for (const [key, input] of Object.entries(inputs)) {
  input.addEventListener("change", () => chrome.storage.local.set({ [key]: input.checked }));
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  for (const key of Object.keys(defaults)) {
    if (changes[key]) inputs[key].checked = changes[key].newValue;
  }
});

const DEFAULTS = { hideNsfw: true, hidePortraits: true };
const HIDDEN_CLASS = "itapf-hidden-post";
const PORTRAIT = /\[\s*portrait\s*\]/i;
const NSFW_TITLE = /\[\s*nsfw\s*\]/i;
const DIRECT_POST = /^\/(?:r\/[^/]+\/)?comments\//i;

const CARD_SELECTOR = [
  "shreddit-post",
  "[data-testid='post-container']",
  ".thing.link"
].join(",");

const TITLE_SELECTORS = [
  "[slot='title']",
  "[data-testid='post-title']",
  "h3",
  ".title a.title"
];

const NSFW_SELECTOR = [
  "[data-testid*='nsfw' i]",
  "[aria-label='NSFW' i]",
  "[title='NSFW' i]",
  ".nsfw-stamp",
  ".over18",
  ".nsfw"
].join(",");

function subredditName(value) {
  if (!value) return null;
  return value.trim().replace(/^r\//i, "").replace(/^\/+|\/+$/g, "").toLowerCase();
}

function getSubreddit(card) {
  const attributes = [
    "subreddit-prefixed-name",
    "data-subreddit-prefixed",
    "subreddit-name",
    "data-subreddit"
  ];

  for (const name of attributes) {
    if (card.hasAttribute(name)) return subredditName(card.getAttribute(name));
  }

  for (const link of card.querySelectorAll("a[href*='/r/']")) {
    const match = link.getAttribute("href")?.match(/(?:^|reddit\.com)\/r\/([^/?#]+)/i);
    if (match) return subredditName(match[1]);
  }
  return null;
}

function getTitle(card) {
  const attributeTitle = card.getAttribute("post-title") || card.getAttribute("data-title");
  if (attributeTitle) return attributeTitle.trim();

  for (const selector of TITLE_SELECTORS) {
    const title = card.querySelector(selector)?.textContent.trim();
    if (title) return title;
  }
  return "";
}

function isNsfw(card) {
  const attributes = ["nsfw", "is-nsfw", "over-18", "data-nsfw", "data-is-nsfw", "data-over18"];
  for (const name of attributes) {
    if (!card.hasAttribute(name)) continue;
    const value = card.getAttribute(name);
    if (value === "" || value === null || /^(true|1|yes|nsfw)$/i.test(value)) return true;
  }

  if (card.querySelector(NSFW_SELECTOR)) return true;

  const badges = card.querySelectorAll("span, faceplate-screen-reader-content, [role='status']");
  return [...badges].some((badge) => /^(nsfw|18\+)$/i.test(badge.textContent.trim()));
}

function shouldHide(card, settings) {
  if (getSubreddit(card) !== "itookapicture") return false;
  const title = getTitle(card);
  return (settings.hideNsfw && (isNsfw(card) || NSFW_TITLE.test(title))) ||
    (settings.hidePortraits && PORTRAIT.test(title));
}

function filterPosts(cards, settings, pathname) {
  const isDirectPost = DIRECT_POST.test(pathname);
  for (const card of cards) {
    card.classList.toggle(HIDDEN_CLASS, !isDirectPost && shouldHide(card, settings));
  }
}

function start() {
  let settings = { ...DEFAULTS };
  let framePending = false;
  let lastPath = location.pathname;

  function scan() {
    framePending = false;
    filterPosts(document.querySelectorAll(CARD_SELECTOR), settings, location.pathname);
  }

  function scheduleScan() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(scan);
  }

  new MutationObserver(scheduleScan).observe(document, {
    subtree: true,
    childList: true,
    attributes: true
  });

  chrome.storage.local.get(DEFAULTS, (saved) => {
    settings = { ...DEFAULTS, ...saved };
    scheduleScan();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    for (const key of Object.keys(DEFAULTS)) {
      if (changes[key]) settings[key] = changes[key].newValue;
    }
    scheduleScan();
  });

  setInterval(() => {
    if (location.pathname === lastPath) return;
    lastPath = location.pathname;
    scheduleScan();
  }, 750);

  scheduleScan();
}

if (typeof module === "undefined") {
  start();
} else {
  module.exports = {
    DEFAULTS,
    HIDDEN_CLASS,
    DIRECT_POST,
    subredditName,
    getSubreddit,
    getTitle,
    isNsfw,
    shouldHide,
    filterPosts
  };
}

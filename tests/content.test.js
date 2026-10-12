const test = require("node:test");
const assert = require("node:assert/strict");
const itapf = require("../src/content.js");

class FakeCard {
  constructor({ subreddit, title = "ITAP of a tree", nsfw = false, badge = "", oldReddit = false } = {}) {
    this.attributes = {
      ...(subreddit ? { [oldReddit ? "data-subreddit" : "subreddit-prefixed-name"]: subreddit } : {}),
      ...(!oldReddit && title ? { "post-title": title } : {}),
      ...(nsfw ? { "is-nsfw": "true" } : {})
    };
    this.title = title;
    this.oldReddit = oldReddit;
    this.badge = badge;
    this.hidden = false;
    this.classList = { toggle: (_, hidden) => { this.hidden = hidden; } };
  }

  hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  querySelector(selector) {
    if (selector.includes("nsfw") && this.badge === "selector") return {};
    if (selector === ".title a.title" && this.oldReddit) return { textContent: this.title };
    return null;
  }
  querySelectorAll(selector) {
    if (selector === "span, faceplate-screen-reader-content, [role='status']" && this.badge) {
      return [{ textContent: this.badge }];
    }
    return [];
  }
}

test("recognises portrait posts without matching ordinary portrait words", () => {
  for (const title of ["Photo [Portrait]", "[portrait] ITAP", "Photo [ PORTRAIT ]"]) {
    assert.equal(itapf.shouldHide(new FakeCard({ subreddit: "itookapicture", title }), {
      hideNsfw: false, hidePortraits: true
    }), true);
  }
  assert.equal(itapf.shouldHide(new FakeCard({ subreddit: "itookapicture", title: "A portrait" }), {
    hideNsfw: false, hidePortraits: true
  }), false);
});

test("normalises subreddit names and ignores other communities", () => {
  assert.equal(itapf.subredditName("r/ITookAPicture"), "itookapicture");
  assert.equal(itapf.shouldHide(new FakeCard({ subreddit: "r/pics", nsfw: true }), itapf.DEFAULTS), false);
  assert.equal(itapf.shouldHide(new FakeCard({ nsfw: true }), itapf.DEFAULTS), false);
});

test("reads old Reddit post attributes and titles", () => {
  const card = new FakeCard({
    subreddit: "itookapicture",
    title: "Old Reddit photo [Portrait]",
    oldReddit: true
  });
  assert.equal(itapf.getSubreddit(card), "itookapicture");
  assert.equal(itapf.getTitle(card), "Old Reddit photo [Portrait]");
  assert.equal(itapf.shouldHide(card, itapf.DEFAULTS), true);
});

test("recognises NSFW posts in each supported form", () => {
  const settings = { hideNsfw: true, hidePortraits: false };
  assert.equal(itapf.shouldHide(new FakeCard({ subreddit: "itookapicture", nsfw: true }), settings), true);
  assert.equal(itapf.shouldHide(new FakeCard({ subreddit: "itookapicture", badge: "NSFW" }), settings), true);
  assert.equal(itapf.shouldHide(new FakeCard({ subreddit: "itookapicture", title: "Photo [nsfw]" }), settings), true);
  assert.equal(itapf.shouldHide(new FakeCard({ subreddit: "itookapicture", title: "[ NSFW ] photo" }), settings), true);
  assert.equal(itapf.shouldHide(new FakeCard({ subreddit: "itookapicture", badge: "NSFW photography" }), settings), false);
  assert.equal(itapf.shouldHide(new FakeCard({ subreddit: "itookapicture", title: "NSFW photography" }), settings), false);
});

test("supports all four filter combinations", () => {
  const card = new FakeCard({ subreddit: "itookapicture", title: "Photo [Portrait]", nsfw: true });
  assert.equal(itapf.shouldHide(card, { hideNsfw: false, hidePortraits: false }), false);
  assert.equal(itapf.shouldHide(card, { hideNsfw: true, hidePortraits: false }), true);
  assert.equal(itapf.shouldHide(card, { hideNsfw: false, hidePortraits: true }), true);
  assert.equal(itapf.shouldHide(card, { hideNsfw: true, hidePortraits: true }), true);
});

test("filters new cards and restores cards when settings change", () => {
  const plain = new FakeCard({ subreddit: "itookapicture" });
  const portrait = new FakeCard({ subreddit: "itookapicture", title: "Photo [Portrait]" });

  itapf.filterPosts([plain], itapf.DEFAULTS, "/r/all/");
  assert.equal(plain.hidden, false);

  itapf.filterPosts([plain, portrait], itapf.DEFAULTS, "/r/all/");
  assert.equal(portrait.hidden, true);

  itapf.filterPosts([plain, portrait], { hideNsfw: true, hidePortraits: false }, "/r/all/");
  assert.equal(portrait.hidden, false);
});

test("rechecks cards when subreddit metadata appears later", () => {
  const card = new FakeCard({ title: "Photo [Portrait]" });
  itapf.filterPosts([card], itapf.DEFAULTS, "/");
  assert.equal(card.hidden, false);

  card.attributes["subreddit-prefixed-name"] = "r/itookapicture";
  itapf.filterPosts([card], itapf.DEFAULTS, "/");
  assert.equal(card.hidden, true);
});

test("leaves direct post pages visible", () => {
  const card = new FakeCard({ subreddit: "itookapicture", nsfw: true });
  itapf.filterPosts([card], itapf.DEFAULTS, "/r/all/");
  assert.equal(card.hidden, true);

  itapf.filterPosts([card], itapf.DEFAULTS, "/r/itookapicture/comments/abc/title/");
  assert.equal(card.hidden, false);
  assert.equal(itapf.DIRECT_POST.test("/comments/abc/title/"), true);
  assert.equal(itapf.DIRECT_POST.test("/user/name/comments/"), false);
});

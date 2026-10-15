<p align="center">
  <img src="icons/icon-128.png" width="96" alt="ITAPF icon">
</p>

# ITAPF — r/itookapicture Filter

ITAPF is a small browser extension that hides selected posts from the r/itookapicture subreddit:

- **NSFW** posts.
- **Portrait** posts.

This extension is aimed at users of the subreddit who otherwise enjoy the regular photography content but have no interest in being exposed to these types of posts.

Both filters start enabled. The extension works on current and old Reddit, remembers your choices locally, and does not collect data.

## Install

- [Chrome Web Store](https://chromewebstore.google.com/detail/itapf-%E2%80%94-ritookapicture-fi/ahkgpodnppkbabnpoffgmkpmkkflohjb)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/itapf-r-itookapicture-filter/)

## Manual install

Download the Chrome or Firefox package from the repository's [latest release](../../releases/latest).

- Chrome: unzip the Chrome package, open `chrome://extensions`, enable developer mode, click **Load unpacked**, and select the unzipped folder.
- Firefox testing: open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `manifest.json` from the Firefox package. Public Firefox installations require a version signed by Mozilla.

## Build it locally

Run `npm run package`, then:

- In Chrome, open `chrome://extensions`, enable developer mode, click **Load unpacked**, and select `dist/chrome`.
- In Firefox, open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `dist/firefox/manifest.json`.

## Development

There are no runtime dependencies. Run `npm test` for the tests, `npm run package` for the two store ZIPs in `dist/`, and `npm run check:packages` to check their contents. `npm run lint:firefox` runs Mozilla's package linter after the packages are built.

Most of the extension is in `src/content.js`. It watches Reddit feeds, checks each post, and adds or removes one CSS class. Direct post pages stay accessible. Filtering happens after Reddit creates a post card, so an image may already have downloaded or appeared briefly.

Small fixes and bug reports are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request and [SECURITY.md](SECURITY.md) for private vulnerability reports.

## Permissions

- `storage`: remembers the two filter choices locally.
- Access to `https://*.reddit.com/*`: reads visible Reddit post cards and hides matching r/itookapicture posts.

## Releasing

1. Update the version in both manifests, run `npm test`, `npm run package`, `npm run check:packages`, and `npm run lint:firefox`, then try both builds on current and old Reddit.
2. Commit the changes and push them to GitHub.
3. On GitHub, create a release targeting that commit with a matching tag such as `v1.0.2`.
4. Publish the release. GitHub Actions will build and attach both browser packages.

Draft releases do not trigger the build until they are published. Store description text is kept in [STORE_LISTING.md](STORE_LISTING.md).

## License

ITAPF is available under the [MIT License](LICENSE). The source and custom artwork are covered by the same license.

ITAPF is an independent project and is not affiliated with or endorsed by Reddit.

See [PRIVACY.md](PRIVACY.md) for the privacy statement.

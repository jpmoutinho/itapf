<p align="center">
  <img src="icons/icon-128.png" width="96" alt="ITAPF icon">
</p>

# ITAPF — r/itookapicture Filter

ITAPF is a small browser extension that hides selected posts from r/itookapicture:

- **NSFW** posts.
- **Portrait** posts.

Both filters start enabled. The extension works on current and old Reddit, remembers your choices locally, and does not collect data.

## Install

Download the Chrome or Firefox package from the repository's [latest release](../../releases/latest).

- Chrome: unzip the Chrome package, open `chrome://extensions`, enable developer mode, click **Load unpacked**, and select the unzipped folder.
- Firefox testing: open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `manifest.json` from the Firefox package. Public Firefox installations require a version signed by Mozilla.

## Build it locally

Run `npm run package`, then:

- In Chrome, open `chrome://extensions`, enable developer mode, click **Load unpacked**, and select `dist/chrome`.
- In Firefox, open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `dist/firefox/manifest.json`.

## Development

There are no runtime dependencies. Run `npm test` for the tests and `npm run package` for the two store ZIPs in `dist/`.

Most of the extension is in `src/content.js`. It watches Reddit feeds, checks each post, and adds or removes one CSS class. Direct post pages stay accessible. Filtering happens after Reddit creates a post card, so an image may already have downloaded or appeared briefly.

Small fixes and bug reports are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request and [SECURITY.md](SECURITY.md) for private vulnerability reports.

## Permissions

- `storage`: remembers the two filter choices locally.
- Access to `https://*.reddit.com/*`: reads visible Reddit post cards and hides matching r/itookapicture posts.

## Releasing

1. Update the version in both manifests.
2. Run `npm test` and `npm run package`.
3. Try both builds on current and old Reddit.
4. Commit the change and push a matching tag such as `v1.0.0`.

GitHub Actions checks both packages and attaches them to a GitHub Release. Store description text is kept in [STORE_LISTING.md](STORE_LISTING.md).

## License

ITAPF is available under the [MIT License](LICENSE). The source and custom artwork are covered by the same license.

ITAPF is an independent project and is not affiliated with or endorsed by Reddit.

See [PRIVACY.md](PRIVACY.md) for the privacy statement.

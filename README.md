# Micah Samuel — Portfolio

A responsive, dark portfolio for ERP implementation, WMS delivery and systems integration. Static HTML, CSS and vanilla JavaScript; no build dependencies.

## Run locally

```bash
python -m http.server 8000
```

Open http://localhost:8000. Use a local HTTP server rather than opening the HTML as a file.

## Contact form

Create a form at https://web3forms.com/ and enter your receiving address only on the provider's website. Verify your address, then copy the public form access key into `web3formsAccessKey` in `config.js`. The destination address must never be stored in this project.

The access key is a public form identifier, not a secret credential. Never include provider login credentials, private API tokens or inbox addresses. See https://docs.web3forms.com/getting-started/faq.

The form has validation, a honeypot, pending/success/error states, a timeout and duplicate-submit protection. Until a key is configured it reports unavailability and sends nothing. A honeypot is a basic spam filter, not a guarantee; Web3Forms handles server-side filtering.

## Publish

See [DEPLOYMENT.md](DEPLOYMENT.md) for exact GitHub CLI commands. `.github/workflows/pages.yml` publishes on pushes to `main`. Only `index.html`, `styles.css`, `script.js`, `config.js`, `.nojekyll` and `assets/` are deployed.

## Edit

- Content, dates and navigation: `index.html`.
- Colours, spacing and responsive layout: `styles.css`.
- Animation and form behaviour: `script.js`.
- Public form identifier: `config.js`.
- Images and favicon: `assets/`.

The portrait is optimized, has fixed dimensions and is lazy-loaded. Inter is loaded from Google Fonts with system font fallbacks. Motion responds to the operating system's reduced-motion preference.

To add a counter later, use an element with `data-count-to="25"`, `data-count-suffix="+"` and a final text value of `25+`; only add verified figures. Optional `data-count-decimals` controls precision. Use a static descriptive label outside the animated element; do not add an aria-live announcement to each frame.

## Before each update

1. Preview at mobile and desktop widths and check keyboard focus.
2. Check the form with a real authorized test after configuring the provider.
3. Search public files and Git history for personal addresses and `mailto:`.
4. Commit and push; confirm the Pages workflow succeeds.
5. Audit the live site with Lighthouse (mobile and desktop).

No analytics, visitor storage or personal inbox address is included. Contact submissions pass through Web3Forms; Google Fonts receives font requests. Performance scores depend on the deployed environment and should be measured after publication.

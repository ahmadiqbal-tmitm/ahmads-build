# .github.io
Ahmad Iqbal’s personal site. Building one AI agent a week, in public. Live at ahmads.build.

## Agent subdomain pages

Each agent has its own page on a subdomain, such as `salesagent.ahmads.build`, served from that agent's repository. Every one of them must use the shared styles from this site, so they stay in step with ahmads.build.

**Start from the template:** copy `_templates/agent-page/index.html` into the agent's repository and replace everything in CAPITALS. Folders starting with `_` are not published on ahmads.build.

**Every agent page must have:**

- Both stylesheets, in this order:
  ```html
  <link rel="stylesheet" href="https://ahmads.build/assets/brand.css?v=aa751892">
  <link rel="stylesheet" href="https://ahmads.build/assets/agent-page.css?v=1">
  ```
- The fonts link from the template (Bricolage Grotesque, Source Serif 4, IBM Plex Mono, Instrument Serif).
- `<body class="agent-page">`.
- The black `banner` header, the four explore cards and the `site-footer` from the template, with links pointing to `https://ahmads.build/`.
- Its avatar at `https://ahmads.build/images/agents/<agent>.png`: 256×256, halftone, in the homepage cheetah and owl style.

**Type rules** (set by `assets/agent-page.css`): body text is Source Serif 4 at regular weight. Only headings, labels and buttons are bold, in Bricolage Grotesque.

When `brand.css` or `agent-page.css` changes, bump its `?v=` value on every agent page so browsers fetch the new version.

Current agent pages:

| Agent | Address | Repository |
|---|---|---|
| Chief of staff | chiefofstaff.ahmads.build | chief-of-staff (GitHub Pages) |
| Advisory council | advisorycouncil.ahmads.build | advisory-council (Cloudflare Worker: redeploy after merging) |
| Sales agent | salesagent.ahmads.build | sales-agent (GitHub Pages) |

# Prototype Hub

Static HTML prototypes from the LevelAll content team, published via GitHub Pages.

## Live URL

After GitHub Pages is enabled, the site lives at:

`https://YOUR-GITHUB-USERNAME.github.io/prototype-hub/`

## Adding a new prototype

1. In your file manager, make a new folder under `prototypes/` named with kebab-case
   (e.g. `prototypes/investment-growth/`).
2. Add an `index.html` file inside it. That's the prototype.
3. Open the root `index.html` (the landing page) in a text editor and add a new
   `<article class="entry">` block linking to your prototype. Easiest way: copy
   the existing block and edit the title, link, and description.
4. Commit and push (or run `publish.command` to do both at once).
5. Wait ~60 seconds. The new prototype is live.

## Conventions

- One folder per prototype. Use kebab-case names (no spaces, no caps).
- Each folder must have an `index.html` — it's the entrypoint.
- External CDN imports (Tailwind, React, Chart.js, etc.) work fine in the browser.
- Keep prototypes self-contained — don't try to share CSS or JS across folders.

## Folder structure

```
prototype-hub/
├── index.html                          ← landing page (the hub)
├── README.md
├── publish.command                     ← double-click to publish (Mac)
├── publish.bat                         ← double-click to publish (Windows)
└── prototypes/
    └── college-cost-calc/
        └── index.html                  ← lives at /prototype-hub/prototypes/college-cost-calc/
```

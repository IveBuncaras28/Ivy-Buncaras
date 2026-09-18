# Ivy B. Buncaras — Personal Portfolio (multi-page)

## Files

```
index.html         Home page (hero + intro)
about.html          About page
projects.html       Projects page (filterable cards)
research.html       Research & preprints page
contact.html        Contact page
assets/style.css    Shared styling for every page
assets/script.js    Shared behavior (nav highlight, filters, reveal animation) + your content
assets/ivy.png      Portrait (background removed)
```

No build step, no dependencies. Open `index.html` in a browser to preview — the whole
`msite`/`site` folder must stay together (don't move index.html out on its own; it needs
`assets/` right next to it).

## Publish on GitHub Pages

1. Create a repo named `YOUR-USERNAME.github.io` (or any name — see note below).
2. Upload everything in this folder (all five `.html` files + the `assets` folder) to it.
3. Settings → Pages → Source: Deploy from a branch → `main` → `/ (root)` → Save.
4. Live at `https://YOUR-USERNAME.github.io` (or `.../repo-name/` for a non-default repo name).

## Editing your content

Open `assets/script.js` — the `PROJECTS`, `RESEARCH`, and `SOCIAL` arrays near the top are
the only things you need to touch. They're shared by every page, so one edit updates the
whole site. Anything left as `url:"#"` shows as a non-clickable placeholder.

To change the portrait, replace `assets/ivy.png` with your own image of the same name.
To change wording, colors, or layout, edit the relevant `.html` file or `assets/style.css`.

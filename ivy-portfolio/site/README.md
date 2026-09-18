# Ivy B. Buncaras — Personal Portfolio

A single-page portfolio site: elegant navy-and-gold design, filterable project cards,
scroll animations, sticky navigation, responsive layout, and automatic light/dark support.

## Files

```
index.html        the entire site (HTML + CSS + JS in one file)
assets/ivy.png    portrait used in the hero section
```

No build step, no dependencies. Open `index.html` in a browser to preview locally.

## Publish it on GitHub Pages

1. Create a new repository on GitHub named **ivybuncaras.github.io**
   (use your exact GitHub username in place of `ivybuncaras`).
2. Upload `index.html`, the `assets` folder, and this README — or from the terminal:

   ```bash
   git init
   git add .
   git commit -m "Personal portfolio site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git
   git push -u origin main
   ```

3. In the repository, go to **Settings → Pages**, set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`, and save.
4. After a minute the site is live at **https://YOUR-USERNAME.github.io**

If you prefer a repo with a different name (e.g. `portfolio`), the same steps work and the
site will live at `https://YOUR-USERNAME.github.io/portfolio/`.

## Editing your content

Everything you need to change sits in one block near the bottom of `index.html`,
marked `===== EDIT YOUR CONTENT HERE =====`:

- `PROJECTS` — one entry per project. `t` title, `c` category (drives the filter buttons),
  `d` description, `tags` the small gold chips, `url` the GitHub repo link.
- `RESEARCH` — one entry per paper. `v` is the venue label (ResearchGate, SSRN, etc.),
  `url` the direct link to the paper.
- `SOCIAL` — the links in the footer. Use `mailto:you@example.com` for Email.

Any `url` left as `"#"` renders as a non-clickable placeholder, so replace them as your
links become available.

To change the portrait, replace `assets/ivy.png` with your own image of the same name.

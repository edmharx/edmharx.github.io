# Portfolio: Edmharx Macasinag

Plain HTML, CSS and JavaScript. No build step, nothing to install: the files in this folder are the website.

```
index.html            the whole page, top to bottom (hero, Homelab, Break the build, How a change ships,
                      Learning log, Projects, Where I work and study, Toolbox, About, Contact, footer)
css/site.css          the foundation: colour/size tokens, reset, and every working part
                      (pipeline card, Break the build lab, log tabs, charts, contact field, toolbox rows)
css/aurora.css        the layout: portrait hero, full-width chapters, the frost and pine colour fields
js/site.js            the live parts: pipeline replay, Break the build, copy buttons, log tabs,
                      charts drawing on scroll, the drill video, the email form, the Manila clock
assets/img/           me.jpg (portrait), hero-racks.jpg (hero background), SENSE-LoRa renders
assets/logos/         tool logos (Simple Icons, CC0), PUP seal, TradeWindow logo
assets/video/         the SENSE-LoRa drill clip and its poster frame
assets/credits.json   where every outside picture/logo came from, and its licence
```

The folders starting with a dot (`.claude`, `.agents`, `.codex`, `.impeccable`, `.taste-skill`) and
`skills-lock.json` are design tooling used while building, not part of the website.

## Preview locally

```fish
cd ~/projects/edmharx.github.io
python3 -m http.server 8000 --bind 127.0.0.1
# open http://127.0.0.1:8000
```

## Change things

- **Colours:** the tokens at the top of `css/site.css` (`--bg`, `--ink`, `--accent`, `--frost`, …).
  The two colour fields are in `css/aurora.css`: `.chapter-field` (frost) and `.chapter-contact` (pine).
- **Your photo:** replace `assets/img/me.jpg` (4:5 portrait, about 960 × 1200).
- **Add a project:** in `index.html`, copy one `<article class="s-proj c-wide"> … </article>` block in
  the Projects section, then change its name, tags, text and `<figure>`.
- **Add a tool:** copy one `<li>` in a `.tools` list; logos come from https://simpleicons.org
  (download the SVG into `assets/logos/` and add `fill="#d8dee9"` to its `<svg>` tag).
- **Update the learning log:** each day is an `<ol class="day">` with a matching tab button.
  `git --no-pager log --format='%ad|%s' --date=format-local:'%m-%d %H:%M'` in `~/homelab` prints the
  real commit times and messages.

## Credits

Tool logos: Simple Icons (CC0; the brands are their owners' trademarks). PUP seal: public domain,
Wikimedia Commons. Hero background: "NOIRLab HQ Server Racks" by NOIRLab/NSF/AURA/T. Slovinský,
CC BY 4.0, softened and darkened. All listed in `assets/credits.json` and in the page footer.

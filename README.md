# flywheel-theme

**Living spec / showcase: https://theflywheel.github.io/flywheel-theme/**

The mono/green design language extracted from the DeDi Node pages
(dedi.proto.theflywheel.in) and the schemes demo (schemes.proto.theflywheel.in):
monospace everything, paper ground, deep-green accent, hairline borders.

One CSS file. **Plain markdown output needs no classes** — headings, paragraphs,
links, lists, tables, code blocks, blockquotes, hr, images are all styled at the
element level, so any markdown-rendering blog gets the look by just loading the
stylesheet. Classes are additive extras.

## Use

```html
<link rel="stylesheet" href="flywheel.css">
```

- Reading pages (blog posts): nothing else to do — `body` is a 46em measure.
- App-like pages: `<body class="wide">` (68em) or `class="brief"` (76em).
- Dark mode: automatic via `prefers-color-scheme`; force with
  `<html data-theme="dark">` (or `"light"`). Or include `theme.js`: a small
  toggle appears at the top right, the choice persists in localStorage, and it
  wires up your own element if one has `class="theme-toggle"`.
- All colors are `--fw-*` custom properties on `:root`; override them to
  re-skin without touching component rules.

## Components (raw HTML, drop into markdown where needed)

| Class | What | Example |
|---|---|---|
| `.eyebrow` | uppercase green section label | `<p class="eyebrow">01 · System</p>` |
| `.mut` | muted secondary text (body size) | `<span class="mut">optional</span>` |
| `.sub` / `small` / `figcaption` | subtext tier: 0.85em + muted | `<p class="sub">3,289 results in 0.42s</p>` |
| `figure` + `figcaption` | image with caption: hairline frame, subtext caption | `<figure><img …><figcaption>…</figcaption></figure>` |
| `.thesis` | lede paragraph under a title | `<p class="thesis">…</p>` |
| `.badge` | small green chip | `<span class="badge">Beckn 2.0.0</span>` |
| `.tag` | neutral taxonomy chip | `<span class="tag">pension</span>` |
| `.card` | bordered panel | `<div class="card"><h3>…</h3><p>…</p></div>` |
| `.grid` | responsive card grid | `<div class="grid"><div class="card">…</div>…</div>` |
| `.cols2` | 50/50 two-column, stacks < 820px | `<div class="cols2">…</div>` |
| `.ok` / `.no` | status text (semantic, not accent) | `<span class="ok">verified</span>` |
| `.proof` | left-rail aside (verification results) | `<div class="proof">…</div>` |
| `.searchbar` | input + select + button row, equal heights | see index.html |
| `.autogrow` | WhatsApp-style growing textarea | `<textarea class="autogrow" rows="1">` + `autogrow.js` |
| `.json` | scrolling JSON viewer | pair with `hljson.js` |
| `.theme-toggle` | light/dark switch, fixed top right | include `theme.js`; auto-inserted, persists in localStorage |
| `.copy-btn` | copy button on every code block | include `copy.js`; terminal blocks copy only the command lines |
| `nav` | element, not class — inline top nav | `<nav><a href="/">Home</a></nav>` |

Form controls (`input`, `textarea`, `select`, `button`) are normalized at the
element level too: shared padding/line-height so mixed rows sit at equal
heights, squared corners, hairline borders, accent focus ring. Links and `nav`
are likewise element-level — bare markdown links and a bare `<nav>` get the
site treatment with no classes.

`hljson.js` is the dependency-free JSON highlighter from the demo page:
`el.innerHTML = hljson(obj)` inside an element with `class="json"`.

## OG images

An opinionated social card in the theme's language (accent bar, eyebrow, mono
title, muted sub, domain footer). One design; only the text changes:

```sh
$ og/generate.sh "Post title" "field notes · registries" "One-line description." "yourdomain.in" og.png
```

Renders `og/template.html` to a 1200x630 PNG with headless Chrome — no Node,
no service. Then the usual tags:

```html
<meta property="og:image" content="https://yourdomain.in/og/post-slug.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
```

The card is always light — link previews don't theme-switch. The
[showcase](https://theflywheel.github.io/flywheel-theme/) displays its own
card as the figure example.

## Diagrams (mermaid)

`pre.mermaid` renders diagrams on schematic paper — a white panel in **both**
themes, so mermaid's `neutral` theme stays legible and nothing re-renders on
theme toggle. The library itself is not bundled; load it and init:

```html
<pre class="mermaid">
sequenceDiagram
    A->>B: request
    B-->>A: response
</pre>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({
    startOnLoad: true, theme: 'neutral', securityLevel: 'strict',
    themeVariables: { fontFamily: 'ui-monospace, SF Mono, Menlo, Consolas, monospace', fontSize: '13px' },
    sequence: { actorFontSize: 13, messageFontSize: 13, noteFontSize: 13 }
  });
</script>
```

The `themeVariables` matter: mermaid's default is 16px in its own font, which looks
inflated next to the 13px mono page — pass the theme's stack and size.

## Code blocks

Shell sessions render as a terminal — prompt, command, and output each get a
role color, themed with the page (tinted paper in light mode, near-black in
dark). **`term.js` does this automatically**: it
targets markdown ```sh/bash/shell/console fences (the `language-*` classes
renderers emit) and `pre[data-lang="sh"]`. Lines starting with `$ ` become
prompt + command, everything else is output, and a trailing ` # comment` is
dimmed. Idempotent; auto-runs on load; call `termify(container)` after
inserting blocks dynamically. No hand-written spans needed — write the fence:

    ```sh
    $ curl -s https://dedi.proto.theflywheel.in/dedi/log/checkpoint
    dedi.proto.theflywheel.in/log   # origin
    ```


- `pre[data-lang="go"]` shows a muted language label in the block's corner.
- The stylesheet maps the token classes emitted by **highlight.js**, **Prism**,
  and **Hugo/Chroma** onto the theme palette (comments muted-italic, keywords
  accent, strings/numbers/functions in the token colors) — so whichever
  highlighter the blog uses, code picks up the theme's flavour with no extra
  stylesheet or JS from this kit.

## Typography

The type system is the theme — reuse these rules even outside the stylesheet:

- **One stack everywhere** (display, body, code, UI):
  `ui-monospace, "SF Mono", Menlo, Consolas, monospace`. No webfonts, no FOUT,
  and code samples sit flush with prose.
- **13px base** (`--fw-size`). The live sites declare bare `font-family:
  monospace`, which makes browsers use their default *fixed* font size (13px);
  naming real fonts disables that quirk, so the theme sets the size explicitly
  to render identically. Bump `--fw-size` to 14px if 13 feels small on the blog.
- **Quiet scale**: h1 `1.3em` (−0.02em tracking), h2 `1.05em`, h3 `0.95em`,
  body `1em/1.55`. Hierarchy comes from spacing (`h2 { margin: 1.6em 0 .4em }`)
  and eyebrows, not size jumps.
- **Eyebrow**: `0.72em`, uppercase, `+0.14em` tracking, accent color — the one
  loud typographic gesture, used once per section.
- **Measure**: `46em` for reading (blog default), `68em`/`76em` (`.wide`,
  `.brief`) for app-like pages. Never full-bleed text.
- **Tabular numerals** (`font-variant-numeric: tabular-nums`) wherever digits
  align — table cells get it automatically.

## Spacing & shape

- Squared corners on controls (radius 0), 3–4px radius on chips/panels only.
- Hairline borders (`--fw-line`) do the separating; backgrounds stay quiet.
- Semantic green (`.ok`) is distinct from the accent green: the accent is
  identity, `.ok`/`.no` are state.

`index.html` is the living spec — every element and component on one page.

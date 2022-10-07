# micromark-extension-math

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[micromark][] extension to support math (`$C_L$`).

## Contents

*   [What is this?](#what-is-this)
*   [When to use this](#when-to-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`math(options?)`](#mathoptions)
    *   [`mathHtml(htmlOptions?)`](#mathhtmlhtmloptions)
*   [Authoring](#authoring)
*   [HTML](#html)
*   [CSS](#css)
*   [Syntax](#syntax)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package contains extensions that add support for math.

As there is no spec for math in markdown, this extension follows how code
(fenced and text) works in Commonmark, but uses dollars.

## When to use this

These tools are all low-level.
In many cases, you want to use [`remark-math`][plugin] with remark instead.

When you do want to use `micromark`, you can use this.
When working with `mdast-util-from-markdown`, you must combine this package
with [`mdast-util-math`][util].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

[npm][]:

```sh
npm install micromark-extension-math
```

In Deno with [`esm.sh`][esmsh]:

```js
import {math, mathHtml} from 'https://esm.sh/micromark-extension-math@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {math, mathHtml} from 'https://esm.sh/micromark-extension-math@2?bundle'
</script>
```

## Use

Say our document `example.md` contains:

```markdown
Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following equation.

$$
L = \frac{1}{2} \rho v^2 S C_L
$$
```

…and our module `example.js` looks as follows:

```js
import fs from 'node:fs/promises'
import {micromark} from 'micromark'
import {math, mathHtml} from 'micromark-extension-math'

const output = micromark(await fs.readFile('example.md'), {
  extensions: [math()],
  htmlExtensions: [mathHtml()]
})

console.log(output)
```

…now running `node example.js` yields (abbreviated):

```html
<p>Lift(<span class="math math-inline"><span class="katex">…</span></span>) like the following equation.</p>
<div class="math math-display"><span class="katex-display"><span class="katex">…</span></div>
```

## API

This package exports the identifiers `math` and `mathHtml`.
There is no default export.

The export map supports the endorsed [`development` condition][condition].
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `math(options?)`

Add support for parsing math in markdown.

Function that can be called to get a syntax extension for micromark (passed
in `extensions`).

##### `options`

Configuration (optional).

###### `options.singleDollarTextMath`

Whether to support math (text) with a single dollar (`boolean`, default:
`true`).
Single dollars work in Pandoc and many other places, but often interfere with
“normal” dollars in text.

### `mathHtml(htmlOptions?)`

Add support for turning math in markdown to HTML with [KaTeX][].

Function that can be called to get an HTML extension for micromark (passed in
`htmlExtensions`).

##### `htmlOptions`

Configuration (optional).

Passed to [`katex.renderToString`][katex-options].
`displayMode` is overwritten by this plugin, to `false` for math in text, and
`true` for math in flow.
Everything else can be passed.

## Authoring

When authoring markdown with math, keep in mind that math doesn’t work in most
places.
Notably, GitHub currently has a really weird crappy regex-based thing.
But on your own (math-heavy?) site it can be great!

## HTML

Math does not relate to HTML elements.
MathML, which is sort of like SVG but for math, exists but it doesn’t work well
and isn’t widely supported.
Instead, this uses [KaTeX][], which generates MathML as a fallback but also
generates a bunch of divs and spans so math look pretty.

## CSS

The HTML produced by KaTeX requires CSS to render correctly.
You should use `katex.css` somewhere on the page where the math is shown to
style it properly.
At the time of writing, the last version is:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
```

## Syntax

Math forms with, roughly, the following BNF:

```bnf
; Restriction: the number of markers in the closing fence sequence must be
; equal to or greater than the number of markers in the opening fence
; sequence.
math_flow ::= fence_open *( eol *line ) [ eol fence_close ]
; Restriction: the number of markers in the closing sequence must equal the
; number of markers in the opening sequence.
math_text ::= 1*'$' 1*code 1*'$'

fence_open ::= 2*'$' [ 1*space_or_tab meta ] *space_or_tab
fence_close ::= 2*'$' *space_or_tab
meta ::= 1*(code - eol - space_or_tab - '$') *( *space_or_tab 1*text )

eol ::= '\r' | '\r\n' | '\n'
space_or_tab ::= ' ' | '\t'
line ::= . - eol ; any unicode code point
```

## Types

This package is fully typed with [TypeScript][].
It exports the additional types `Options` and `HtmlOptions`.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
It also works in Deno and modern browsers.

## Security

This package is safe assuming that you trust KaTeX.
Any vulnerability in it could open you to a [cross-site scripting (XSS)][xss]
attack.

## Related

*   [`remarkjs/remark-math`][plugin]
    — remark (and rehype) plugins to support math
*   [`syntax-tree/mdast-util-math`][util]
    — mdast utility to support math

## Contribute

See [`contributing.md` in `micromark/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/micromark/micromark-extension-math/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-math/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-math.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-math

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-math.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-math

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-math.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-math

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[npm]: https://docs.npmjs.com/cli/install

[esmsh]: https://esm.sh

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/main/contributing.md

[support]: https://github.com/micromark/.github/blob/main/support.md

[coc]: https://github.com/micromark/.github/blob/main/code-of-conduct.md

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[condition]: https://nodejs.org/api/packages.html#packages_resolving_user_conditions

[micromark]: https://github.com/micromark/micromark

[plugin]: https://github.com/remarkjs/remark-math

[util]: https://github.com/syntax-tree/mdast-util-math

[katex]: https://katex.org

[katex-options]: https://katex.org/docs/options.html

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

import assert from 'node:assert/strict'
import test from 'node:test'
import katex from 'katex'
import {micromark} from 'micromark'
import {math as syntax, mathHtml as html} from 'micromark-extension-math'

/** @type {import('katex')['default']['renderToString']} */
// @ts-expect-error: types are incorrect.
const renderToString = katex.renderToString

test('core', async () => {
  assert.deepEqual(
    Object.keys(await import('micromark-extension-math')).sort(),
    ['math', 'mathHtml'],
    'should expose the public api'
  )
})

test('markdown -> html (micromark)', () => {
  assert.equal(
    micromark('$a$, $$b$$, $$$c$$$', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p><span class="math math-inline">' +
      renderToString('a') +
      '</span>, <span class="math math-inline">' +
      renderToString('b') +
      '</span>, <span class="math math-inline">' +
      renderToString('c') +
      '</span></p>',
    'should support one, two, or more dollars by default'
  )

  assert.equal(
    micromark('$a$, $$b$$, $$$c$$$', {
      extensions: [syntax({singleDollarTextMath: false})],
      htmlExtensions: [html()]
    }),
    '<p>$a$, <span class="math math-inline">' +
      renderToString('b') +
      '</span>, <span class="math math-inline">' +
      renderToString('c') +
      '</span></p>',
    'should support two or more dollars w/ `singleDollarTextMath: false`, but not one'
  )

  assert.equal(
    micromark('a \\$b$', {extensions: [syntax()], htmlExtensions: [html()]}),
    '<p>a $b$</p>',
    'should support an escaped dollar sign which would otherwise open math'
  )

  assert.throws(
    () => {
      micromark('a $b\\$', {extensions: [syntax()], htmlExtensions: [html()]})
    },
    /KaTeX parse error: Unexpected character: '\\' at position 2/,
    'should not support escaped dollar signs in math (text)'
  )

  assert.equal(
    micromark('a \\$$b$', {extensions: [syntax()], htmlExtensions: [html()]}),
    '<p>a $<span class="math math-inline">' +
      renderToString('b') +
      '</span></p>',
    'should support math (text) right after an escaped dollar sign'
  )

  assert.throws(
    () => {
      micromark('a $$ $ $$', {extensions: [syntax()], htmlExtensions: [html()]})
    },
    /KaTeX parse error: Can't use function '\$' in math mode at position 1/,
    'should support a single dollar in math (text) w/ padding and two dollar signs'
  )

  assert.equal(
    micromark('a $$\\raisebox{0.25em}{$\\frac a b$}$$ b', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      renderToString('\\raisebox{0.25em}{$\\frac a b$}') +
      '</span> b</p>',
    'should support nested math by using more dollars outside of math (text)'
  )

  assert.equal(
    micromark('a $$ \\$ $$ b', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      renderToString('\\$') +
      '</span> b</p>',
    'should support an “escaped” dollar right on the KaTeX level, not on the Markdown level'
  )

  assert.equal(
    micromark('a $$\na\\$ $$ b', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      renderToString('a\\$') +
      '</span> b</p>',
    'should support padding with a line ending in math (text)'
  )

  assert.equal(
    micromark('a $b$', {extensions: [syntax()], htmlExtensions: [html()]}),
    '<p>a <span class="math math-inline">' +
      renderToString('b') +
      '</span></p>',
    'should support math (text) w/ one dollar sign'
  )

  assert.equal(
    micromark('a $$b$$', {extensions: [syntax()], htmlExtensions: [html()]}),
    '<p>a <span class="math math-inline">' +
      renderToString('b') +
      '</span></p>',
    'should support math (text) w/ two dollar signs'
  )

  assert.equal(
    micromark('a $$$b$$$', {extensions: [syntax()], htmlExtensions: [html()]}),
    '<p>a <span class="math math-inline">' +
      renderToString('b') +
      '</span></p>',
    'should support math (text) w/ three dollar signs'
  )

  assert.equal(
    micromark('a $b\nc\rd\r\ne$ f', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      renderToString('b\nc\rd\r\ne') +
      '</span> f</p>',
    'should support EOLs in math'
  )

  assert.equal(
    micromark('$\na\n$', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p><span class="math math-inline">' + renderToString('a') + '</span></p>',
    'should not support math (flow) w/ one dollar sign'
  )

  assert.equal(
    micromark('$$\na\n$$', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      renderToString('a', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/ two dollar sign'
  )

  assert.equal(
    micromark('$$$\na\n$$$', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      renderToString('a', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/ three dollar sign'
  )

  assert.equal(
    micromark('$$\n$$', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      renderToString('', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/o content'
  )

  assert.equal(
    micromark('$$\na', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      renderToString('a', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/o closing fence'
  )

  assert.equal(
    micromark('$$\na\n', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      renderToString('a', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/o closing fence ending at an EOL'
  )

  assert.equal(
    micromark('$$asd &amp; \\& asd\na\n$$', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      renderToString('a', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/ a meta string'
  )

  assert.equal(
    micromark('$$asd$asd\na\n$$', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>$$asd$asd\na</p>\n<div class="math math-display">' +
      renderToString('', {displayMode: true}) +
      '</div>',
    'should not support math (flow) w/ a dollar sign in the meta string'
  )

  assert.throws(
    () => {
      micromark('$$\na\n$$ b', {
        extensions: [syntax()],
        htmlExtensions: [html()]
      })
    },
    /KaTeX parse error: Can't use function '\$' in math mode at position 3/,
    'should not support math (flow) w/ content on the closing fence'
  )

  assert.equal(
    micromark('$$\na\n$$  ', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      renderToString('a', {displayMode: true}) +
      '</div>',
    'should support whitespace on the closing fence'
  )

  assert.equal(
    micromark('  $$\n\ta\n  b\n c\nd\n$$', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      renderToString('  a\nb\nc\nd', {displayMode: true}) +
      '</div>',
    'should strip the prefix of the opening fence from content lines'
  )

  assert.equal(
    micromark('      $$\n      a\n          $$', {
      extensions: [syntax(), {disable: {null: ['codeIndented']}}],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      renderToString('a', {displayMode: true}) +
      '</div>',
    'should strip arbitrary length prefix from closing fence line (codeIndented disabled)'
  )

  assert.equal(
    micromark('> $$\n> a\n> $$\n> b', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<blockquote>\n' +
      '<div class="math math-display">' +
      renderToString('a', {displayMode: true}) +
      '</div>\n' +
      '<p>b</p>\n' +
      '</blockquote>',
    'should support math (flow) in a block quote'
  )

  assert.equal(
    micromark('* $$\n  a\n  $$\n  b', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<ul>\n' +
      '<li>\n' +
      '<div class="math math-display">' +
      renderToString('a', {displayMode: true}) +
      '</div>\n' +
      'b' +
      '</li>\n' +
      '</ul>',
    'should support math (flow) in a list (item)'
  )

  assert.equal(
    micromark('a $\\sum_{\\substack{0<i<m\\\\0<j<n}}$ b', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      renderToString('\\sum_{\\substack{0<i<m\\\\0<j<n}}') +
      '</span> b</p>',
    'should support `<`'
  )

  assert.equal(
    micromark('a $\\text{a \\"{a} c}$ b', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      renderToString('\\text{a \\"{a} c}') +
      '</span> b</p>',
    'should support `"`'
  )

  assert.equal(
    micromark('a $$ $ $$', {
      extensions: [syntax()],
      htmlExtensions: [html({throwOnError: false})]
    }),
    '<p>a <span class="math math-inline"><span class="katex-error" title="ParseError: KaTeX parse error: Can&#x27;t use function &#x27;$&#x27; in math mode at position 1: $̲" style="color:#cc0000">$</span></span></p>',
    'should support options'
  )

  assert.equal(
    micromark('> $$\na\n$$', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<blockquote>\n<div class="math math-display">' +
      renderToString('', {displayMode: true}) +
      '</div>\n</blockquote>\n<p>a</p>\n<div class="math math-display">' +
      renderToString('', {displayMode: true}) +
      '</div>',
    'should not support laziness (1)'
  )

  assert.equal(
    micromark('> $$\n> a\n$$', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<blockquote>\n<div class="math math-display">' +
      renderToString('a', {displayMode: true}) +
      '</div>\n</blockquote>\n<div class="math math-display">' +
      renderToString('', {displayMode: true}) +
      '</div>',
    'should not support laziness (2)'
  )

  assert.equal(
    micromark('a\n> $$', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>a</p>\n<blockquote>\n<div class="math math-display">' +
      renderToString('', {displayMode: true}) +
      '</div>\n</blockquote>',
    'should not support laziness (3)'
  )
})

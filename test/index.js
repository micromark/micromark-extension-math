import test from 'tape'
import katex from 'katex'
import {micromark} from 'micromark'
import {math as syntax, mathHtml as html} from '../dev/index.js'

test('markdown -> html (micromark)', (t) => {
  t.equal(
    micromark('a \\$b$', {extensions: [syntax], htmlExtensions: [html()]}),
    '<p>a $b$</p>',
    'should support an escaped dollar sign which would otherwise open math'
  )

  t.throws(
    () => {
      micromark('a $b\\$', {extensions: [syntax], htmlExtensions: [html()]})
    },
    /KaTeX parse error: Unexpected character: '\\' at position 2/,
    'should not support escaped dollar signs in math (text)'
  )

  t.equal(
    micromark('a \\$$b$', {extensions: [syntax], htmlExtensions: [html()]}),
    '<p>a $<span class="math math-inline">' +
      katex.renderToString('b') +
      '</span></p>',
    'should support math (text) right after an escaped dollar sign'
  )

  t.throws(
    () => {
      micromark('a $$ $ $$', {extensions: [syntax], htmlExtensions: [html()]})
    },
    /KaTeX parse error: Can't use function '\$' in math mode at position 1/,
    'should support a single dollar in math (text) w/ padding and two dollar signs'
  )

  t.equal(
    micromark('a $$\\raisebox{0.25em}{$\\frac a b$}$$ b', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      katex.renderToString('\\raisebox{0.25em}{$\\frac a b$}') +
      '</span> b</p>',
    'should support nested math by using more dollars outside of math (text)'
  )

  t.equal(
    micromark('a $$ \\$ $$ b', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      katex.renderToString('\\$') +
      '</span> b</p>',
    'should support an “escaped” dollar right on the KaTeX level, not on the Markdown level'
  )

  t.equal(
    micromark('a $$\na\\$ $$ b', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      katex.renderToString('a\\$') +
      '</span> b</p>',
    'should support padding with a line ending in math (text)'
  )

  t.equal(
    micromark('a $b$', {extensions: [syntax], htmlExtensions: [html()]}),
    '<p>a <span class="math math-inline">' +
      katex.renderToString('b') +
      '</span></p>',
    'should support math (text) w/ one dollar sign'
  )

  t.equal(
    micromark('a $$b$$', {extensions: [syntax], htmlExtensions: [html()]}),
    '<p>a <span class="math math-inline">' +
      katex.renderToString('b') +
      '</span></p>',
    'should support math (text) w/ two dollar signs'
  )

  t.equal(
    micromark('a $$$b$$$', {extensions: [syntax], htmlExtensions: [html()]}),
    '<p>a <span class="math math-inline">' +
      katex.renderToString('b') +
      '</span></p>',
    'should support math (text) w/ three dollar signs'
  )

  t.equal(
    micromark('a $b\nc\rd\r\ne$ f', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      katex.renderToString('b\nc\rd\r\ne') +
      '</span> f</p>',
    'should support EOLs in math'
  )

  t.equal(
    micromark('$\na\n$', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<p><span class="math math-inline">' +
      katex.renderToString('a') +
      '</span></p>',
    'should not support math (flow) w/ one dollar sign'
  )

  t.equal(
    micromark('$$\na\n$$', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      katex.renderToString('a', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/ two dollar sign'
  )

  t.equal(
    micromark('$$$\na\n$$$', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      katex.renderToString('a', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/ three dollar sign'
  )

  t.equal(
    micromark('$$\n$$', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      katex.renderToString('', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/o content'
  )

  t.equal(
    micromark('$$\na', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      katex.renderToString('a', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/o closing fence'
  )

  t.equal(
    micromark('$$\na\n', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      katex.renderToString('a', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/o closing fence ending at an EOL'
  )

  t.equal(
    micromark('$$asd &amp; \\& asd\na\n$$', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      katex.renderToString('a', {displayMode: true}) +
      '</div>',
    'should support math (flow) w/ a meta string'
  )

  t.equal(
    micromark('$$asd$asd\na\n$$', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<p>$$asd$asd\na</p>\n<div class="math math-display">' +
      katex.renderToString('', {displayMode: true}) +
      '</div>',
    'should not support math (flow) w/ a dollar sign in the meta string'
  )

  t.throws(
    () => {
      micromark('$$\na\n$$ b', {
        extensions: [syntax],
        htmlExtensions: [html()]
      })
    },
    /KaTeX parse error: Can't use function '\$' in math mode at position 3/,
    'should not support math (flow) w/ content on the closing fence'
  )

  t.equal(
    micromark('$$\na\n$$  ', {extensions: [syntax], htmlExtensions: [html()]}),
    '<div class="math math-display">' +
      katex.renderToString('a', {displayMode: true}) +
      '</div>',
    'should support whitespace on the closing fence'
  )

  t.equal(
    micromark('  $$\n\ta\n  b\n c\nd\n$$', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<div class="math math-display">' +
      katex.renderToString('  a\nb\nc\nd', {displayMode: true}) +
      '</div>',
    'should strip the prefix of the opening fence from content lines'
  )

  t.equal(
    micromark('> $$\n> a\n> $$\n> b', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<blockquote>\n' +
      '<div class="math math-display">' +
      katex.renderToString('a', {displayMode: true}) +
      '</div>\n' +
      '<p>b</p>\n' +
      '</blockquote>',
    'should support math (flow) in a block quote'
  )

  t.equal(
    micromark('* $$\n  a\n  $$\n  b', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<ul>\n' +
      '<li>\n' +
      '<div class="math math-display">' +
      katex.renderToString('a', {displayMode: true}) +
      '</div>\n' +
      'b' +
      '</li>\n' +
      '</ul>',
    'should support math (flow) in a list (item)'
  )

  t.equal(
    micromark('a $\\sum_{\\substack{0<i<m\\\\0<j<n}}$ b', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      katex.renderToString('\\sum_{\\substack{0<i<m\\\\0<j<n}}') +
      '</span> b</p>',
    'should support `<`'
  )

  t.equal(
    micromark('a $\\text{a \\"{a} c}$ b', {
      extensions: [syntax],
      htmlExtensions: [html()]
    }),
    '<p>a <span class="math math-inline">' +
      katex.renderToString('\\text{a \\"{a} c}') +
      '</span> b</p>',
    'should support `"`'
  )

  t.equal(
    micromark('a $$ $ $$', {
      extensions: [syntax],
      htmlExtensions: [html({throwOnError: false})]
    }),
    '<p>a <span class="math math-inline"><span class="katex-error" title="ParseError: KaTeX parse error: Can&#x27;t use function &#x27;$&#x27; in math mode at position 1: $̲" style="color:#cc0000">$</span></span></p>',
    'should support options'
  )

  t.end()
})

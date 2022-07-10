/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('./math-text').Options} Options
 */

import {codes} from 'micromark-util-symbol/codes.js'
import {mathFlow} from './math-flow.js'
import {mathText} from './math-text.js'

/**
 * Add support for parsing math in markdown.
 *
 * Function that can be called to get a syntax extension for micromark (passed
 * in `extensions`).
 *
 * @param {Options} [options]
 *   Configuration (optional).
 * @returns {Extension}
 *   Syntax extension for micromark (passed in `extensions`).
 */
export function math(options) {
  return {
    flow: {[codes.dollarSign]: mathFlow},
    text: {[codes.dollarSign]: mathText(options)}
  }
}

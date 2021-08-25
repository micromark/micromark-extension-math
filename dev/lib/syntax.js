/**
 * @typedef {import('micromark-util-types').Extension} Extension
 */

/**
 * @typedef {{}} Options
 */

import {codes} from 'micromark-util-symbol/codes.js'
import {mathFlow} from './math-flow.js'
import {mathText} from './math-text.js'

/**
 * @returns {Extension}
 */
export function math() {
  return {
    flow: {[codes.dollarSign]: mathFlow},
    text: {[codes.dollarSign]: mathText}
  }
}

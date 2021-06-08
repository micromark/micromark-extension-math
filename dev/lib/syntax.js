/**
 * @typedef {import('micromark-util-types').Extension} Extension
 */

import {codes} from 'micromark-util-symbol/codes.js'
import {mathFlow} from './math-flow.js'
import {mathText} from './math-text.js'

/** @type {Extension} */
export const math = {
  flow: {[codes.dollarSign]: mathFlow},
  text: {[codes.dollarSign]: mathText}
}

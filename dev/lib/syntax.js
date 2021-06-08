import {codes} from 'micromark-util-symbol/codes.js'
import {mathFlow} from './math-flow.js'
import {mathText} from './math-text.js'

export const math = {
  flow: {[codes.dollarSign]: mathFlow},
  text: {[codes.dollarSign]: mathText}
}

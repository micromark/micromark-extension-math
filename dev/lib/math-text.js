/**
 * @typedef {import('micromark-util-types').Construct} Construct
 * @typedef {import('micromark-util-types').Resolver} Resolver
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').Previous} Previous
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').Token} Token
 */

import assert from 'assert'
import {markdownLineEnding} from 'micromark-util-character'
import {codes} from 'micromark-util-symbol/codes.js'
import {types} from 'micromark-util-symbol/types.js'

/** @type {Construct} */
export const mathText = {
  tokenize: tokenizeMathText,
  resolve: resolveMathText,
  previous
}

/** @type {Resolver} */
function resolveMathText(events) {
  let tailExitIndex = events.length - 4
  let headEnterIndex = 3
  /** @type {number} */
  let index
  /** @type {number|undefined} */
  let enter

  // If we start and end with an EOL or a space.
  if (
    (events[headEnterIndex][1].type === types.lineEnding ||
      events[headEnterIndex][1].type === 'space') &&
    (events[tailExitIndex][1].type === types.lineEnding ||
      events[tailExitIndex][1].type === 'space')
  ) {
    index = headEnterIndex

    // And we have data.
    while (++index < tailExitIndex) {
      if (events[index][1].type === 'mathTextData') {
        // Then we have padding.
        events[tailExitIndex][1].type = 'mathTextPadding'
        events[headEnterIndex][1].type = 'mathTextPadding'
        headEnterIndex += 2
        tailExitIndex -= 2
        break
      }
    }
  }

  // Merge adjacent spaces and data.
  index = headEnterIndex - 1
  tailExitIndex++

  while (++index <= tailExitIndex) {
    if (enter === undefined) {
      if (
        index !== tailExitIndex &&
        events[index][1].type !== types.lineEnding
      ) {
        enter = index
      }
    } else if (
      index === tailExitIndex ||
      events[index][1].type === types.lineEnding
    ) {
      events[enter][1].type = 'mathTextData'

      if (index !== enter + 2) {
        events[enter][1].end = events[index - 1][1].end
        events.splice(enter + 2, index - enter - 2)
        tailExitIndex -= index - enter - 2
        index = enter + 2
      }

      enter = undefined
    }
  }

  return events
}

/** @type {Previous} */
function previous(code) {
  // If there is a previous code, there will always be a tail.
  return (
    code !== codes.dollarSign ||
    this.events[this.events.length - 1][1].type === types.characterEscape
  )
}

/** @type {Tokenizer} */
function tokenizeMathText(effects, ok, nok) {
  const self = this
  let sizeOpen = 0
  /** @type {number} */
  let size
  /** @type {Token} */
  let token

  return start

  /** @type {State} */
  function start(code) {
    assert(code === codes.dollarSign, 'expected `$`')
    assert(previous.call(self, self.previous), 'expected correct previous')
    effects.enter('mathText')
    effects.enter('mathTextSequence')
    return openingSequence(code)
  }

  /** @type {State} */
  function openingSequence(code) {
    if (code === codes.dollarSign) {
      effects.consume(code)
      sizeOpen++
      return openingSequence
    }

    effects.exit('mathTextSequence')
    return gap(code)
  }

  /** @type {State} */
  function gap(code) {
    if (code === codes.eof) {
      return nok(code)
    }

    // Closing fence?
    // Could also be data.
    if (code === codes.dollarSign) {
      token = effects.enter('mathTextSequence')
      size = 0
      return closingSequence(code)
    }

    // Tabs don’t work, and virtual spaces don’t make sense.
    if (code === codes.space) {
      effects.enter('space')
      effects.consume(code)
      effects.exit('space')
      return gap
    }

    if (markdownLineEnding(code)) {
      effects.enter(types.lineEnding)
      effects.consume(code)
      effects.exit(types.lineEnding)
      return gap
    }

    // Data.
    effects.enter('mathTextData')
    return data(code)
  }

  // In math.
  /** @type {State} */
  function data(code) {
    if (
      code === codes.eof ||
      code === codes.space ||
      code === codes.dollarSign ||
      markdownLineEnding(code)
    ) {
      effects.exit('mathTextData')
      return gap(code)
    }

    effects.consume(code)
    return data
  }

  // Closing fence.
  /** @type {State} */
  function closingSequence(code) {
    // More.
    if (code === codes.dollarSign) {
      effects.consume(code)
      size++
      return closingSequence
    }

    // Done!
    if (size === sizeOpen) {
      effects.exit('mathTextSequence')
      effects.exit('mathText')
      return ok(code)
    }

    // More or less accents: mark as data.
    token.type = 'mathTextData'
    return data(code)
  }
}

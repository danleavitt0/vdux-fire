/**
 * Imports
 */

import 'regenerator-runtime/runtime'
import vdux from 'vdux/dom'
import {element} from 'vdux'
let Boot = require('./Boot').default

/**
 * Hot module replacement
 */

const {forceRerender} = vdux(() => <Boot />)

if (module.hot) {
  module.hot.accept(['./Boot'], () => {
    Boot = require('./Boot').default
    forceRerender()
  })
}



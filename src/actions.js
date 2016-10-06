import createAction from '@f/create-action'

const subscribe = createAction('vdux-fireSummon: subscribe')
const unsubscribe = createAction('vdux-fireSummon: unsubscribe')
const invalidate = createAction('vdux-fireSummon: invalidate')
const update = createAction('vdux-fireSummon: update')
const firebaseSet = createAction('vdux-fireSummon: set')
const once = createAction('vdux-fireSummon: once')

export {
  subscribe,
  unsubscribe,
  invalidate,
  update,
  firebaseSet,
  once
}

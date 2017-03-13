import createAction from '@f/create-action'

const transaction = createAction('vdux-fireSummon: transaction')
const unsubscribe = createAction('vdux-fireSummon: unsubscribe')
const invalidate = createAction('vdux-fireSummon: invalidate')
const subscribe = createAction('vdux-fireSummon: subscribe')
const refMethod = createAction('vdux-fireSummon: refMethod')
const update = createAction('vdux-fireSummon: update')
const once = createAction('vdux-fireSummon: once')
const set = createAction('vdux-fireSummon: set')

export {
  subscribe,
  unsubscribe,
  invalidate,
  transaction,
  update,
  refMethod,
  once,
  set
}

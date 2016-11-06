import createAction from '@f/create-action'

const subscribe = createAction('vdux-fireSummon: subscribe')
const unsubscribe = createAction('vdux-fireSummon: unsubscribe')
const invalidate = createAction('vdux-fireSummon: invalidate')
const update = createAction('vdux-fireSummon: update')
const refMethod = createAction('vdux-fireSummon: refMethod')
const once = createAction('vdux-fireSummon: once')

export {
  subscribe,
  unsubscribe,
  invalidate,
  update,
  refMethod,
  once
}

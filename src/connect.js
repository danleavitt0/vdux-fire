/** @jsx element */

import {subscribe, unsubscribe, getLast} from './actions'
import {component, element} from 'vdux'
import deepEqual from '@f/deep-equal'
import mapValues from '@f/map-values'
import objEqual from '@f/equal-obj'
import objSome from 'object-some'
import {mw} from './middleware'
import reducer from './reducer'
import filter from '@f/filter'
import splice from '@f/splice'
import map from '@f/map-obj'
import union from '@f/union'

const orderParams = /orderByValue|orderByChild|orderByKey/gi

function mapState (obj) {
  return map((url, name) => ({
    name,
    url,
    pageSize: url.pageSize,
    loading: true,
    error: null,
    value: null
  }), obj)
}

        // const {pageSize, queryParams} = mapping
        // if (pageSize) {
        //   yield actions.setPageSize(pageSize)
        // }
        // {...mapping, queryParams: (queryParams || []).concat(`limitToFirst=${pageSize}`)}


function connect (fn) {
  return function (Ui) {
    const Component = component({
      initialState ({props, state, local}) {
        return {
          ...mapState(fn(props)),
          savedKeys: [],
          page: 0
        }
      },

      * onCreate ({props, state, path, actions, context}) {
        const mapping = fn(props, context)
        if (objSome(mapping, (val, key) => {
          return val.pageSize && !(val.queryParams && val.queryParams.find(v => v.search(orderParams) > -1))
        })) {
          throw new Error('vdux-fire error: pageSize requires an orderBy queryParam')
        }
        yield actions.subscribeAll(path, fn(props))
      },

      * onUpdate (prev, next) {
        if (!deepEqual(prev.props, next.props)) {
          const prevProps = fn(prev.props)
          const nextProps = fn(next.props)
          const newProps = filter((prop, key) => !prevProps[key] || prevProps[key] !== prop, nextProps)
          const removeProps = filter((prop, key) => !nextProps[key] || nextProps[key] !== prop, prevProps)
          if (Object.keys(removeProps).length > 0) {
            yield unsubscribeAll(next.path, removeProps)
          }
          if (Object.keys(newProps).length > 0) {
            const mapped = mapState(newProps)
            yield mapValues(prop => next.actions.update(prop), mapped)
            yield next.actions.subscribeAll(next.path, newProps)
          }
        }
      },

      render ({props, state, children, actions}) {
        const mapping = fn(props)
        // XXX CLEAN THIS UP
        const injectedNext = map((val, key) => {
          if (val && val.pageSize && !val.done) {
            return {...val, next: actions.nextPage(key)}
          }
          return val
        }, state)

        return (
          <Ui {...props} {...injectedNext} >
            {children}
          </Ui>
        )
      },

      controller: {
        * nextPage ({props, state, actions, path}, key) {
          const mapping = fn(props)
          const {cursor} = state
          const pageNum = state.page + 1
          yield actions.setPage(pageNum)

          yield actions.subscribe(
            path,
            {
              ...mapping[key],
              queryParams: (mapping[key].queryParams || []).concat(`startAt=${cursor}`,),
              mergeValues: true,
              page: pageNum
            },
            key
          )
        },
        * subscribe ({state}, path, ref, key) {
          if (ref) {
            typeof (ref) === 'string'
              ? yield subscribe({path, ref, name: key})
              : yield subscribe({
                  ref,
                  path,
                  name: key
                })
            }
        },
        * subscribeAll ({actions}, path, refs) {
          for (let key in refs) {
            const ref = refs[key]
            if (ref.pageSize) {
              yield getLast({path, ref, key})
            }
            yield actions.subscribe(path, ref, key)
          }
        },
        * mergeValue ({state, actions}, {name, value, key, page, prevSib, orderBy}) {
          const list = state[name].value
            ? join(state[name].value, {val: value, key}, prevSib)
            : [{val: value, key}]
          const lastItem = list[list.length - 1]
          if (lastItem.key === state[name].lastItem) {
            yield actions.donePaging(name)
          }
          yield actions.update({name, value: list, key})
          const cursor = orderByToKey(orderBy, {value: lastItem.val, key: lastItem.key})
          if (cursor) {
            yield actions.setCursor()
          } else {
            throw new Error(`vdux-fire error: ref does not have sort key '${orderBy.split('=')[1]}'`)
          }
        }
      },

      reducer: {
        setPage: (state, page) => ({page}),
        setCursor: (state, cursor) => ({cursor}),
        donePaging: (state, name) => ({[name]: {...state[name], done: true}}),
        setLastItem: (state, {name, snap, orderBy}) => ({
          [name]: {
            ...state[name],
            lastItem: snap.key
          }
        }),
        update: (state, payload) => ({
          [payload.name]: {
            ...state[payload.name],
            ...payload,
            loading: false
          }
        }),
        mapNewState: (state, payload) => ({
          ...state,
          ...payload
        }),
        removeKey: (state, {name, key}) => ({
          [name]: {
            ...state[name],
            value: state[name].value.filter(v => v.key !== key)
          }
        })
      },

      middleware: [
        mw
      ],

      onRemove ({path}) {
        return unsubscribe({path})
      }
    })

    return Component
  }
}

function join (a, b, prevSib) {
  const oldIdx = a.findIndex(v => v.key === b.key)
  if (oldIdx > -1) {
    a[oldIdx] = b
    return a
  }
  if (prevSib) {
    const prevIdx = a.findIndex(v => v.key === prevSib)
    return splice(a, prevIdx + 1, 0, b)
  }
  return a.concat(b)
}

function * unsubscribeAll (path, refs) {
  for (let key in refs) {
    const ref = refs[key]
    if (ref) {
      typeof (ref) === 'string'
        ? yield unsubscribe({path, ref, name: key})
        : yield unsubscribe({
            ref: ref.ref,
            name: key,
            path
          })
      }
  }
}

function orderByToKey (sort, val) {
  const [orderBy, child] = sort.split('=')
  const orders = {
    'orderByKey': val.key,
    'orderByValue': val.value,
    'orderByChild': val[child]
  }
  return orders[orderBy]
}

export default connect
export {
  reducer
}

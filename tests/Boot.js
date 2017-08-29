/**
 * Imports
 */

import {
  middleware as firebaseMw,
  set as firebaseSet,
  update as firebaseUpdate,
  once as firebaseOnce,
  push as firebasePush,
  transaction
} from '..'
import {component, element} from 'vdux'
import App from './App'
import map from '@f/map'

/**
 * Constants
 */

const classes = [
  '-KsBAt8vlTFRQHPybdjf',
  '-KsBJqRgU1JoutpPYtcI',
  '-KsBUU9GAcO9RmYv_AqG',
  '-KsKjAI_KnuEMPQhIpin',
  '-KsLMmhEv8OhfmXGIFwq'
 ]

const schools = [
  '-KsBAqCrLu1OxcYDN7fg',
  '-KsBJoQOirD2EdDdVSH2',
  '-KsBS8NF1s2vaReVHF0C',
  '-KsKj8Y5g3K-R1iMhHMV'
]

const apiServer = process.env.API_SERVER
const firebaseConfig = {
	"apiKey": "AIzaSyAQ7YJxZruXp5RhMetYq1idFJ8-y0svN-s",
	"authDomain":"artbot-dev.firebaseapp.com",
	"databaseURL":"https://artbot-dev.firebaseio.com",
	"storageBucket":"artbot-dev.appspot.com",
	"messagingSenderId":"1001646388415"
}

/**
 * <Boot/>
 */

export default component({

  initialState ({props}) {
    if (props.req) {
      return {
        currentUrl: props.req.url
      }
    }

    return {}
  },

  getContext ({props, state, actions}) {
    const {media, currentUrl, avatarUpdates} = state
    const userAgent = props.req
      ? props.req.headers['user-agent']
      : window.navigator.userAgent

    return {
      ...actions
    }
  },

  render ({props, state}) {
    return <App
      classRefs={classes}
      schoolRefs={schools}
      uid='b1V2uAmlCieLOdP749PkdhGxfUw2'
      classRef='-KsLMmhEv8OhfmXGIFwq'
      playlistRef='-KdCvzTwsCqeM26lzted'
      {...state}
      {...props} />
  },

  onUpdate (prev, next) {
    if (prev.state.title !== next.state.title && typeof document !== 'undefined') {
      document.title = next.state.title
    }
  },

  middleware: [firebaseMw(firebaseConfig)],

  controller: {
    firebaseSet: wrapEffect(firebaseSet),
    firebaseUpdate: wrapEffect(firebaseUpdate),
    firebaseOnce: wrapEffect(firebaseOnce),
    firebaseTransaction: wrapEffect(transaction),
    firebasePush: wrapEffect(firebasePush)
  },

  reducer: {
    updateAvatar: state => ({
      avatarUpdates: (state.avatarUpdates || 0) + 1
    }),
    updateMedia: (state, {key, matches}) => ({
      media: state.media === key
        ? matches ? key : null
        : matches ? key : state.media
    }),
    updateUrl: (state, currentUrl) => ({
      currentUrl,
      modal: state.currentUrl === currentUrl ? state.modal : null
    }),
    openModal: (state, modal) => ({
      // Dont allow modal opening on the server, because it causes
      // issues with server-side rendering
      modal: typeof window === 'undefined' ? null : modal
    }),
    closeModal: () => ({modal: null}),
    showToast: (state, toast) => ({toast}),
    hideToast: () => ({toast: null}),
    setTitle: (state, title) => ({title}),
    setUserId: (state, userId) => ({userId}),
    setUsername: (state, username) => ({username})
  }
})

/**
 * Helpers
 */

function wrapEffect (fn) {
  return (model, ...args) => fn(...args)
}

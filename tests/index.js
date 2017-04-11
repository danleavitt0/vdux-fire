var firebase = require('firebase')

const config = {
  apiKey: 'AIzaSyAQ7YJxZruXp5RhMetYq1idFJ8-y0svN-s',
  authDomain: 'artbot-dev.firebaseapp.com',
  databaseURL: 'https://artbot-dev.firebaseio.com',
  storageBucket: 'artbot-dev.appspot.com',
  messagingSenderId: '1001646388415'
}

firebase.initializeApp(config)

firebase.database().ref('/users/OomwNVi8vScVtr3h5dD7CHFkEj62/playlists')
  .orderByChild('dateAdded')
  .startAt(-1481756450868)
  .limitToFirst(2)
  .on('value', (snap) => {
    const results = orderData(snap)
    console.log(results)
  })

function orderData (snap) {
  let ordered = []
  snap.forEach((child) => {
    const val = child.val()
    val.key = child.key
    ordered.push(val)
  })
  return ordered
}

// export default fire((props) => ({
//
// }))({
//   render
// })

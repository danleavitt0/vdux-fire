# vdux-fire
vdux firebase container

## Installation

with yarn:
```
yarn add vdux-fire
```

with npm:
```
npm install vdux-fire
```

## Usage
vdux-fire is inspired by vdux-summon and [react-refetch](https://github.com/heroku/react-refetch). You can use it to declaratively fetch data for your components and inject it into their props.

```js
import fire from 'vdux-fre'

export default fire((props) => ({
  todos: `/users/${props.uid}/todos`
}))(component({
  render ({props}) {
    const {todos} = props
    if (todos.loading) return <span/>
    return (
      todos.value.map(todo => <li>{todo.name}</li>)
    )
  }
}))
```

### Middleware
In order to make this work however, you must install the vdux-fire middleware in your root component's middleware stack and pass it your firebase config object:

```js
import * as vduxFire from 'vdux-fire'
import config from './firebaseConfig'

component({
  middleware: [...middleware, vduxFire.middleware(config)]
})
```

## Descriptor Object
The structure of the descriptor object is:

- `ref` - String, specifies the firebase ref to watch. If only a string is specified it is shorthand for this.
- `type` - String, set to 'once' to only read the database ref only one time when the component is loaded. Without this enabled vdux-fire watches the ref and updates components on changes.
- `queryParams` - Array, See query parameter section below.
- `join` - Object, See join section below.

## Query Parameters
All of the firebase queries can be written in either string or object notation. For more information about firebase queries checkout their [docs](https://firebase.google.com/docs/reference/js/firebase.database.Query).

### Object notation
To write a query in object notation:
```js
{
  ref: '/some/firebase/ref',
  queryParams: [
    {method: 'orderByKey'},
    {method: 'limitToFirst', value: 5},
  ]
}
```

### String notation
To write the equivalent query:
```js
{
  ref: '/some/firebase/ref',
  queryParams: [
    'orderByKey',
    'limitToFirst=5'
  ]
}
```

## Join
To help keep your firebase database flat, vdux-fire has a join that can either replace or add new IDs within your data with other data from Firebase.

- `ref` - String, The root ref of the join data.
- `child` - String, The key to replace in your returned data. If the childRef is not specified this is also used as the childRef.
- `childRef` - String or Function, The child to read from the join ref.
If childRef is a function it receives the parameters (val, ref):
  - `val` - The value returned by the initial query.
  - `ref` - The firebase ref specified in the ref key of join.
  - **Returns**: Array or Firebase Ref, A single firebase reference or array of firebase references.

Basic example:
```js
// Example data
// usernames: {
//   'uniqueID': 'danleavitt0'
// }
// games: {
//   'gameID': {
//     ...gameData,
//     uid: 'uniqueID'
//   }
// }
fire((props) => ({
  todos: {
    ref: `/games/${props.gameId}`,
    join: {
      ref: '/usernames',
      child: 'uid'
    }
  }
}))
```

Example using childRef as a function to return an array of join values. These will be merged in to their corresponding parents at the key `gameVal`:
```js
// Example data
// users: {
//   kvkXjds5fRh0jliRNfji3LTFMbI3: {
//     games: {
//        gameRef: {
//           ...gameMetaData
//           ref: 'gameRef'
//         }
//     }
//   }
// }
// games: {
//   'gameRef': {
//     ...gameData,
//   }
// }
fire((props) => {
  ref: '/users/kvkXjds5fRh0jliRNfji3LTFMbI3/games',
  queryParams: ['orderByChild=lastEdited, limitToLast=3'],
  join: {
    ref: '/games',
    child: 'gameVal',
    childRef: (val, ref) => mapValues(v => ref.child(v.ref), val)
  }
})
```

## Descriptor String
If you are NOT using join the entire descriptor object can be written as a single string. The format of the string is:

```js
'ref#query1&query2'
```

To add a once in string notation add `[once]` to the string:
```js
'ref[once]'
// or
'ref#query[once]'
```

Example:
```js
todos: `/users/${props.uid}/todos#orderByChild=timestamp&limitToFirst=5`
```

## Data Object
The structure of the data object is:
- `loading` - Whether or not the collection is currently loading
- `error` - If an error has occurred, it is stored here.
- `value` - The value returned from the request.
- `ref` - The firebase ref that was requested.

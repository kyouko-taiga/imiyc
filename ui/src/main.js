import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import * as io from 'socket.io-client'

import reducers from './reducers'
import * as actionTypes from './actions/types'
import * as gameActions from './actions/game'
import GameBoard from './components/GameBoard'

// Create the socket.io connection.
let socket = io.connect('http://' + document.domain + ':' + location.port)

let store = createStore(
    reducers,
    applyMiddleware(
        thunk.withExtraArgument(socket),
        createLogger({ collapsed: true })))

// ---------------------------------------------------------------------------
// API

socket.on('connect', () => {
    store.dispatch(gameActions.joinGame())
})

socket.on(actionTypes.GAME_UPDATE, (payload) => {
    store.dispatch(gameActions.updateGame(payload))
})

socket.on(actionTypes.GRAPH_UPDATE, (payload) => {
    store.dispatch(gameActions.updateGraph(payload))
})

socket.on(actionTypes.LOCATION_UPDATE, (payload) => {
    store.dispatch(gameActions.updateLocation(payload.location))
})

// ---------------------------------------------------------------------------

const App = (
    <Provider store={store}>
        <GameBoard />
    </Provider>
)

render(App, document.getElementById('app'))

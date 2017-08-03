import { combineReducers } from 'redux'

import game from './game'
import graph from './graph'

const state = combineReducers({
    game,
    graph,
})

export default state

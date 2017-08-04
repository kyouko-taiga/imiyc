import { combineReducers } from 'redux'

import game from   './game'
import graph from  './graph'
import player from './player'

const state = combineReducers({
    game,
    graph,
    player,
})

export default state

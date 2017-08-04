import * as actionTypes from './types'

export function joinGame() {
    return (dispatch, getState, socket) => {
        socket.emit('GAME_JOIN', {
            game_id : window.__gameId__,
        })
    }
}

export function updateGame(game) {
    return {
        type   : actionTypes.GAME_UPDATE,
        payload: game,
    }
}

export function updateGameCountdown(countdown) {
    return {
        type   : actionTypes.GAME_COUNTDOWN_UPDATE,
        payload: { countdown: countdown },
    }
}

export function getGraph(graph) {
    return (dispatch, getState, socket) => {
        socket.emit('GRAPH_GET', {
            game_id : window.__gameId__,
        })
    }
}

export function updateGraph(graph) {
    return {
        type   : actionTypes.GRAPH_UPDATE,
        payload: graph,
    }
}

export function postLocation(location) {
    return (dispatch, getState, socket) => {
        // Don't dispatch anything if the location didn't change.
        if (location == getState().game.location) {
            return
        }

        socket.emit('PLAYER_LOCATION_POST', {
            game_id : window.__gameId__,
            location: location,
        })

        dispatch({
            type   : actionTypes.PLAYER_LOCATION_POST,
            payload: { location },
        })
    }
}

export function updatePlayer(player) {
    return {
        type   : actionTypes.PLAYER_UPDATE,
        payload: player,
    }
}

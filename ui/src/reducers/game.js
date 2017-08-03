import { GAME_UPDATE } from '../actions/types'

const initialState = {
    id       : window.__gameId__,
    countdown: 0,
    phase    : 0,
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GAME_UPDATE:
            return {
                ...state,
                id       : action.payload.id,
                countdown: action.payload.countdown,
                phase    : action.payload.phase,
            }

        default:
            return state
    }
}

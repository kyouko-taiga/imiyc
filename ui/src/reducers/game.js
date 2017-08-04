import { GAME_UPDATE } from '../actions/types'

const initialState = {
    id               : window.__gameId__,
    started_at       : 0,
    healthy_duration : 0,
    infected_duration: 0,
    status           : 'healthy'
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GAME_UPDATE:
            return {
                ...state,
                ...action.payload,
            }

        default:
            return state
    }
}

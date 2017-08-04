import { PLAYER_UPDATE, PLAYER_LOCATION_POST } from '../actions/types'

const initialState = {
    session_id: null,
    status    : 'healthy',
    location  : null,
}

export default (state = initialState, action) => {
    switch (action.type) {
        case PLAYER_UPDATE:
            return {
                ...state,
                ...action.payload,
            }

        case PLAYER_LOCATION_POST:
            return {
                ...state,
                location: action.payload.location,
            }

        default:
            return state
    }
}

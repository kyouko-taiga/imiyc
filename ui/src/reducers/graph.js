import { GRAPH_UPDATE } from '../actions/types'

const initialState = {
    nodes          : [],
    links          : [],
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GRAPH_UPDATE:
            return {
                ...state,
                nodes: action.payload.nodes,
                links: action.payload.links,
            }

        default:
            return state
    }
}

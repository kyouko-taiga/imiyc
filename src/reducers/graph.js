import { GRAPH_REBUILD, GRAPH_SELECT, GRAPH_UPDATE } from '../actions/types'

const initialState = {
    nodes   : {},
    edges   : {},
    selected: null,
}

const graph = (state = initialState, action) => {
    switch (action.type) {
        case GRAPH_REBUILD:
            return {
                ...state,
                nodes: action.payload.nodes,
                edges: action.payload.edges,
            }

        case GRAPH_SELECT:
            return {
                ...state,
                selected: action.payload.selected,
            }

        case GRAPH_UPDATE:
            return {
                ...state,
                nodes: action.payload.nodes,
            }

        default:
            return state
    }
}

export default graph

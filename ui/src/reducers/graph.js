import { GRAPH_UPDATE, LOCATION_POST, LOCATION_UPDATE } from '../actions/types'

const initialState = {
    nodes          : {},
    links          : {},
    location       : null,
    totalPopulation: 0,
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GRAPH_UPDATE:
            return {
                ...state,
                nodes          : action.payload.nodes,
                links          : action.payload.links,
                totalPopulation: action.payload.nodes
                    .map((n) => { return n.population })
                    .reduce((acc, x) => { return acc + x }, 0)
            }

        case LOCATION_POST:
            return {
                ...state,
                location: action.payload.location,
                nodes   : (state.location == action.payload.location)
                    ? state.nodes
                    : state.nodes.map((n) => {
                        switch (n.id) {
                        case state.location:
                            return { ...n, population: n.population - 1 }
                        case action.payload.location:
                            return { ...n, population: n.population + 1 }
                        default:
                            return n
                        }
                    }),
            }

        case LOCATION_UPDATE:
            return {
                ...state,
                location: action.payload.location,
            }

        default:
            return state
    }
}

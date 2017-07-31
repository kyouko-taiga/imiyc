import { createStore } from 'redux'
import cytoscape from 'cytoscape'
import euler from 'cytoscape-euler'

import reducers from './reducers'
import { GRAPH_REBUILD, GRAPH_SELECT, GRAPH_UPDATE } from './actions/types'

let store = createStore(reducers)

cytoscape.use( euler )
let cy = cytoscape({
    container     : document.getElementById('cy'),
    // zoomingEnabled: false,
    // panningEnabled: false,
    // autoungrabify : true,
    motionBlur    : true,
    style         : [ // the stylesheet for the graph
        {
            selector: 'node',
            style   : {
                'width'           : 20,
                'height'          : 20,
                'background-color': '#666',
            },
        },
        {
            selector: 'node.selected',
            style   : {
                'border-width': '3px',
                'border-color': '#f00',
            },
        },
        {
            selector: 'edge',
            style   : {
                'width'             : 2,
                'line-color'        : '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
            },
        },
    ],
});

cy.on('tap', 'node', (e) => {
    store.dispatch({
        type   : GRAPH_SELECT,
        payload: {
            selected: e.target.id(),
        }
    })
})
cy.on('free', (e) => {
    cy.layout({
        name             : 'euler',
        animate          : 'end',
        animationDuration: 100,
        padding          : 10,
     }).run()
})

let listeners = {}

let ready    = false
let updating = false

listeners['cy_update'] = store.subscribe(() => {
    if (updating) {
        return
    }

    const graph  = store.getState().graph

    if (!ready) {
        updating = true

        // Rebuild all graph's elements.
        cy.remove('*')
        let elements = []

        for (let nodeId in graph.nodes) {
            const diameter = graph.nodes[nodeId].population
            elements.push({
                data: {
                    id        : nodeId,
                    population: graph.nodes[nodeId].population,
                },
                style: {
                    content: diameter
                }
            })
        }

        for (let sourceId in graph.edges) {
            for (let targetId in graph.edges[sourceId]) {
                if (graph.edges[sourceId][targetId]) {
                    elements.push({
                        data: {
                            id    : sourceId + targetId,
                            source: sourceId,
                            target: targetId,
                        },
                    })
                }
            }
        }

        // Rebuild the viewport.
        cy.add(elements)
        cy.once('layoutstop', () => {
            ready    = true
            updating = false
        })
        cy.layout({
            name   : 'euler',
            padding: 10,
         }).run()
    } else {
        for (let nodeId in graph.nodes) {
            const diameter = graph.nodes[nodeId].population
            cy.collection('#' + nodeId).style({
                content: diameter
            })
        }
    }

})

listeners['cy_select'] = store.subscribe(() => {
    const graph  = store.getState().graph
    cy.collection('.selected').removeClass('selected')
    cy.collection('#' + graph.selected).addClass('selected')
})

// ---------------------------------------------------------------------------

const NB_NODES            = 8
const CONNECTIVITY_FACTOR = 0.80

let nodes = {}
let edges = {}
for (let i = 0; i < NB_NODES; ++i) {
    let line      = {}
    let neighbors = 0
    for (let j = 0; j < NB_NODES; ++j) {
        line['n' + j] = (i != j) && (Math.random() >= CONNECTIVITY_FACTOR) ? true : false
    }
    edges['n' + i] = line
    nodes['n' + i] = { id: 'n' + i, population: 0 }
}


store.dispatch({
    type   : GRAPH_REBUILD,
    payload: {
        nodes: nodes,
        edges: edges,
    }
})

function changePopulation() {
    const nodeId = 'n' + Math.round(Math.random() * (NB_NODES - 1))
    if (nodes[nodeId].population == 0) {
        nodes[nodeId].population += 1
    } else {
        nodes[nodeId].population += Math.round(Math.random() * 2) - 1
    }
    store.dispatch({
        type   : GRAPH_UPDATE,
        payload: {
            nodes: nodes,
        }
    })

    setTimeout(changePopulation, Math.random() * 250)
}
changePopulation()

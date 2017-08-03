import * as d3 from 'd3'
import deepcopy from 'deepcopy'
import React from 'react'

import * as gameActions from '../actions/game'

export default class Graph extends React.Component {

    constructor() {
        super()
        this.handleDragStarted = this.handleDragStarted.bind(this)
        this.handleDragged     = this.handleDragged.bind(this)
        this.handleDragEnded   = this.handleDragEnded.bind(this)
        this.handleNodeClick   = this.handleNodeClick.bind(this)
    }

    componentDidMount() {
        this.svg     = d3.select(this.refs.graph)
        const width  = this.svg.node().getBoundingClientRect().width
        const height = this.svg.node().getBoundingClientRect().height

        this.simulation = d3.forceSimulation()
            .force('link'   , d3.forceLink().id((d) => { return d.id }).distance(50))
            .force('charge' , d3.forceManyBody())
            .force('center' , d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide().radius((d) => { return this.radius(d.population) * 1.75 }))

        this.svg.append('g').attr('class', 'links')
        this.svg.append('g').attr('class', 'nodes')
    }

    componentWillReceiveProps(props) {
        const graph = props.graph
        const color = d3.scaleOrdinal(d3.schemeCategory20)

        // Note that because D3-force's simulation mutates the nodes' data, we
        // can't simply pass the redux store's state to D3, so as to keep it
        // immutable. Instead. we create a deep copy of the graph data, and
        // make sure to preserve all updated properties as well.

        let linksData = deepcopy(graph.links)
        let nodesData = deepcopy(graph.nodes)
        let node      = this.svg.select('g.nodes').selectAll('g')
        let data      = node.data()

        for (let i = 0; i < nodesData.length; ++i) {
            const previous = data.find((d) => { d.id == nodesData[i].id })
            nodesData[i] = { ...data[i], ...nodesData[i] }
        }

        // Update the graph data.
        this.svg.select('g.links').selectAll('line').data(linksData)
            .enter().append('line')
                .attr('stroke-width', 3)

        node = node.data(nodesData)
        let ng = node.enter().append('g')
            .attr('id', (d) => { return '_' + d.id })
            .call(d3.drag()
                .on('start', this.handleDragStarted)
                .on('drag' , this.handleDragged)
                .on('end'  , this.handleDragEnded))
            .on('click', this.handleNodeClick)

        ng.append('circle')
        ng.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')

        // Note that in order to propagate the data from parents to children, we
        // need to either explicitly redo the data join to receive the data, or
        // use `selection.select` again, which does it internally.
        // See: https://stackoverflow.com/questions/18831949

        node = this.svg.select('g.nodes').selectAll('g')

        node.select('circle')
            .attr('r', (d) => { return this.radius(d.population) })
        node.select('text')
            .text((d) => { return `${Math.round(this.percent(d.population) * 10) / 10}%` })

        node.classed('selected', false)
        this.svg.select(`#_${graph.location}`).classed('selected', true)

        // Update the force simulation.
        this.simulation
            .nodes(nodesData)
            .on('tick', this.ticked.bind(this))

        this.simulation.force('link')
            .links(linksData)
    }

    percent(population) {
        return (this.props.graph.totalPopulation > 0)
            ? population * 100 / this.props.graph.totalPopulation
            : 0
    }

    radius(population) {
        return this.percent(population) / 2 + 20
    }

    ticked() {
        this.svg.select('g.links').selectAll('line')
            .attr('x1', (d) => { return d.source.x })
            .attr('y1', (d) => { return d.source.y })
            .attr('x2', (d) => { return d.target.x })
            .attr('y2', (d) => { return d.target.y })

        this.svg.select('g.nodes').selectAll('g')
            .attr('transform', (d) => { return `translate(${d.x}, ${d.y})` })
    }

    handleDragStarted(d) {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0.3).restart()
        }
        d.fx = d.x
        d.fy = d.y
    }

    handleDragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
    }

    handleDragEnded(d) {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0)
        }
        d.fx = null
        d.fy = null
    }

    handleNodeClick(d) {
        this.props.dispatch(gameActions.postLocation(d.id))
    }

    render() {
        return <svg id="graph" ref="graph"></svg>
    }

}

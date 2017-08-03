import * as d3 from 'd3'
import deepcopy from 'deepcopy'
import React from 'react'

import * as gameActions from '../../actions/game'
import Graph from '../Graph'

export default class GameBoard extends React.Component {

    render() {
        const minutes = Math.floor(this.props.store.game.countdown / 60)
        const seconds = this.props.store.game.countdown - 60 * minutes
        const countdown = `${minutes}:${seconds}`

        return (
          <div className="container">
            <div className="row">
              <div className="col-xs-12">
                Infection starts in: {countdown}
              </div>
            </div>
            <div className="row">
              <div className="col-md-8 col-md-offset-2">
                <Graph graph={this.props.store.graph} dispatch={this.props.dispatch} />
              </div>
            </div>
          </div>
        )
    }

}

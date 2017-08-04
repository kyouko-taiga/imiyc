import * as d3 from 'd3'
import deepcopy from 'deepcopy'
import React from 'react'

import * as gameActions from '../../actions/game'
import Countdown from '../Countdown'
import Graph from '../Graph'

export default class GameBoard extends React.Component {

    render() {
        const statusIcon = this.props.player.status == 'healthy'
            ? <img src="/static/icons/healthy.png" />
            : <img src="/static/icons/infected.png" />

        return (
          <div className="container">
            <div className="row">
              <div className="x-hud">
                <div className="col-sm-6">
                  <div className="x-player-status">
                    {statusIcon}
                  </div>
                </div>
                <div className="col-sm-6">
                  <Countdown game={this.props.game} />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <Graph
                  graph    = {this.props.graph}
                  player   = {this.props.player}
                  dispatch = {this.props.dispatch}
                />
              </div>
            </div>
          </div>
        )
    }

}

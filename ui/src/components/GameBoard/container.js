import React from 'react'
import { connect } from 'react-redux'

import { updateGameCountdown } from '../../actions/game'
import GameBoardComponent from './component'

class GameBoardContainer extends React.Component {

    render() {
        return <GameBoardComponent {...this.props} {...this.state} />
    }

}

function stateToProps(state) {
    return {
        game  : state.game,
        graph : state.graph,
        player: state.player,
    }
}

export default connect(stateToProps)(GameBoardContainer)

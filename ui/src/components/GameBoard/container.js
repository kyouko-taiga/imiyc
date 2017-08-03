import React from 'react'
import { connect } from 'react-redux'

import { updateGameCountdown } from '../../actions/game'
import GameBoardComponent from './component'

class GameBoardContainer extends React.Component {

    componentDidMount() {
        // this.gameTimer = setInterval(() => {
        //     this.props.dispatch(updateGameCountdown(this.props.countdown - 1))
        // }, 1000)
    }

    componentWillUnount() {
        clearInterval(this.gameTimer)
    }

    render() {
        return <GameBoardComponent {...this.props} {...this.state} />
    }

}

function stateToProps(state) {
    return { store: state }
}

export default connect(stateToProps)(GameBoardContainer)

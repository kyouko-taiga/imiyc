import moment from 'moment'
import React from 'react'

import CountdownComponent from './component'

export default class CountdownContainer extends React.Component {

    constructor() {
        super()
        this.state = { remaining: 0 }
        this.timer = null
    }

    componentDidMount() {
        this.timer = setInterval(this.updateRemainingTime.bind(this), 100)
        this.updateRemainingTime()
    }

    componentWillUnount() {
        clearInterval(this.timer)
    }

    updateRemainingTime() {
        const game = this.props.game
        if (game.status == 'terminated') {
            clearInterval(this.timer)
        }

        const startTime = moment.unix(game.started_at)
        const diff      = moment().diff(startTime) / 1000
        const remaining =  game.status == 'healthy'
            ? 1 + Math.floor(game.healthy_duration - diff)
            : 1 + Math.floor(game.healthy_duration + game.infected_duration - diff)
        this.setState({ remaining })
    }

    render() {
        return <CountdownComponent {...this.props} {...this.state} />
    }

}

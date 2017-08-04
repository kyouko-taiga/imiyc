import React from 'react'

export default class CountdownComponent extends React.Component {

    render() {
        let minutes = '00'
        let seconds = '00'
        if (this.props.remaining >= 0) {
            minutes = Math.floor(this.props.remaining / 60)
            seconds = this.props.remaining - 60 * minutes
            minutes = (minutes < 10) ? ('0' + minutes) : minutes
            seconds = (seconds < 10) ? ('0' + seconds) : seconds
        }

        let phaseText = this.props.game.status == 'healthy'
            ? 'Infection starts in'
            : this.props.game.status == 'infected'
                ? 'Game ends in'
                : 'Game ended'

        return (
          <div className="x-countdown">
            <small>{phaseText}</small>
            <span>{`${minutes}:${seconds}`}</span>
          </div>
        )
    }

}

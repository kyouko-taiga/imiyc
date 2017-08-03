import eventlet
eventlet.monkey_patch()

import json
import random

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

games = {}


@app.route('/game/<int:game_id>')
def join_game(game_id):
    if game_id not in games:
        with open('graph.json') as f:
            graph_data = json.load(f)

        games[game_id] = {
            'graph'    : graph_data,
            'players'  : {},
            'locations': {},
            'countdown': 500,
            'phase'    : 0,
        }

    return render_template('game.html', game_id=game_id)

@socketio.on('GAME_JOIN')
def on_game_get(payload):
    game_id = payload.get('game_id')
    if game_id not in games:
        emit('ERROR', {'message': 'game not found'})
        return

    join_room(game_id)

    game  = games[game_id]
    graph = game['graph']

    emit('GAME_UPDATE', {
        'id'       : game_id,
        'countdown': game['countdown'],
        'phase'    : game['phase'],
    })

    if request.sid not in game['players']:
        player_location = random.randint(0, len(graph['nodes']) - 1)
        game['players'][request.sid] = {
            'status'  : 'healthy',
            'location': player_location
        }
        graph['nodes'][player_location]['population'] += 1

    emit('GRAPH_UPDATE', game['graph'], room=game_id)
    emit('LOCATION_UPDATE', {'location': game['players'][request.sid]['location']})

@socketio.on('GRAPH_GET')
def on_graph_get(payload):
    game_id = payload.get('game_id')
    if game_id not in games:
        emit('ERROR', {'message': 'game not found'})

    emit('GRAPH_UPDATE', games[game_id]['graph'])

@socketio.on('LOCATION_POST')
def on_graph_select(payload):
    game_id = payload.get('game_id')
    if game_id not in games:
        emit('ERROR', {'message': 'game not found'})

    game  = games[game_id]
    graph = game['graph']

    # There's nothing to do if the location didn't change.
    previous_location = game['players'][request.sid]['location']
    if payload['location'] == previous_location:
        return

    graph['nodes'][previous_location]['population']   -= 1
    graph['nodes'][payload['location']]['population'] += 1
    game['players'][request.sid]['location'] = payload['location']

    emit('GRAPH_UPDATE', graph, room=game_id)
    # emit('LOCATION_UPDATE', {'location': payload['location']})

def game_updater():
    while True:
        for game_id, game in games.items():
            game['countdown'] -= 1
            socketio.emit('GAME_UPDATE', {
                'id'       : game_id,
                'countdown': game['countdown'],
                'phase'    : game['phase'],
            }, room=game_id)

        eventlet.sleep(1)

if __name__ == '__main__':
    eventlet.spawn(game_updater)
    socketio.run(app, debug=True)

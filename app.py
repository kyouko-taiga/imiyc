import eventlet
eventlet.monkey_patch()

import json
import random
import time

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

games = {}

def emit_game_update(game):
    socketio.emit('GAME_UPDATE', {
        'id'               : game['id'],
        'started_at'       : game['started_at'],
        'healthy_duration' : game['healthy_duration'],
        'infected_duration': game['infected_duration'],
        'status'           : game['status']
    }, room=game['id'])

def start_infected_phase(game):
    game['status'] = 'infected'
    emit_game_update(game)

    # Choose the source of infection as the node with the largest population.
    graph = game['graph']
    source, node = max(enumerate(graph['nodes']), key = lambda it: it[1]['population'])
    graph['nodes'][source]['status'] = 'infected'
    socketio.emit('GRAPH_UPDATE', graph, room=game['id'])

    # Infect all players in that location.
    for player in game['players'].values():
        if player['location'] == source:
            player['status'] = 'infected'
            socketio.emit('PLAYER_UPDATE', player, room=player['session_id'])

def terminate_game(game):
    game['status'] = 'terminated'
    emit_game_update(game)
    del games[game['id']]

@app.route('/game/<int:game_id>')
def join_game(game_id):
    if game_id not in games:
        # Read the graph data.
        with open('graph.json') as f:
            graph_data = json.load(f)

        # Create the game object.
        healthy_duration  = 60
        infected_duration = 60
        games[game_id]    = {
            'id'               : game_id,
            'graph'            : graph_data,
            'players'          : {},
            'started_at'       : time.time(),
            'healthy_duration' : healthy_duration,
            'infected_duration': infected_duration,
            'status'           : 'healthy',
        }

        # Schedule the game phase changing functions.
        eventlet.spawn_after(healthy_duration, start_infected_phase, games[game_id])
        eventlet.spawn_after(healthy_duration + infected_duration, terminate_game, games[game_id])

    return render_template('game.html', game_id=game_id)

@socketio.on('GAME_JOIN')
def on_game_get(payload):
    game_id = payload.get('game_id')
    if game_id not in games:
        emit('ERROR', {'message': 'game not found'})
        return

    join_room(game_id)
    game = games[game_id]
    emit_game_update(game)

    graph = game['graph']
    if request.sid not in game['players']:
        player_location = random.randint(0, len(graph['nodes']) - 1)
        game['players'][request.sid] = {
            'session_id': request.sid,
            'status'    : 'healthy',
            'location'  : player_location,
        }
        graph['nodes'][player_location]['population'] += 1

    emit('GRAPH_UPDATE' , game['graph'], room=game_id)
    emit('PLAYER_UPDATE', game['players'][request.sid])

@socketio.on('GRAPH_GET')
def on_graph_get(payload):
    game_id = payload.get('game_id')
    if game_id not in games:
        emit('ERROR', {'message': 'game not found'})

    emit('GRAPH_UPDATE', games[game_id]['graph'])

@socketio.on('PLAYER_LOCATION_POST')
def on_player_location_post(payload):
    game_id = payload.get('game_id')
    if game_id not in games:
        emit('ERROR', {'message': 'game not found'})

    game    = games[game_id]
    graph   = game['graph']
    players = game['players']

    # There's nothing to do if the location didn't change.
    previous_location = game['players'][request.sid]['location']
    if payload['location'] == previous_location:
        return

    graph['nodes'][previous_location]['population']   -= 1
    graph['nodes'][payload['location']]['population'] += 1
    players[request.sid]['location'] = payload['location']

    # If everybody leaves a node, it gets healthy.
    if graph['nodes'][previous_location]['population'] == 0:
        graph['nodes'][previous_location]['status'] = 'healthy'

    # If the number of infected people is greater or equal to the number of
    # healthy people at a given location, everybody gets infected.
    propagate_infection(graph, players, previous_location)
    propagate_infection(graph, players, payload['location'])

    emit('GRAPH_UPDATE', graph, room=game_id)

def propagate_infection(graph, players, location):
    people = [p for p in players.values() if p['location'] == location]
    if len(people) == 0:
        return

    infected = [p for p in people if p['status'] == 'infected']
    if len(infected) >= len(people) / 2:
        graph['nodes'][location]['status'] = 'infected'
        for p in people:
            p['status'] = 'infected'
            emit('PLAYER_UPDATE', p, room=p['session_id'])

if __name__ == '__main__':
    socketio.run(app, debug=True)

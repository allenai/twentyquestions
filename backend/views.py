"""Views for the backend."""

import logging

import flask
import flask_socketio

from . import models
from . import settings


logger = logging.getLogger(__name__)


twentyquestions = flask.Blueprint(
    'twentyquestions',
    __name__,
    template_folder='templates',
    static_folder='static')

socketio = flask_socketio.SocketIO()


# constants / global state

player_router = models.PlayerRouter(
    game_rooms={},
    players={},
    game_room_priorities=[],
    player_matches={})


# helper functions

def update_client_for_player(player_id, player_router):
    """Update the client state for a single player.

    Parameters
    ----------
    player_id : str
        The ID for the player whose client needs its state set.
    player_router : PlayerRouter
        The player router that maintains the global state.
    """
    player_data = player_router.players[player_id].to_dict()
    room_id = player_router.player_matches.get(player_id)
    if room_id is not None:
        game_room_data = player_router.game_rooms[room_id].to_dict()
    else:
        game_room_data = None

    flask_socketio.emit(
        'setClientState',
        {
            'player': player_data,
            'gameRoom': game_room_data
        },
        room=player_id)


def update_clients_for_game_room(room_id, player_router):
    """Update the client states for each player in a game room.

    Parameters
    ----------
    room_id : str
        The ID for the game room whose players need updating.
    player_router : PlayerRouter
        The player router that maintains global state.
    """
    game_room = player_router.game_rooms[room_id]
    for player_id in game_room.player_ids:
        update_client_for_player(player_id, player_router)


# Web Page Endpoints

@twentyquestions.route('/game-room')
def index(player_id):
    """The entrypoint for the games."""
    return flask.render_template('index.html')


# Web Socket Endpoints

@socketio.on('joinServer')
def join_server(message):
    """Websocket endpoint for a player to join the server.

    Parameters
    ----------
    message : dict
        a dictionary containing a 'playerId' key mapping to the client's
        playerId.
    """
    player_id = message['playerId']

    if player_id is None:
        # The client is previewing the HIT but not yet looking for a
        # game.
        return

    # put the player in a room addressed by player id so that we can
    # communicate with them later.
    flask_socketio.join_room(player_id)

    if player_id not in player_router.players:
        player_router.create_player(player_id)

    # update everyone in the game room to which the player was matched
    room_id = player_router.player_matches[player_id]
    update_clients_for_game_room(room_id, player_router)


@socketio.on('setServerGameState')
def set_server_game_state(message):
    """Websocket endpoint for clients to set the server's game state.

    Parameters
    ----------
    message : dict
        A message from the client that contains the serialized state for
        their player and game room.
    """
    player = models.Player.from_dict(message['player'])
    game_room = models.GameRoom.from_dict(message['gameRoom'])

    # update the game room
    player_router.update_game(
        player_id=player.player_id,
        game=game_room.game)

    # update the clients
    update_clients_for_game_room(
        game_room.room_id,
        player_router)


@socketio.on('takePlayerAction')
def take_player_action(message):
    """Websocket endpoint for clients to take a player action.

    Parameters
    ----------
    message : dict
        A message from the client that contains the action's name and
        the player id.
    """
    player = models.Player.from_dict(message['player'])
    action = message['action']

    player_id = player.player_id
    room_id = player_router.player_matches[player_id]

    if action == models.PLAYERACTIONS['STARTPLAYING']:
        player_router.start_playing(player_id)
    elif action == models.PLAYERACTIONS['FINISHGAME']:
        player_router.finish_game(player_id)
    elif action == models.PLAYERACTIONS['GOINACTIVE']:
        player_router.go_inactive(player_id)
    elif action == models.PLAYERACTIONS['GOACTIVE']:
        player_router.go_active(player_id)
    else:
        raise ValueError('Action not recognized.')

    # update the clients
    if room_id is None:
        # the player is not currently in a game room, update only the
        # player
        update_client_for_player(player_id, player_router)
    else:
        # the player is currently in a game room, update all
        # participants in the game
        update_clients_for_game_room(room_id, player_router)

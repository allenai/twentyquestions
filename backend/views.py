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


# Player Routing Views

player_router = models.PlayerRouter(
    game_rooms={},
    players={},
    game_room_priorities=[],
    player_matches={})


@twentyquestions.route('/waiting-room')
def waiting_room():
    """A room to wait to enter a game.

    This page routes Turkers into either a newly created game, or a game
    that has an abandoned player.
    """
    return flask.render_template('index.html')


@twentyquestions.route(
    '/game-room/<string:room_id>/player/<string:player_id>')
def game_room(room_id, player_id):
    """A room to play the game in."""
    return flask.render_template('index.html')


@socketio.on('joinWaitingRoom')
def join_waiting_room(message):
    """Websocket endpoint for a player to join the waiting room.

    Parameters
    ----------
    message : dict
        a dictionary containing a 'playerId' key mapping to the client's
        playerId.
    """
    player_id = message['playerId']

    if player_id is None:
        # The client is previewing the waiting room page, but not
        # actually looking for a game.
        return

    # put the player in their own personal room
    flask_socketio.join_room(player_id)

    # Make sure the player is matched to a game
    player_router.route_player(player_id)

    player = player_router.players[player_id]
    if player.status == models.PLAYERSTATUSES['INACTIVE']:
        return

    room_id = player_router.player_matches[player_id]
    game_room = player_router.game_rooms[room_id]

    num_players = len(game_room.player_ids)
    if num_players == models.REQUIREDPLAYERS:
        # notify the entering players that they can start playing
        for player_id in game_room.player_ids:
            flask_socketio.emit(
                'readyToPlay',
                {'roomId': room_id},
                room=player_id)


@socketio.on('joinGameRoom')
def join_game_room(message):
    """Websocket endpoint for a player to join a game room.

    Parameters
    ----------
    message : dict
        A message from the client containing the ``roomId`` string and
        the ``playerId`` string for that client.
    """
    room_id = message['roomId']
    player_id = message['playerId']

    if room_id not in player_router.game_rooms:
        raise ValueError(
            'A player must enter a game room through the waiting room.')

    game_room = player_router.game_rooms[room_id]
    player = player_router.players[player_id]
    if (player.player_id == game_room.game.answerer_id
        or player.player_id == game_room.game.asker_id):
        pass
    elif game_room.game.answerer_id is None:
        player_router.game_rooms[room_id] = game_room.copy(
            game=game_room.game.copy(
                answerer_id=player.player_id))
    elif game_room.game.asker_id is None:
        player_router.game_rooms[room_id] = game_room.copy(
            game=game_room.game.copy(
                asker_id=player.player_id))
    else:
        raise ValueError(
            'A game can only have one asker and one answerer.')

    flask_socketio.join_room(room_id)
    flask_socketio.emit(
        'setClientGameState',
        player_router.game_rooms[room_id].game.to_dict(),
        room=room_id)


@socketio.on('setServerGameState')
def set_server_game_state(message):
    """Websocket endpoint for broadcasting game state.

    Clients use this websocket endpoint for broadcasting updated game
    state after they make a move.

    Parameters
    ----------
    message : dict
        A message from the client that contains their room id, player
        id, and the entire serialized game state.
    """
    room_id = message['roomId']
    player_id = message['playerId']

    game = models.Game.from_dict(message['game'])

    # update the game room
    player_router.game_rooms[room_id] = \
        player_router.game_rooms[room_id].copy(game=game)

    # update the clients
    flask_socketio.emit(
        'setClientGameState',
        game.to_dict(),
        room=room_id)


@socketio.on('setPlayerAsInactive')
def set_player_as_inactive(message):
    """Websocket endpoint for setting a player as inactive.

    Parameters
    ----------
    message : dict
        a dictionary containing a 'playerId' key mapping to the client's
        playerId.
    """
    player_id = message['playerId']

    room_id = player_router.player_matches.get(player_id)

    player_router.set_player_as_inactive(player_id)

    # if the player was in a room, update the room to reflect that
    # they've been booted.
    if room_id:
        flask_socketio.emit(
            'setClientGameState',
            player_router.game_rooms[room_id].game.to_dict(),
            room=room_id)

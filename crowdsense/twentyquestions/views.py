"""Views for ``crowdsense.twentyquestions``"""

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


# Waiting Room Views

# Dict[str, WaitingRoom]
#     a dictionary mapping room id strings to WaitingRoom instances
waiting_rooms = {}


@twentyquestions.route('/waiting-room')
def waiting_room():
    """A room to wait for a quorum of players.

    This page allows Turkers to wait for a quorum of players to enter
    the room before starting the game. It also serves as an entry point
    for subsequent players.
    """
    return flask.render_template(
        'twentyquestions/waitingroom.html')


@socketio.on('joinWaitingRoom', namespace='/waiting-room')
def join_waiting_room(message):
    """Websocket endpoint for a player to join a waiting room.

    Parameters
    ----------
    message : dict
        A message from the client containing the ``roomId`` string and
        the ``playerId`` string for that client.
    """
    room_id = message['roomId']
    player_id = message['playerId']

    if room_id not in waiting_rooms:
        player_ids = [player_id] if player_id is not None else []
        new_waiting_room = models.WaitingRoom(
            room_id=room_id,
            player_ids=player_ids,
            quorum=settings.QUORUM)
    else:
        old_waiting_room = waiting_rooms[room_id]
        room_player_ids = waiting_rooms[room_id].player_ids

        if player_id in room_player_ids or player_id is None:
            new_waiting_room = old_waiting_room
        else:
            new_waiting_room = old_waiting_room.copy(
                player_ids=old_waiting_room.player_ids + [player_id])

    waiting_rooms[room_id] = new_waiting_room

    # join the room for the entire waiting room
    flask_socketio.join_room(room_id)
    # join a room for just this player so that we can send them messages
    # individually
    flask_socketio.join_room(player_id)
    # set the client waiting room state
    flask_socketio.emit(
        'setClientWaitingRoom',
        new_waiting_room.to_dict(),
        room=room_id)


# Game Room Views

# Dict[str, Game]
#     a dictionary mapping room id strings to GameRoom instances.
game_rooms = {}


@twentyquestions.route(
    '/game-room/<string:room_id>/player/<string:player_id>')
def game_room(room_id, player_id):
    """A room to play the game in."""
    return flask.render_template(
        'twentyquestions/gameroom.html')


@socketio.on(
    'joinGameRoom',
    namespace='/game-room')
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

    if room_id not in game_rooms:
        new_game_room = models.GameRoom(
            room_id=room_id,
            game=models.Game(
                players=[
                    models.Player(player_id=player_id)
                ],
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id=player_id,
                asker_id=None,
                round_=models.Round(
                    subject=None,
                    guess=None,
                    question_and_answers=[])))
    else:
        old_game_room = game_rooms[room_id]
        old_game = old_game_room.game
        room_player_ids = [
            player.player_id
            for player in game_rooms[room_id].game.players
        ]
        if player_id not in room_player_ids:
            player = models.Player(player_id=player_id)
            if old_game_room.game.asker_id is None:
                new_game_room = old_game_room.copy(
                    game=old_game.copy(
                        players=old_game.players + [player],
                        asker_id=player_id))
            else:
                raise ValueError(
                    'There can only be one asker in a game.')
        else:
            new_game_room = old_game_room

    game_rooms[room_id] = new_game_room

    flask_socketio.join_room(room_id)
    flask_socketio.emit(
        'setClientGameState',
        new_game_room.game.to_dict(),
        room=room_id)


@socketio.on(
    'setServerGameState',
    namespace='/game-room')
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
    game_rooms[room_id] = game_rooms[room_id].copy(game=game)

    # update the clients
    flask_socketio.emit(
        'setClientGameState',
        game.to_dict(),
        room=room_id)

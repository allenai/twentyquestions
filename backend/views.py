"""Views for the backend."""

import logging
import random

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

socketio = flask_socketio.SocketIO(
    ping_timeout=settings.TIME_TO_DISCONNECT,
    ping_interval=settings.TIME_TO_DISCONNECT // 5)


# constants / global state

# the subjects to start games with
with open(settings.SUBJECTS_FILE_PATH, 'r') as subjects_file:
    subjects = [
        ln.strip().lower() for ln in subjects_file
    ]
random.shuffle(subjects)

# maps between session IDs and player IDs
# these maps are necessary for handling connection events
player_id_from_sid = {}
most_recent_sid_from_player_id = {}

player_router = models.PlayerRouter(
    game_rooms={},
    players={},
    game_room_priorities=[],
    player_matches={})


# helper functions

def update_client_for_player(player_id):
    """Update the client state for a single player.

    Parameters
    ----------
    player_id : str
        The ID for the player whose client needs its state set.
    """
    room_id = player_router.player_matches.get(player_id)

    player_data = player_router.players[player_id].to_dict()

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


def update_clients_for_game_room(room_id):
    """Update the client states for each player in a game room.

    Parameters
    ----------
    room_id : str
        The ID for the game room whose players need updating.
    """
    game_room = player_router.game_rooms[room_id]
    for player_id in game_room.player_ids:
        update_client_for_player(player_id)


# Web Page Endpoints

@twentyquestions.route('/game-room')
def game_room():
    """The entrypoint for the games."""
    return flask.render_template('index.html')


# Web Socket Endpoints

@socketio.on('connect')
def connect():
    """Websocket endpoint for when a player connects."""
    sid = flask.request.sid

    logger.info(f'New connection (SID {sid}).')


@socketio.on('disconnect')
def disconnect():
    """Websocket endpoint for when a player disconnects."""
    sid = flask.request.sid

    logger.info(f'Dropping connection (SID {sid}).')

    player_id = player_id_from_sid.get(sid)
    most_recent_sid = most_recent_sid_from_player_id.get(player_id)
    if player_id is None:
        # the client connected but never started a game
        logger.info(
            f'No player corresponding to SID {sid} found on server.')
    elif player_id not in player_router.player_matches:
        logger.info(
            f'Player {player_id} is not matched to a game. Most likely'
            f' the player finished a game and has been deleted.')
        if player_id in most_recent_sid_from_player_id:
            del most_recent_sid_from_player_id[player_id]
        if sid in player_id_from_sid:
            del player_id_from_sid[sid]
    elif sid == most_recent_sid:
        # the player has dropped the connection represented by SID and
        # hasn't established a new connection yet, so we'll delete the
        # player.
        logger.info(
            f'Disconnecting player {player_id} from server.')

        # fetch the room the player is in
        room_id = player_router.player_matches[player_id]

        # delete the player
        player_router.delete_player(player_id)

        # delete the player's connection information
        del most_recent_sid_from_player_id[player_id]
        del player_id_from_sid[sid]

        if room_id not in player_router.game_rooms:
            # Normally, the player and the game are deleted when the
            # player submits the game to MTurk, in which case this
            # branch of the if / else block won't be executed. If a
            # player leaves a game in the FINISHGAME state without
            # having submitted the game, then the game room will have
            # been deleted when we deleted the player a few lines up. We
            # don't want to try and update the other members of the game
            # room in this case since the room doesn't exist.
            #
            # It's strange for a turker to abandon the game in the
            # FINISHGAME state without submitting, since all they have
            # to do is click a button to get money, so log a warning.
            logger.warning(
                f'Player {player_id} disconnecting from a game that'
                f' does not exist ({room_id}).')
        elif room_id is not None:
            update_clients_for_game_room(room_id)
    else:
        logger.info(
            f'Player {player_id} has previously reconnected.'
            f' Old connection (SID {sid}) has been dropped.')

        # delete the old / unused connection sid
        del player_id_from_sid[sid]


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
    sid = flask.request.sid

    if player_id is None:
        # The client is previewing the HIT, ignore them
        logger.info(
            f'SID {sid} is previewing the server.')
        return

    if player_id in most_recent_sid_from_player_id:
        old_sid = most_recent_sid_from_player_id[player_id]
        logger.info(
            f'Player {player_id} reconnecting to server.'
            f' Updating SID from {old_sid} to {sid}.')
    else:
        logger.info(
            f'Player {player_id} connecting to server with SID {sid}')

    # record the sid <-> player_id mappings
    player_id_from_sid[sid] = player_id
    most_recent_sid_from_player_id[player_id] = sid

    # put the player in a room addressed by player id so that we can
    # communicate with them later.
    flask_socketio.join_room(player_id)

    if player_id not in player_router.players:
        player_router.create_player(player_id)

        # we want to set the subject for the games currently, so
        # update the game state with the new subject.
        room_id = player_router.player_matches[player_id]
        game = player_router.game_rooms[room_id].game
        if (
                game.state == models.STATES['CHOOSESUBJECT']
                and len(subjects) > 0
        ):
            player_router.update_game(
                player_id=player_id,
                game=game.copy(
                    state=models.STATES['ASKQUESTION'],
                    round_=game.round_.copy(subject=subjects.pop())))

    # update the clients
    room_id = player_router.player_matches[player_id]
    if room_id is None:
        update_client_for_player(player_id)
    else:
        update_clients_for_game_room(room_id)


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

    player_id = player.player_id
    room_id = game_room.room_id

    logger.info(
        f'Player {player_id} setting game state for room {room_id}.')

    # update the game room
    player_router.update_game(
        player_id=player_id,
        game=game_room.game)

    # update the clients
    update_clients_for_game_room(room_id)


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
    old_room_id = player_router.player_matches[player_id]

    logger.info(f'Player {player_id} taking action {action}')

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

    # the logic for updating clients depends on whether or not the
    # player changed rooms.
    room_id = player_router.player_matches.get(player_id)
    if room_id is None and old_room_id is None:
        update_client_for_player(player_id)
    elif room_id is None and old_room_id is not None:
        update_client_for_player(player_id)
        update_clients_for_game_room(old_room_id)
    elif room_id is not None and old_room_id is None:
        update_clients_for_game_room(room_id)
    elif room_id is not None and old_room_id is not None:
        update_clients_for_game_room(room_id)
        if old_room_id != room_id:
            update_clients_for_game_room(old_room_id)

"""Settings and constants for crowdsense."""

import os


# paths

REPO_DIR = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

DOCKERFILE = os.path.join(REPO_DIR, 'Dockerfile')

WAITING_ROOM_DIR = os.path.join(REPO_DIR, 'waiting-room')
WAITING_ROOM_INDEX = os.path.join(
    WAITING_ROOM_DIR, 'dist/waitingroom.html')
WAITING_ROOM_BUNDLE = os.path.join(
    WAITING_ROOM_DIR,
    'dist/twenty-questions/static/twentyquestions/waitingroom.bundle.js')

GAME_ROOM_DIR = os.path.join(REPO_DIR, 'game-room')
GAME_ROOM_INDEX = os.path.join(
    GAME_ROOM_DIR, 'dist/gameroom.html')
GAME_ROOM_BUNDLE = os.path.join(
    GAME_ROOM_DIR,
    'dist/twenty-questions/static/twentyquestions/gameroom.bundle.js')

BACKEND_TEMPLATES_DIR = os.path.join(
    REPO_DIR,
    'crowdsense/twentyquestions/templates/twentyquestions')
BACKEND_STATIC_DIR = os.path.join(
    REPO_DIR,
    'crowdsense/twentyquestions/static/twentyquestions')

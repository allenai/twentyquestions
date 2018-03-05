"""Build crowdsense.

See ``python build.py --help`` for more information.
"""

import logging
import shutil
import subprocess

import click

from crowdsense import settings


logger = logging.getLogger(__name__)


@click.command(
    context_settings={
        'help_option_names': ['-h', '--help']
    })
def build():
    """Build crowdsense.

    Build crowdsense by building the frontend clients and copying them
    into the proper locations for the backend.
    """
    # build the waiting room client
    subprocess.run(
        ['npm', 'run', 'build'],
        cwd=settings.WAITING_ROOM_DIR)

    # build the game room client
    subprocess.run(
        ['npm', 'run', 'build'],
        cwd=settings.GAME_ROOM_DIR)

    # copy the index files to the backend's templates folder
    shutil.copy(
        settings.WAITING_ROOM_INDEX,
        settings.BACKEND_TEMPLATES_DIR)
    shutil.copy(
        settings.GAME_ROOM_INDEX,
        settings.BACKEND_TEMPLATES_DIR)

    # copy the bundle files to the backend's static directory
    shutil.copy(
        settings.WAITING_ROOM_BUNDLE,
        settings.BACKEND_STATIC_DIR)
    shutil.copy(
        settings.GAME_ROOM_BUNDLE,
        settings.BACKEND_STATIC_DIR)


if __name__ == '__main__':
    build()

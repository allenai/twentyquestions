"""Build twentyquestions.

See ``python build.py --help`` for more information.
"""

import logging
import shutil
import subprocess

import click

from backend import settings


logger = logging.getLogger(__name__)


@click.command(
    context_settings={
        'help_option_names': ['-h', '--help']
    })
def build():
    """Build twentyquestions.

    Build twentyquestions by building the frontend clients and copying them
    into the proper locations for the backend.
    """
    # build the waiting room client
    subprocess.run(
        ['npm', 'run', 'build'],
        cwd=settings.FRONTEND_DIR)

    # copy the index file to the backend's templates folder
    shutil.copy(
        settings.FRONTEND_INDEX,
        settings.BACKEND_TEMPLATES_DIR)

    # copy the bundle file to the backend's static directory
    shutil.copy(
        settings.FRONTEND_BUNDLE,
        settings.BACKEND_STATIC_DIR)


if __name__ == '__main__':
    build()

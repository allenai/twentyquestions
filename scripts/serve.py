"""Serve twentyquestions.

See ``python serve.py --help`` for more information.
"""

import logging

import click

import backend
from backend import views


logger = logging.getLogger(__name__)


@click.command(
    context_settings={
        'help_option_names': ['-h', '--help']
    })
def serve():
    """Serve twentyquestions on port 5000."""
    logger.info('Running prod server on http://127.0.0.1:5000/')

    # flask socketio has it's own functionality for serving the app
    views.socketio.run(backend.app)


if __name__ == '__main__':
    serve()

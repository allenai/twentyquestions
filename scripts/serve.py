"""Serve twentyquestions.

See ``python serve.py --help`` for more information.
"""

import logging

import click
from gevent.wsgi import WSGIServer

import backend


logger = logging.getLogger(__name__)


@click.command(
    context_settings={
        'help_option_names': ['-h', '--help']
    })
def serve():
    """Serve twentyquestions on port 5000."""
    logger.info('Running prod server on http://127.0.0.1:5000/')

    http_server = WSGIServer(('0.0.0.0', 5000), backend.app)
    http_server.serve_forever()


if __name__ == '__main__':
    serve()

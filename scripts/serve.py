"""Serve twentyquestions.

See ``python serve.py --help`` for more information.
"""

import logging

import click
from gevent.wsgi import WSGIServer

import backend
from backend import settings


logger = logging.getLogger(__name__)


@click.command(
    context_settings={
        'help_option_names': ['-h', '--help']
    })
@click.option(
    '--debug', '-d',
    is_flag=True,
    help='Run the server in debug mode.')
def serve(debug=False):
    """Serve twentyquestions on port 5000."""

    if debug:
        logger.info('Running debug server on http://127.0.0.1:5000/')
        backend.app.run(host='0.0.0.0', debug=True)
    else:
        logger.info('Running prod server on http://127.0.0.1:5000/')
        http_server = WSGIServer(('0.0.0.0', 5000), backend.app)
        http_server.serve_forever()


if __name__ == '__main__':
    serve()

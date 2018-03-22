"""A backend for playing twentyquestions."""

import logging

import flask

from crowdsense.views import (
    twentyquestions,
    socketio)


logger = logging.getLogger(__name__)


app = flask.Flask(__name__)


@app.route('/')
def root():
    """A root page for twentyquestions."""
    return (
        'This server is used by the Allen Institute for Artificial'
        ' Intelligence to crowdsource common sense by playing 20'
        ' Questions.',
        200
    )


# register blueprints

app.register_blueprint(
    twentyquestions, url_prefix='/twenty-questions')


# set up the web socket
socketio.init_app(app)

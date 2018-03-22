"""A backend for playing twenty questions."""

import logging

import flask

from backend.views import (
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
app.register_blueprint(twentyquestions)


# set up the web socket
socketio.init_app(app)

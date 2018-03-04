"""The server for crowdsense."""

import logging

import flask

from crowdsense.home import home
from crowdsense.twentyquestions import twentyquestions, socketio


logger = logging.getLogger(__name__)


app = flask.Flask(__name__)


@app.route('/')
def index():
    """Redirect to home."""
    return flask.redirect(flask.url_for('home.index'))


# register blueprints

app.register_blueprint(
    home, url_prefix='/home')
app.register_blueprint(
    twentyquestions, url_prefix='/twenty-questions')


# set up the web socket
socketio.init_app(app)

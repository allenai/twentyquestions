"""The server for crowdsense."""

import logging

import flask

from crowdsense.home import home


logger = logging.getLogger(__name__)


app = flask.Flask(__name__)


@app.route('/')
def index():
    """Redirect to home."""
    return flask.redirect(flask.url_for('home.index'))


# register blueprints

app.register_blueprint(
    home, url_prefix='/home')

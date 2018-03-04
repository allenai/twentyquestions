"""Views for ``crowdsense.home``."""

import logging

import flask


logger = logging.getLogger(__name__)


home = flask.Blueprint(
    'home',
    __name__,
    template_folder='templates',
    static_folder='static')


@home.route('/')
def index():
    """An informational page describing crowdsense."""
    return flask.render_template('home/index.html.j2')

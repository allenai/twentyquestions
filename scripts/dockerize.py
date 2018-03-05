"""Create the docker image for running crowdsense.

See ``python dockerize.py --help`` for more information.
"""

import logging
import subprocess

import click

from crowdsense import settings


logger = logging.getLogger(__name__)


@click.command(
    context_settings={
        'help_option_names': ['-h', '--help']
    })
def dockerize():
    """Create the docker image for running crowdsense.

    Create the docker image for running crowdsense. The created image
    will be tagged 'crowdsense'.
    """
    # build the docker image
    subprocess.run(
        [
            'docker',
            'build',
            '-t', 'crowdsense/server',
            '-f', settings.DOCKERFILE,
            '.'
        ])


if __name__ == '__main__':
    dockerize()

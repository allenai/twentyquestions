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
    local_env = settings.ENVS['local']

    registry = settings.CONTAINER_REGISTRY
    docker_repo = settings.PROJECT_ID
    image_name = settings.SERVER_IMAGE_NAME

    # build the docker image
    subprocess.run([
        'docker', 'build',
        '--tag', f'{registry}/{docker_repo}/{image_name}:{local_env}',
        '--file', settings.DOCKERFILE,
        '.'
    ])


if __name__ == '__main__':
    dockerize()

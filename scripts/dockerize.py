"""Create the docker image for running twentyquestions.

See ``python dockerize.py --help`` for more information.
"""

import logging
import subprocess

import click

from backend import settings


logger = logging.getLogger(__name__)


@click.command(
    context_settings={
        'help_option_names': ['-h', '--help']
    })
def dockerize():
    """Create the docker image for running twentyquestions.

    Create the docker image for running twentyquestions. The created image
    will be tagged 'twentyquestions'.
    """
    local_env = settings.ENVS['local']

    registry = settings.CONTAINER_REGISTRY_URL
    docker_repo = settings.CONTAINER_REGISTRY_USER
    image_name = settings.CONTAINER_REGISTRY_IMAGE_NAME

    # build the docker image
    subprocess.run([
        'docker', 'build',
        '--tag', f'{registry}/{docker_repo}/{image_name}:{local_env}',
        '--file', settings.DOCKERFILE,
        '.'
    ])


if __name__ == '__main__':
    dockerize()

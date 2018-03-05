"""Promote a docker image.

See ``python promote.py --help`` for more information.
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
@click.argument(
    'source',
    type=click.Choice(settings.ENVS.values()))
@click.argument(
    'dest',
    type=click.Choice(settings.ENVS.values()))
def promote(source, dest):
    """Promote the docker image from SOURCE to DEST.

    Promote a docker image, for example promote the docker image for the
    local environment to the dev environment. Promoting a docker images
    involves re-tagging the image locally with the proper label and then
    pushing the image to Google Container Registry.

    SOURCE and DEST must be valid environments for crowdsense.
    """
    registry = settings.CONTAINER_REGISTRY
    docker_repo = settings.PROJECT_ID
    image_name = settings.SERVER_IMAGE_NAME

    logger.info(f'Promoting {source} to {dest}')
    subprocess.run([
        'docker', 'tag',
        f'{registry}/{docker_repo}/{image_name}:{source}',
        f'{registry}/{docker_repo}/{image_name}:{dest}'
    ])

    logger.info(f'Pushing {dest} to GCR')
    subprocess.run([
        'gcloud', 'docker', '--', 'push',
        f'{registry}/{docker_repo}/{image_name}:{dest}'
    ])


if __name__ == '__main__':
    promote()

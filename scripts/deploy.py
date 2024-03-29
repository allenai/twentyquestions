"""Deploy twentyquestions.

See ``python deploy.py --help`` for more information.
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
@click.argument(
    'env',
    type=click.Choice(settings.ENVS.values()))
@click.argument(
    'cert',
    type=click.Path(exists=True, file_okay=True, dir_okay=False))
@click.argument(
    'key',
    type=click.Path(exists=True, file_okay=True, dir_okay=False))
def deploy(env, cert, key):
    """Deploy twentyquestions to ENV.

    Deploy the current docker image for ENV to kubernetes using the
    certificate defined by CERT and KEY to provide HTTPS traffic.
    """
    registry = settings.CONTAINER_REGISTRY_URL
    docker_repo = settings.CONTAINER_REGISTRY_USER
    image_name = settings.CONTAINER_REGISTRY_IMAGE_NAME

    kubernetes_config = settings.KUBERNETES_CONFIG
    cert_secret_name = settings.CERT_SECRET_NAME

    logger.info('Deleting any previous secret for certificate.')
    process = subprocess.run(
        [
            'kubectl', 'delete', 'secret',
            cert_secret_name
        ],
        stderr=subprocess.PIPE)
    if not (process.returncode == 0
            or b'Error from server (NotFound)' in process.stderr):
        process.check_returncode()

    logger.info('Creating secret for certificate.')
    subprocess.run([
        'kubectl', 'create', 'secret', 'tls',
        cert_secret_name,
        f'--cert={cert}',
        f'--key={key}'
    ])

    logger.info(f'Deploying to kubernetes.')
    # to guarantee that the pod pulls the new docker images, we first
    # scale it down to zero then reapply the original settings to scale
    # it back up.
    subprocess.run([
        'kubectl',
        'scale', '--replicas=0',
        '-f', kubernetes_config
    ])
    subprocess.run([
        'kubectl', 'apply',
        '-f', kubernetes_config
    ])


if __name__ == '__main__':
    deploy()

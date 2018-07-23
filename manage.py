"""Management commands for twentyquestions."""

import logging
import sys

import click

import scripts


logger = logging.getLogger(__name__)

LOG_FORMAT = '%(asctime)s:%(levelname)s:%(name)s:%(message)s'


@click.group(
    context_settings={
        'help_option_names': ['-h', '--help']
    })
@click.option(
    '--verbose', '-v',
    is_flag=True,
    help='Turn on verbose logging for debugging purposes.')
@click.option(
    '--log-file', '-l',
    type=str,
    help='Log to the provided file path instead of stdout.')
def manage(verbose, log_file):
    """A high-level interface to admin scripts for twentyquestions."""
    log_level = logging.DEBUG if verbose else logging.INFO

    if log_file:
        logging.basicConfig(
            filename=log_file,
            filemode='a',
            format=LOG_FORMAT,
            level=log_level)
    else:
        logging.basicConfig(
            stream=sys.stdout,
            format=LOG_FORMAT,
            level=log_level)


subcommands = [
    scripts.build,
    scripts.deploy,
    scripts.dockerize,
    scripts.extractgames,
    scripts.extractlabels,
    scripts.extractmirrorsubjects,
    scripts.extractquality,
    scripts.extractquestions,
    scripts.groupbysubject,
    scripts.preparemirrorsubjects,
    scripts.promote,
    scripts.serve
]

for subcommand in subcommands:
    manage.add_command(subcommand)


if __name__ == '__main__':
    manage()

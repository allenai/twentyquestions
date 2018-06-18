"""Extract games from 20 Questions game HITs.

See ``python extractgames.py --help`` for more information.
"""

import json
import logging

import click

from scripts import _utils


logger = logging.getLogger(__name__)


# main function

@click.command(
    context_settings={
        'help_option_names': ['-h', '--help']
        })
@click.argument(
    'xml_dir',
    type=click.Path(exists=True, file_okay=False, dir_okay=True))
@click.argument(
    'output_path',
    type=click.Path(exists=False, file_okay=True, dir_okay=False))
def extractgames(xml_dir, output_path):
    """Extract games from XML_DIR and write to OUTPUT_PATH.

    Extract the 20 Questions game data from a batch of 20 Questions
    HITs. XML_DIR should be the XML directory of one of the 20 Questions
    HIT batches, extracted with AMTI. OUTPUT_PATH is the location to
    which the data will be written.
    """
    # submissions : the form data submitted from the twentyquestions
    # HITs as a list of dictionaries mapping the question identifiers to
    # the free text, i.e.:
    #
    #     [{'gameRoomJson': game_room_json_string}, ...]
    #
    submissions = _utils.extract_xml_dir(xml_dir)

    # deduplicate the games because each crowdworker who participates in
    # the game submits a copy of the game data.
    game_jsons = set([
        submission['gameRoomJson']
        for submission in submissions
    ])

    # write out the data
    with click.open_file(output_path, 'w') as output_file:
        output_file.write('\n'.join(game_jsons))


if __name__ == '__main__':
    extractgames()

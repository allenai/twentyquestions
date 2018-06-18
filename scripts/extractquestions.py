"""Extract subject-question-answer triples from 20 Questions game HITs.

See ``python extractquestions.py --help`` for more information.
"""

import collections
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
def extractquestions(xml_dir, output_path):
    """Extract questions from XML_DIR and write to OUTPUT_PATH.

    Extract all unique subject-question-answer triples from a batch of
    20 Questions HITs. XML_DIR should be the XML directory of one of
    the 20 Questions HIT batches, extracted with AMTI. OUTPUT_PATH is
    the location to which the data will be written.
    """
    # submissions : the form data submitted from the twentyquestions
    #   HITs as a list of dictionaries mapping the question identifiers
    #   to the free text, i.e.:
    #
    #     [{'gameRoomJson': game_room_json_string}, ...]
    #
    submissions = _utils.extract_xml_dir(xml_dir)

    # extract the rows from the game room jsons
    row_strs = set()
    for submission in submissions:
        data = json.loads(submission['gameRoomJson'])

        # generate all the subject-question-answer triples created
        # during the game.
        subject = data['game']['round']['subject']
        for questionAndAnswer in data['game']['round']['questionAndAnswers']:
            # use an OrderedDict so the keys appear in the right order
            # in the JSON.
            row = collections.OrderedDict([
                ('subject', subject),
                ('question', questionAndAnswer['question']['questionText']),
                ('answer', questionAndAnswer['answer']['answerValue'])
            ])
            row_strs.add(json.dumps(row))

    # write out the data
    with click.open_file(output_path, 'w') as output_file:
        output_file.write('\n'.join(sorted(row_strs)))


if __name__ == '__main__':
    extractquestions()

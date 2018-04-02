"""Extract triples from 20 Questions results.

See ``python extractgames.py --help`` for more information.
"""

import html
import json
import logging
import os
from xml.dom.minidom import parseString

import click


logger = logging.getLogger(__name__)


@click.command(
    context_settings={
        'help_option_names': ['-h', '--help']
        })
@click.argument(
    'xml_dir',
    type=click.Path(exists=True, file_okay=False, dir_okay=True))
@click.argument(
    'output_dir',
    type=click.Path(exists=True, file_okay=False, dir_okay=True))
def extractgames(xml_dir, output_dir):
    """Extract 20 Questions data from XML_DIR and write to OUTPUT_DIR.

    Extract the 20 Questions data (all unique [subject, question,
    answer] triples as well as the game data) from a batch of 20
    Questions HITs. XML_DIR should be an XML directory extracted with
    AMTI of one of the 20 Questions HIT batches. OUTPUT_DIR is the
    location to which the data will be written as 'fullgames.jsonl' and
    'triples.jsonl'.
    """
    triples = set()
    full_games = set()
    for dirpath, dirnames, filenames in os.walk(xml_dir):
        for filename in filenames:
            # skip non-xml files
            if not '.xml' in filename:
                continue

            # extract the game encoded by MTurk
            with open(os.path.join(dirpath, filename), 'r') as f_in:
                results_xml = parseString(f_in.read())
            [free_text] = results_xml.getElementsByTagName('FreeText')
            [text_node] = free_text.childNodes

            # unescape and read in the JSON data
            data_str = html.unescape(text_node.nodeValue)
            data = json.loads(data_str)

            # record all the triples generated during the game
            subject = data['game']['round']['subject']
            for questionAndAnswer in data['game']['round']['questionAndAnswers']:
                triple = (
                    subject,
                    questionAndAnswer['question']['questionText'],
                    questionAndAnswer['answer']['answerBool']
                )
                triples.add(json.dumps(triple))

            # record the full game data
            full_games.add(data_str)

    # write out the data to files

    with open('fullgames.jsonl', 'w') as f_out:
        f_out.write('\n'.join(full_games))

    with open('triples.jsonl', 'w') as f_out:
        f_out.write('\n'.join(triples))


if __name__ == '__main__':
    extractgames()

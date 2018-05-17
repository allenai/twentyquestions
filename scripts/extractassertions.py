"""Extract assertions from 20 Questions questions to assertions HITs.

See ``python extractassertions.py --help`` for more information.
"""

import collections
import html
import json
import logging
import os
from xml.dom import minidom

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
    'output_dir',
    type=click.Path(exists=True, file_okay=False, dir_okay=True))
def extractassertions(xml_dir, output_dir):
    """Extract assertions data from XML_DIR and write to OUTPUT_DIR.

    Extract the assertions data from a batch of the question to assertion
    HITs. XML_DIR should be an XML directory extracted with
    AMTI. OUTPUT_DIR is the location to which the data will be written
    as 'assertions.jsonl' in a JSON Lines format.
    """
    assertions_output_path = os.path.join(
        output_dir, 'assertions.jsonl')

    rows = []
    for dirpath, dirnames, filenames in os.walk(xml_dir):
        for filename in filenames:
            # skip non-xml files
            if not '.xml' in filename:
                continue

            logger.debug(f'Processing {filename}.')

            # extract the annotations to jsonl
            with open(os.path.join(dirpath, filename), 'r') as f_in:
                results_xml = minidom.parseString(f_in.read())

            data = collections.defaultdict(dict)
            for answer_tag in results_xml.getElementsByTagName('Answer'):
                [question_identifier_tag] = answer_tag.getElementsByTagName(
                    'QuestionIdentifier')
                question_identifier = _utils.get_node_text(question_identifier_tag)
                [free_text_tag] = answer_tag.getElementsByTagName(
                    'FreeText')
                free_text = html.unescape(_utils.get_node_text(free_text_tag))

                attribute, idx = question_identifier.split('-')

                # coerce the data types correctly
                if attribute in ['pk', 'score']:
                    data[idx][attribute] = int(free_text)
                else:
                    data[idx][attribute] = free_text

            for _, row in data.items():
                rows.append(row)

    # write out the data to files
    with open(assertions_output_path, 'w') as f_out:
        f_out.write(
            '\n'.join([
                json.dumps(row)
                for row in sorted(
                        rows,
                        key=lambda r: r['pk'])
            ]))


if __name__ == '__main__':
    extractassertions()

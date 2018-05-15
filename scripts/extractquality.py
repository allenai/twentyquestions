"""Extract quality annotations from 20 Questions quality control HITs.n

See ``python extractquality.py --help`` for more information.
"""

import collections
import html
import json
import logging
import os
from xml.dom import minidom

import click


logger = logging.getLogger(__name__)


# helper functions

def _get_text(node):
    """Return the text from a node that has only text as content.

    Calling this function on a node with multiple children or a non-text
    node child raises a ``ValueError``.

    Parameters
    ----------
    node : xml.dom.minidom.Node
        The node to extract text from.

    Returns
    -------
    str
        The text from node.
    """
    if len(node.childNodes) != 1:
        raise ValueError(
            f'node ({node}) has multiple child nodes.')
    if not isinstance(node.childNodes[0], minidom.Text):
        raise ValueError(
            f"node's ({node}) is not a Text node.")
    return node.childNodes[0].wholeText


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
def extractquality(xml_dir, output_dir):
    """Extract quality annotations from XML_DIR and write to OUTPUT_DIR.

    Extract the quality annotations from a batch of the quality control
    HITs. XML_DIR should be an XML directory extracted with
    AMTI. OUTPUT_DIR is the location to which the data will be written
    as 'quality.jsonl'.
    """
    quality_output_path = os.path.join(output_dir, 'quality.jsonl')

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
                question_identifier = _get_text(question_identifier_tag)
                [free_text_tag] = answer_tag.getElementsByTagName(
                    'FreeText')
                free_text = html.unescape(_get_text(free_text_tag))

                attribute, idx = question_identifier.split('-')

                data[idx][attribute] = free_text

            for _, row in data.items():
                rows.append(json.dumps(row))

    # write out the data to files
    with open(quality_output_path, 'w') as f_out:
        f_out.write('\n'.join(rows))


if __name__ == '__main__':
    extractquality()

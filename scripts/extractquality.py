"""Extract quality annotations from 20 Questions quality control HITs.

See ``python extractquality.py --help`` for more information.
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


# constants

duplicated_attributes = [
    'pk',
    'subject',
    'question',
    'answer'
]


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
    as 'quality-annotations.jsonl' for the quality annotations in a JSON
    Lines format and 'high-quality-triples.jsonl' for only the high
    quality questions where high quality means 2 of the 3 workers rated
    it high quality. Note, this script assumes that all the batches had
    all 3 assignments completed.
    """
    quality_annotations_output_path = os.path.join(
        output_dir, 'quality-annotations.jsonl')
    high_quality_triples_output_path = os.path.join(
        output_dir, 'high-quality-triples.jsonl')

    rows = []
    pks_to_scores = collections.defaultdict(lambda: 0)
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

                if attribute == 'pk':
                    data[idx][attribute] = int(free_text)
                else:
                    data[idx][attribute] = free_text

            for _, row in data.items():
                if row['quality'] == 'high':
                    pks_to_scores[row['pk']] += 1
                rows.append(row)

    # deduplicate and filter to just the high quality rows
    high_quality_rows = {}
    for row in rows:
        pk = row['pk']
        if pks_to_scores[pk] >= 2:
            # if the row scored high enough quality, record it
            if pk in high_quality_rows:
                # if the row has already been added, sanity check that all
                # the attributes are equal to the old row
                old_row = high_quality_rows[pk]
                for attribute in duplicated_attributes:
                    assert row[attribute] == old_row[attribute], (
                        f'{attribute} was not equal for rows with pk:'
                        f' {pk}'
                    )
            else:
                # the row has not been added yet, so add it, replacing
                # the quality annotation with the total quality score
                data = {
                    attribute: row[attribute]
                    for attribute in duplicated_attributes
                }
                data['score'] = pks_to_scores[pk]
                high_quality_rows[pk] = data

    # write out the data to files
    with open(quality_annotations_output_path, 'w') as f_out:
        f_out.write(
            '\n'.join([
                json.dumps(row)
                for row in sorted(
                        rows,
                        key=lambda r: r['pk'])
            ]))

    with open(high_quality_triples_output_path, 'w') as f_out:
        f_out.write(
            '\n'.join([
                json.dumps(row)
                for row in sorted(
                        high_quality_rows.values(),
                        key=lambda r: r['pk'])
            ]))


if __name__ == '__main__':
    extractquality()

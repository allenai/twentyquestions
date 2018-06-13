"""Extract relabeling data from the assertion relabeling HITs.

See ``python extractrelabels.py --help`` for more information.
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
    'answer',
    'score',
    'assertion'
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
def extractrelabels(xml_dir, output_dir):
    """Extract relabeling data from XML_DIR and write to OUTPUT_DIR.

    Extract the assertion relabeling data from a batch of the assertion
    relabeling HITs. XML_DIR should be an XML directory extracted with
    AMTI. OUTPUT_DIR is the location to which the data will be written
    as 'relabeled-assertions.jsonl' in a JSON Lines format.
    """
    relabeled_assertions_output_path = os.path.join(
        output_dir, 'relabeled-assertions.jsonl')

    pks_to_relabeled_assertions = {}
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

                if question_identifier == 'doNotRedirect':
                    # some turkers have modifications to their browser
                    # that send a "doNotRedirect" field when posting
                    # results back to mturk.
                    continue

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
                pk = row['pk']
                if pk in pks_to_relabeled_assertions:
                    old_row = pks_to_relabeled_assertions[pk]
                    for attribute in duplicated_attributes:
                        assert row[attribute] == old_row[attribute], (
                            f'{attribute} was not equal for rows with'
                            f' pk: {pk}'
                        )
                    old_row['labels'].append(row['label'])
                else:
                    # the row hasn't been added yet, so add it
                    data = {
                        attribute: row[attribute]
                        for attribute in duplicated_attributes
                    }
                    data['labels'] = [row['label']]
                    pks_to_relabeled_assertions[pk] = data

    # post process the relabeled assertions, voting for true or false
    # and removing bad assertions
    label_to_bit = {
        'always': 1,
        'usually': 1,
        'sometimes': 1,
        'rarely': 0,
        'never': 0
    }
    relabeled_assertions = []
    for relabeled_assertion in pks_to_relabeled_assertions.values():
        pk = relabeled_assertion['pk']
        labels = relabeled_assertion['labels']

        assert len(labels) == 3, (
            f'Assertion {pk} should have 3 labels but instead has'
            f' {len(labels)}.'
        )

        if 'bad' in labels:
            continue

        binarized_labels = [label_to_bit[label] for label in labels]
        true_votes = sum(binarized_labels)
        relabeled_assertion['true_votes'] = true_votes
        majority = 1 if sum(binarized_labels) >= 2 else 0
        relabeled_assertion['majority'] = majority

        relabeled_assertions.append(relabeled_assertion)

    # write out the data to files
    with open(relabeled_assertions_output_path, 'w') as f_out:
        f_out.write(
            '\n'.join([
                json.dumps(relabeled_assertion)
                for relabeled_assertion in sorted(
                        relabeled_assertions,
                        key=lambda r: r['pk'])
            ]))


if __name__ == '__main__':
    extractrelabels()

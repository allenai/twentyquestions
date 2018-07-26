"""Extract mirror subjects from 20 Questions mirror subject HITs.

See ``python extractmirrorsubjects.py --help`` for more information.
"""

import ast
import collections
import json
import logging
import re

import click

from scripts import _utils


logger = logging.getLogger(__name__)


# constants

KEY_SCHEMA = {
    'subject': str,
    'question': str,
    'answer': str,
    'quality_labels': ast.literal_eval,  # List[str]
    'score': int,
    'high_quality': bool,
    'labels': ast.literal_eval,  # List[str]
    'is_bad': bool,
    'true_votes': int,
    'majority': ast.literal_eval
}


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
def extractmirrorsubjects(xml_dir, output_path):
    """Extract mirror subjects from XML_DIR and write to OUTPUT_PATH.

    Extract mirror subject data from a batch of the mirror subjects
    HITs. XML_DIR should be an XML directory extracted with AMTI.
    OUTPUT_PATH is the location to which the data will be written in
    JSON Lines format.
    """
    # submissions : the form data submitted from the
    # mirror-subjects HITs as a list of dictionaries mapping the
    # question identifiers to the free text, i.e.:
    #
    #     [
    #       {
    #         'attribute-idx': attribute_value,
    #         ...
    #       },
    #       ...
    #     ]
    #
    # See the data for individual attributes and values. The index (idx)
    # is used because each HIT had the worker label multiple instances
    # for efficiency purposes.
    submissions = _utils.extract_xml_dir(xml_dir)

    # decode the data from the ``"attribute-idx": value`` style to the
    # individual rows.
    rows = _utils.decode_attribute_idx_data(submissions)

    # coerce the data types correctly and add in the new attribute.
    new_subjects_skipped = 0
    new_row_strs = []
    for row in rows:
        # create the new row

        # use an OrderedDict so that the keys appear in the right order
        # in the JSON.
        new_row = collections.OrderedDict([
            (attribute, as_type(row[attribute]))
            for attribute, as_type
            in KEY_SCHEMA.items()
        ])

        # clean up the raw text of the new subject
        # strip whitespace and lowercase
        new_subject = row['new_subject']\
            .strip()\
            .lower()
        # remove beginning and ending punctuation
        normalized_new_subject = re.sub(
            r'(^[^a-z0-9]|[^a-z0-9]$)',
            '',
            new_subject)

        # filter out bad examples using a few rules
        unexpected_format = not re.match(
            r'^[a-z0-9-]+$', normalized_new_subject)
        too_long = len(normalized_new_subject) > 20
        if unexpected_format or too_long:
            logger.warning(
                f'Skipping new subject "{normalized_new_subject}".')
            new_subjects_skipped += 1
            continue

        if normalized_new_subject != new_subject:
            logger.warning(
                f'New subject {new_subject} was modified to'
                f' {normalized_new_subject}.')

        new_row['subject'] = normalized_new_subject
        new_row['answer'] = None

        # delete the irrelevant label attributes since they don't apply
        # to the new subject
        del new_row['labels']
        del new_row['is_bad']
        del new_row['true_votes']
        del new_row['majority']

        new_row_strs.append(json.dumps(new_row))

    if new_subjects_skipped > 0:
        logger.warning(
            f'{new_subjects_skipped} new subjects were skipped.')

    # write out the data
    with click.open_file(output_path, 'w') as output_file:
        output_file.write('\n'.join(sorted(new_row_strs)))


if __name__ == '__main__':
    extractmirrorsubjects()

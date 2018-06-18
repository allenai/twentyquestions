"""Extract quality annotations from 20 Questions quality control HITs.

See ``python extractquality.py --help`` for more information.
"""

import collections
import json
import logging

import click

from scripts import _utils


logger = logging.getLogger(__name__)


# constants

MIN_SCORE = 2
EXPECTED_NUM_QUALITIES = 3

KEY_SCHEMA = {
    'subject': str,
    'question': str,
    'answer': str
}

QUALITY_TO_BIT = {
    'high': 1,
    'low': 0
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
def extractquality(xml_dir, output_path):
    """Extract quality labels from XML_DIR and write to OUTPUT_PATH.

    Extract the quality annotations from a batch of the quality control
    HITs. XML_DIR should be an XML directory extracted with AMTI.
    OUTPUT_PATH is the location to which the data will be written in
    JSON Lines format. High quality questions will be marked with the
    "high_quality" attribute as True, where high quality means 2 of the
    3 workers rated it high quality. Note, this script assumes that all
    the batches had all 3 assignments completed.
    """
    # submissions : the form data submitted from the quality control
    # HITs as a list of dictionaries mapping the question identifiers to
    # the free text, i.e.:
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

    # aggregate all the quality labels for each instance, since we had
    # multiple assignments / workers per instance.
    key_to_qualities = collections.defaultdict(list)
    for row in rows:
        key = _utils.key(row, KEY_SCHEMA.keys())
        key_to_qualities[key].append(row['quality'])

    # create the new rows by processing the aggregated quality labels
    new_row_strs = []
    for key, qualities in key_to_qualities.items():
        assert len(qualities) == EXPECTED_NUM_QUALITIES, (
            f'{key} only has {len(qualities)} quality labels.'
            f' It should have exactly {EXPECTED_NUM_QUALITIES}'
        )

        # create the new row

        # use an OrderedDict so that the keys appear in the right order
        # in the JSON.
        new_row = collections.OrderedDict([
            (attribute, as_type(value))
            for (attribute, as_type), value
            in zip(KEY_SCHEMA.items(), key)
        ])

        # compute new attributes to add
        score = sum([QUALITY_TO_BIT[quality] for quality in qualities])
        high_quality = score >= MIN_SCORE

        # add the new attributes
        new_row['score'] = score
        new_row['high_quality'] = high_quality

        new_row_strs.append(json.dumps(new_row))

    # write out the data
    with click.open_file(output_path, 'w') as output_file:
        output_file.write('\n'.join(sorted(new_row_strs)))


if __name__ == '__main__':
    extractquality()

"""Extract labeling data from the assertion labeling HITs.

See ``python extractlabels.py --help`` for more information.
"""

import ast
import collections
import json
import logging

import click

from scripts import _utils


logger = logging.getLogger(__name__)


# constants

EXPECTED_NUM_LABELS = 3

KEY_SCHEMA = {
    'subject': str,
    'question': str,
    'answer': str,
    'quality_labels': ast.literal_eval,  # List[str]
    'score': int,
    'high_quality': bool,
    'assertion': str
}

LABEL_TO_BIT = {
    'always': 1,
    'usually': 1,
    'sometimes': 1,
    'rarely': 0,
    'never': 0,
    'bad': 0
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
def extractlabels(xml_dir, output_path):
    """Extract labeling data from XML_DIR and write to OUTPUT_PATH.

    Extract the assertion labeling data from a batch of the assertion
    labeling HITs. XML_DIR should be an XML directory extracted with
    AMTI. OUTPUT_PATH is the location to which the data will be written
    in a JSON Lines format. Each instance will have a "labels"
    attribute, which is a list of the labels, and a "majority" attribute
    giving the majority (true / false) vote, a "true_votes" attribute
    giving the number of votes for "true", and an "is_bad" attribute
    giving whether or not any annotators labeled the assertion as "bad".
    """
    # submissions : the form data submitted from the assertion labeling
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

    # aggregate all the labels for each instance, since we had multiple
    # assignments / workers per instance.
    key_to_labels = collections.defaultdict(list)
    for row in rows:
        key = _utils.key(row, KEY_SCHEMA.keys())
        key_to_labels[key].append(row['label'])

    # create the new rows by processing the aggregated labels
    new_row_strs = []
    for key, labels in key_to_labels.items():
        assert len(labels) == EXPECTED_NUM_LABELS, (
            f'{key} only has {len(labels)} assertion labels.'
            f' It should have exactly {EXPECTED_NUM_LABELS}.'
        )

        # create the new row

        # use an OrderedDict so the keys appear in the right order in
        # the JSON.
        new_row = collections.OrderedDict([
            (attribute, as_type(value))
            for (attribute, as_type), value
            in zip(KEY_SCHEMA.items(), key)
        ])

        # compute new attributes to add
        is_bad = 'bad' in labels
        true_votes = sum([LABEL_TO_BIT[label] for label in labels])
        majority =  true_votes > (len(labels) / 2.0)

        # add the new attributes
        new_row['labels'] = labels
        new_row['is_bad'] = is_bad
        new_row['true_votes'] = true_votes
        new_row['majority'] = majority

        new_row_strs.append(json.dumps(new_row))

    # write out the data
    with click.open_file(output_path, 'w') as output_file:
        output_file.write('\n'.join(sorted(new_row_strs)))


if __name__ == '__main__':
    extractlabels()

"""Extract types from the commonsense type HITs.

See ``python extracttypes.py --help`` for more information.
"""

import ast
import collections
import json
import logging

import click

from scripts import _utils


logger = logging.getLogger(__name__)


# constants

EXPECTED_NUM_VOTES = 5

KEY_SCHEMA = {
    'subject': str,
    'question': str,
    'answer': str,
    'quality_labels': ast.literal_eval,  # List[str]
    'score': int,
    'high_quality': bool
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
def extracttypes(xml_dir, output_path):
    """Extract commonsense types from XML_DIR and write to OUTPUT_PATH.

    Extract the commonsense types for each subject-question pair from a
    batch of the commonsense type HITs. XML_DIR should be an XML
    directory extracted with AMTI. OUTPUT_PATH is the location to which
    the data will be written in a JSON Lines format. Each instance will
    have a "types" attribute that is a dictionary mapping each type to a
    true or false label. Additionally, each instance will also have a
    "type_scores" attribute which gives the raw count of votes for each
    type.
    """
    # submissions : the form data submitted from the commonsense type
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

    # aggregate all the type labels for each instance, since we had
    # multiple assignments / workers per instance.
    key_to_type_scores = collections.defaultdict(
        lambda: {
            'total_votes': 0,
            'ontological': 0,
            'capability': 0,
            'location': 0,
            'physical': 0,
            'non-physical': 0,
            'meronymy': 0,
            'association': 0
        })
    for row in rows:
        key = _utils.key(row, KEY_SCHEMA.keys())
        key_to_type_scores[key]['total_votes'] += 1
        key_to_type_scores[key]['ontological'] += int(row.get('ontological', 0))
        key_to_type_scores[key]['capability'] += int(row.get('capability', 0))
        key_to_type_scores[key]['location'] += int(row.get('location', 0))
        key_to_type_scores[key]['physical'] += int(row.get('physical', 0))
        key_to_type_scores[key]['non-physical'] += int(row.get('non-physical', 0))
        key_to_type_scores[key]['meronymy'] += int(row.get('meronymy', 0))
        key_to_type_scores[key]['association'] += int(row.get('association', 0))

    # create the new rows by processing the aggregated types
    new_row_strs = []
    for key, type_scores in key_to_type_scores.items():
        total_votes = type_scores.pop('total_votes')
        assert total_votes == EXPECTED_NUM_VOTES, (
            f'{key} only has {total_votes} annotations.'
            f' It should have exactly {EXPECTED_NUM_VOTES}.'
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
        types = {
            type_: score > (EXPECTED_NUM_VOTES / 2.0)
            for type_, score in type_scores.items()
        }

        # add the new attributes
        new_row['types'] = types
        new_row['type_scores'] = type_scores

        new_row_strs.append(json.dumps(new_row))

    # write out the data
    with click.open_file(output_path, 'w') as output_file:
        output_file.write('\n'.join(sorted(new_row_strs)))


if __name__ == '__main__':
    extracttypes()

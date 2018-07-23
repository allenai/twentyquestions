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

EXPECTED_NUM_TYPES = 5

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
    have a "types" attribute giving all the original labels and a "type"
    attribute giving the best type, i.e. the plurality vote with ties
    broken by the labels' priors.
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
    key_to_types = collections.defaultdict(list)
    # type priors are unnormalized because we only need greater than /
    # less than information
    type_priors = collections.defaultdict(int)
    for row in rows:
        key = _utils.key(row, KEY_SCHEMA.keys())
        key_to_types[key].append(row['type'])
        type_priors[row['type']] += 1

    # create the new rows by processing the aggregated types
    new_row_strs = []
    for key, types in key_to_types.items():
        assert len(types) == EXPECTED_NUM_TYPES, (
            f'{key} only has {len(types)} type labels.'
            f' It should have exactly {EXPECTED_NUM_TYPES}.'
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

        plurality_types = []
        # count up the number of labels for each type
        type_counts = collections.defaultdict(int)
        for type_ in types:
            type_counts[type_] += 1
        # compute the maximum count
        max_count = max(type_counts.values())
        # find types with the maximum count
        for type_, count in type_counts.items():
            if count == max_count:
                plurality_types.append(type_)
        # break ties using the class priors
        best_type, best_count = None, -1
        for type_ in plurality_types:
            type_prior = type_priors[type_]
            if type_prior > best_count:
                best_type = type_
                best_count = type_prior

        # add the new attributes
        new_row['types'] = types
        new_row['type'] = best_type

        new_row_strs.append(json.dumps(new_row))

    # write out the data
    with click.open_file(output_path, 'w') as output_file:
        output_file.write('\n'.join(sorted(new_row_strs)))


if __name__ == '__main__':
    extracttypes()

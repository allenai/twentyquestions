"""Group the data in blocks of at most 20 by subject.

See ``python groupbysubject.py --help`` for more information.
"""

import collections
import json
import logging

import click


logger = logging.getLogger(__name__)


# main function

@click.command(
    context_settings={
        'help_option_names': ['-h', '--help']
    })
@click.argument(
    'data_path',
    type=click.Path(exists=True, file_okay=True, dir_okay=False))
@click.argument(
    'output_path',
    type=click.Path(exists=False, file_okay=True, dir_okay=False))
def groupbysubject(data_path, output_path):
    """Group the data in blocks of at most 20 by subject.

    Group the data in blocks of at most 20 by subject. This script is
    primarily useful in preparing data for creating HITs, where the work
    can be done more efficiently by grouping multiple instances together
    to reduce scrolling and page loading. The data is read from
    DATA_PATH and written to OUTPUT_PATH. DATA_PATH should be JSON
    Lines formated data with each object having a 'subject' attribute.
    """
    subjects_to_rows = collections.defaultdict(list)
    with click.open_file(data_path, 'r') as data_file:
        for ln in data_file:
            row = json.loads(ln)
            subjects_to_rows[row['subject']].append(row)

    with click.open_file(output_path, 'w') as output_file:
        for subject, rows in subjects_to_rows.items():
            if len(rows) < 20:
                logger.info(f'{subject} only has {len(rows)} assertions.')

            if len(rows) > 20:
                logger.info(f'{subject} has more than 20 assertions.')

            for i in range(0, len(rows), 20):
                output_file.write(json.dumps({'rows': rows[i:i+20]}) + '\n')


if __name__ == '__main__':
    groupbysubject()

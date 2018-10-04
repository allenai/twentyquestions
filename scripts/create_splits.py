"""Create splits for the dataset.

See ``python create_splits.py --help`` for more information.
"""

import json
import logging
import os
import random
import re

import click


logger = logging.getLogger(__name__)


# helper functions

def _normalize(s):
    """Return a normalized version of s."""
    return re.sub(r'[^\w\s]', '', s).lower().strip()


# main function

@click.command(
    context_settings={
        'help_option_names': ['-h', '--help']
    })
@click.argument(
    'data_path',
    type=click.Path(exists=True, file_okay=True, dir_okay=False))
@click.argument(
    'output_dir',
    type=click.Path(exists=True, file_okay=False, dir_okay=True))
def create_splits(data_path, output_dir):
    """Write splits for the 20Qs data at DATA_PATH to OUTPUT_DIR.

    Write splits for the 20 Questions data at DATA_PATH to OUTPUT_DIR,
    splitting the data into 3 parts: train, dev, and test.
    Additionally, train, dev, and test have two additional attributes:
    subject_split_index and question_split_index. subject_split_index
    and question_split_index are the lowest index (train 0, dev 1, test
    2) of the splits that the subject or the question appears in (after
    lowercasing, stripping punctuation, and stripping any leading or
    trailing whitespace). Thus, a subject_split_index of 1 means that
    the subject appears in dev (and potentially in test) but not
    train.
    """
    # The structure of the splits is a bit complicated. We want a
    # train, dev, and test set where the dev and test set have a good
    # number of subjects and questions which do not appear in the
    # training set or each other. To accomplish this distribution,
    # first we'll randomly choose which subjects and questions appear
    # in train, dev, and test, then we'll put each instance into the
    # nine {subject, question} -> {train, dev, test} buckets, lastly
    # we'll split the buckets into actual train, dev, and test sets.

    logger.info(f'Reading {data_path}.')

    with click.open_file(data_path, 'r') as data_file:
       rows = []
       for ln in data_file:
           rows.append(json.loads(ln))

    logger.info('Bucketing instances by subjects and questions.')

    subjects = list(set([_normalize(row['subject']) for row in rows]))
    random.shuffle(subjects)
    questions = list(set([_normalize(row['question']) for row in rows]))
    random.shuffle(questions)

    subject_to_split_index = {}
    start = 0
    for split_index, portion in enumerate([0.8, 0.9, 1.0]):
        end = int(len(subjects) * portion)
        for subject in subjects[start:end]:
            subject_to_split_index[subject] = split_index
        start = end

    question_to_split_index = {}
    start = 0
    for split_index, portion in enumerate([0.8, 0.9, 1.0]):
        end = int(len(questions) * portion)
        for question in questions[start:end]:
            question_to_split_index[question] = split_index
        start = end

    # subject_question_instances:
    #   first index: the split index of the subject
    #   second index: the split index of the question
    subject_question_instances = [
        [[], [], []],
        [[], [], []],
        [[], [], []]
    ]
    for row in rows:
        subject_question_instances\
            [subject_to_split_index[_normalize(row['subject'])]]\
            [question_to_split_index[_normalize(row['question'])]]\
            .append(row)

    logger.info('Splitting instances into train, dev, and test.')

    # first list is train, second is dev, third is test
    splits = [[], [], []]
    # subjects and questions from train can go in dev or test, and ones
    # from dev can go in test, so map each bucket to the split index
    # that is the max of the row and column indices.
    for i, row in enumerate(subject_question_instances):
        for j, col in enumerate(row):
            splits[max(i, j)].extend(col)

    # distribute some of the training data into dev and test so that we
    # have a point of comparison for subjects and questions that have
    # both been seen at train time.
    train, dev, test = splits
    train_end = int(len(train) * 0.9)
    dev_end = int(len(train) * 0.95)
    random.shuffle(train)
    test.extend(train[dev_end:])
    dev.extend(train[train_end:dev_end])
    train = train[:train_end]
    splits = [train, dev, test]

    # shuffle all the splits
    for split in splits:
        random.shuffle(split)

    # determine the finalized split indices for each subject / question,
    # then write to disk
    logger.info('Writing splits to disk.')
    subject_to_final_split_index = {}
    question_to_final_split_index = {}
    for final_split_index, split in enumerate(splits):
        for row in split:
            normalized_subject = _normalize(row['subject'])
            if normalized_subject not in subject_to_final_split_index:
                subject_to_final_split_index[normalized_subject] = \
                    final_split_index
            normalized_question = _normalize(row['question'])
            if normalized_question not in question_to_final_split_index:
                question_to_final_split_index[normalized_question] = \
                    final_split_index

    for split_name, split in zip(['train', 'dev', 'test'], splits):
        split_path = os.path.join(
            output_dir, f'twentyquestions-{split_name}.jsonl')
        with click.open_file(split_path, 'w') as split_file:
            for row in split:
                row['subject_split_index'] = subject_to_final_split_index[
                    _normalize(row['subject'])]
                row['question_split_index'] = question_to_final_split_index[
                    _normalize(row['question'])]
                split_file.write(json.dumps(row) + '\n')


if __name__ == '__main__':
    create_splits()

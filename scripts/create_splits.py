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
    splitting the data into 3 parts: train, dev, and test. Additionally,
    train, dev, and test have two additional attributes: seen_subject
    and seen_question. seen_subject and seen_question are true if the
    subject or the question, respectively, is seen in the training data
    (after lowercasing, stripping punctuation, and stripping any leading
    or trailing whitespace).
    """
    # The structure of the splits is a bit complicated. We want a train,
    # dev, and test set where the dev and test set have a good number of
    # subjects and questions which do not appear in the training set. To
    # accomplish this distribution, first we'll randomly choose which
    # subjects and questions appear in train, then we'll put each
    # instance into the four {seen, unseen} x {subject, question}
    # buckets, lastly we'll split the seen-seen bucket into train, dev,
    # and test and the other buckets into just dev and test.
    #
    # Because it's possible that some subjects and questions might not
    # appear in train even when being originally intended for it, we'll
    # compute the "seen_subject" and "seen_question" attributes only
    # after the splits are complete.

    logger.info(f'Reading {data_path}.')

    with click.open_file(data_path, 'r') as data_file:
       rows = []
       for ln in data_file:
           rows.append(json.loads(ln))

    logger.info('Bucketing instances by subjects and questions.')

    subjects = set([_normalize(row['subject']) for row in rows])
    questions = set([_normalize(row['question']) for row in rows])

    proposed_train_subjects = random.sample(
        subjects, int(len(subjects) * 0.8))
    proposed_train_questions = random.sample(
        questions, int(len(questions) * 0.8))

    # subject_question_instances:
    #   first index: 0 for unseen and 1 for seen subjects
    #   second index: 0 for unseen and 1 for seen questions
    subject_question_instances = [
        [[], []],
        [[], []]
    ]
    for row in rows:
        subject_question_instances\
            [_normalize(row['subject']) in proposed_train_subjects]\
            [_normalize(row['question']) in proposed_train_questions]\
            .append(row)

    logger.info('Splitting instances into train, dev, and test.')

    train, dev, test = [], [], []

    # handle buckets that get split between dev and test
    dev_and_test_buckets = [
        subject_question_instances[0][0],
        subject_question_instances[1][0],
        subject_question_instances[0][1]
    ]
    for bucket in dev_and_test_buckets:
        random.shuffle(bucket)
        dev.extend(bucket[:len(bucket) // 2])
        test.extend(bucket[len(bucket) // 2:])

    # split the seen-seen bucket between train, dev, and test
    seen_seen_bucket = subject_question_instances[1][1]
    random.shuffle(seen_seen_bucket)
    train_end = int(len(seen_seen_bucket) * 0.9)
    dev_end = int(len(seen_seen_bucket) * 0.95)
    train.extend(seen_seen_bucket[:train_end])
    dev.extend(seen_seen_bucket[train_end:dev_end])
    test.extend(seen_seen_bucket[dev_end:])

    # determine if each instance has a seen subject and question against
    # the finalized training set, and save the splits to disk
    logger.info('Writing splits to disk.')

    train_subjects = set([_normalize(row['subject']) for row in train])
    train_questions = set([_normalize(row['question']) for row in train])
    splits = [('train', train), ('dev', dev), ('test', test)]
    for split_name, split_data in splits:
        split_path = os.path.join(
            output_dir,
            f'twentyquestions-{split_name}.jsonl')
        with click.open_file(split_path, 'w') as split_file:
            for row in split_data:
                row['seen_subject'] = _normalize(row['subject']) in train_subjects
                row['seen_question'] = _normalize(row['question']) in train_questions
                split_file.write(json.dumps(row) + '\n')


if __name__ == '__main__':
    create_splits()

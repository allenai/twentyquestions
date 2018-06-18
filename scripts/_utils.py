"""Utilities for twentyquestions' scripts."""

import collections
import html
import logging
import os
from xml.dom import minidom


logger = logging.getLogger(__name__)


def get_node_text(node):
    """Return the text from a node that has only text as content.

    Calling this function on a node with multiple children or a non-text
    node child raises a ``ValueError``.

    Parameters
    ----------
    node : xml.dom.minidom.Node
        The node to extract text from.

    Returns
    -------
    str
        The text from node.
    """
    # handle the empty node case
    if len(node.childNodes) == 0:
        return ''

    if len(node.childNodes) != 1:
        raise ValueError(
            f'node ({node}) has multiple child nodes.')
    if not isinstance(node.childNodes[0], minidom.Text):
        raise ValueError(
            f"node's ({node}) is not a Text node.")
    return node.childNodes[0].wholeText


def extract_xml_dir(xml_dir):
    """Extract MTurk form data from ``xml_dir`` to a list of dicts.

    Extract the form data returned by Mechanical Turk in the AMTI XML
    directory, ``xml_dir``, into a list of python dictionaries. Note
    that the field ``"doNotRedirect"`` is ignored as some turkers
    automatically submit this value with their form data.

    Parameters
    ----------
    xml_dir : str
        The path to the AMTI XML directory from which to extract the
        data.

    Returns
    -------
    List[Dict[str, str]]
        A list of dictionaries containing the form data. Note that all
        keys and values will have type ``str`` -- type coercion is up to
        the caller as a post processing step.
    """
    rows = []
    for dirpath, dirnames, filenames in os.walk(xml_dir):
        for filename in filenames:
            logger.debug(f'Processing {filename}.')

            # skip non-xml files
            if not '.xml' in filename:
                logger.debug(f'{filename} is not XML. Skipping.')
                continue

            with open(os.path.join(dirpath, filename), 'r') as xml_file:
                xml = minidom.parseString(xml_file.read())

            row = {}
            for answer_tag in xml.getElementsByTagName('Answer'):
                [question_identifier_tag] = answer_tag.getElementsByTagName(
                    'QuestionIdentifier')
                question_identifier = get_node_text(
                    question_identifier_tag)

                if question_identifier == 'doNotRedirect':
                    # some turkers have modifications to their browser
                    # that send a "doNotRedirect" field when posting
                    # results back to mturk.
                    continue

                [free_text_tag] = answer_tag.getElementsByTagName(
                    'FreeText')
                free_text = html.unescape(get_node_text(
                    free_text_tag))

                row[question_identifier] = free_text

            rows.append(row)

    return rows


def decode_attribute_idx_data(submissions):
    """Return a list of dicts representing the decoded data.

    Some of the form data returned from MTurk is encoded as
    ``"attribute-idx": value`` mappings, where attribute represents the
    attribute encoded and idx is the index of the problem instance. This
    function takes a list of dictionaries in the attribute-idx style and
    decodes them into the individual problem instances.

    Parameters
    ----------
    submissions : List[Dist[str, str]]
        The data to decode. Each submission must be formatted in the
        attribute-idx style.

    Returns
    -------
    List[Dist[str, str]]
        A list of dictionaries with each instance separated out
        individually.
    """
    rows = []
    for submission in submissions:
        idx_to_row = collections.defaultdict(dict)
        for k, v in submission.items():
            attribute, idx = k.split('-')
            idx_to_row[idx][attribute] = v

        rows.extend(idx_to_row.values())

    return rows


def key(row, key_attributes):
    """Return a key for identifying equivalent rows.

    Return a key consisting of a tuple of the key attributes for the
    row, which should be a dict-like object.

    Parameters
    ----------
    row : dict-like
        The row for which to create a key.
    key_attributes : List[str]
        A list of strings providing the key attributes for identifying
        equivalent rows.

    Returns
    -------
    tuple
        A tuple of the identifying attributes expected for ``row``.
    """
    return tuple([
        row[attribute] for attribute in key_attributes
    ])

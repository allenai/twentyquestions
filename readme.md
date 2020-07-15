twentyquestions
===============
Code for crowdsourcing commonsense with 20 Questions.

This repository includes:

  - A web application for playing 20 Questions on Mechanical Turk.
  - [amti][amti] [HIT Definitions](./mturk-definitions/) for running tasks on
    Mechanical Turk.
  - Scripts for post-processing the data derived from the HITs.


Documentation
-------------
To get a quick overview of the repository, jump to [Quickstart](#quickstart).
Otherwise, you can find topic specific documentation below:

  - [Setup](./docs/setup.md): How to fully set up the repository for deploying
    the 20 Questions app to cloud infrastructure and running HITs on Mechanical
    Turk.
  - [Development](./docs/development.md): In-depth development documentation,
    including serving the app in development and production, as well as
    deploying to Kubernetes.
  - [Running HITs](./docs/running-hits.md): How to run the HITs on Mechanical
    Turk using [amti][amti].


Quickstart
----------
To quickly get things up and running, first install the dependencies:

    $ pip install -r requirements.txt

Then, run the unittests:

    $ python -m unittest

Assuming everything checks out, you can now execute the `manage.py` script, the
main interface for working with this repository:

    $ python manage.py --help
    Usage: manage.py [OPTIONS] COMMAND [ARGS]...

      A high-level interface to admin scripts for twentyquestions.

    Options:
      -v, --verbose        Turn on verbose logging for debugging purposes.
      -l, --log-file TEXT  Log to the provided file path instead of stdout.
      -h, --help           Show this message and exit.

    Commands:
      build                  Build twentyquestions.
      create_splits          Write splits for the 20Qs data at DATA_PATH...
      deploy                 Deploy twentyquestions to ENV.
      dockerize              Create the docker image for running...
      extractgames           Extract games from XML_DIR and write to...
      extractlabels          Extract labeling data from XML_DIR and write...
      extractmirrorsubjects  Extract mirror subjects from XML_DIR and...
      extractquality         Extract quality labels from XML_DIR and write...
      extractquestions       Extract questions from XML_DIR and write to...
      extracttypes           Extract commonsense types from XML_DIR and...
      groupbysubject         Group the data in blocks of at most 20 by...
      promote                Promote the docker image from SOURCE to DEST.
      serve                  Serve twentyquestions on port 5000.

The `manage.py` script is self-documenting, and lists out all the actions you
might want to perform using the code base. Use the `--help` option to view
additional documentation. For example:

    $ python manage.py build --help
    Usage: manage.py build [OPTIONS]

      Build twentyquestions.

      Build twentyquestions by building the frontend client and copying it into
      the proper location for the backend.

    Options:
      -h, --help  Show this message and exit.

To deploy the `twentyquestions` application to infrastructure, or to run the
HITs on Mechanical Turk, you'll need to follow the in-depth
[setup documentation](./docs/setup.md). If you want to run or extend the code,
checkout the [development](./docs/development.md) documentation; or, if you
want to run the HITs on Mechanical Turk see
[Running HITs](./docs/running-hits.md).


Citation
--------
A short paper is (hopefully) coming soon. Please check back on this repository
for a paper to cite when you are about to publish your results. If there's no
citation available, then please link to this repository with a URL.


Contact
-------
This code was authored by Nick Lourie for [Mosaic][mosaic], reach out to him
with any questions.


[amti]: https://github.com/allenai/amti
[mosaic]: https://mosaic.allenai.org/

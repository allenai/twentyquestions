twentyquestions
===============
Code for crowdsourcing commonsense with 20 Questions.

This repository includes:

  - A web application for playing 20 Questions on Mechanical Turk.
  - [amti][amti] [HIT Definitions][hit-definitions] for running tasks on
    Mechanical Turk.
  - Scripts for post-processing the data derived from the HITs.


Setup
-----
Make sure you're setup with Google Cloud, in particular you need to be
able to push images to GCR and jobs to GKE using kubectl.

For the python environment, install using pip. [pyenv][pyenv] and
[pyenv-virtualenv][pyenv-virtualenv] can be helpful for managing your
python environments:

    pyenv virtualenv 3.6.4 twentyquestions
    echo 'twentyquestions' > .python-version
    pip install -r requirements.txt

And lastly, to run the experiments you'll need to be setup with
[amti][amti]:

    pip install -e git+https://github.com/allenai/amti#egg=amti

Make sure you have AWS credentials for mturk in your environment
variables. [direnv][direnv] can help manage your environment
variables. Make sure you have:

    AWS_ACCESS_KEY_ID
    AWS_SECRET_KEY
    AWS_SECRET_ACCESS_KEY
    AWS_DEFAULT_REGION

Set whenever you run amti to create batches of HITs.


Development
-----------
The main interface for working with `twentyquestions` is the `manage.py`
script in the root of the repository. You can find helpful commands by
running:

    $ python manage.py --help
    Usage: manage.py [OPTIONS] COMMAND [ARGS]...

      A high-level interface to admin scripts for twentyquestions.

    Options:
      -v, --verbose        Turn on verbose logging for debugging purposes.
      -l, --log-file TEXT  Log to the provided file path instead of stdout.
      -h, --help           Show this message and exit.

    Commands:
      build              Build twentyquestions.
      deploy             Deploy twentyquestions to ENV.
      dockerize          Create the docker image for running...
      extractassertions  Extract assertions from XML_DIR and write to...
      extractgames       Extract games from XML_DIR and write to...
      extractlabels      Extract labeling data from XML_DIR and write...
      extractquality     Extract quality labels from XML_DIR and write...
      extractquestions   Extract questions from XML_DIR and write to...
      groupbysubject     Group the data in blocks of at most 20 by...
      promote            Promote the docker image from SOURCE to DEST.
      serve              Serve twentyquestions on port 5000.

The `--help` option also works on the subcommands:

    $ python manage.py build --help
    Usage: manage.py build [OPTIONS]

      Build twentyquestions.

      Build twentyquestions by building the frontend client and copying it into
      the proper location for the backend.

    Options:
      -h, --help  Show this message and exit.

### Using Your Own List of Seed Entities

To encourage diversity in the data, we provide the subject of each game
of 20 Questions from a list we compiled. The default list is in this
repository at [backend/subjects.txt][subjects-list]. You can replace it
with your own seed list if desired.

### Serving for Development

To serve `twentyquestions` for development, perform the following steps:

  1. Change `const env` from `'live'` to `'local'` in
     `frontend/src/twentyquestions/settings.js`.
  2. Run `npm run dev` from the `frontend` directory to run the
     hot-reloading webpack dev server for the frontend.
  3. Run `python manage.py serve` from the root of the repo to run the
     backend on localhost.

### Serving for Production

To serve `twentyquestions` in a production context:

  1. Make sure that `const env` is set to `'live'` in
     `frontend/src/twentyquestions/settings.js`.
  2. Make sure the frontend is built and up-to-date by running
     `python manage.py build`.
  3. Run `python manage.py serve` on the production machine.

### Deploying to Kubernetes

The `twentyquestions` application is setup to deploy to a kubernetes
cluster using the `ops/twentyquestions.yaml` template. To deploy to
kubernetes, make sure you have a certificate to serve https on whatever
domain you'll run at, and execute the following commands:

    # build the frontend so the backend can serve it
    python manage.py build
    # pack the entire application into a docker image
    python manage.py dockerize
    # push the new version to GCR
    python manage.py promote local dev
    # deploy the docker image and certificates to the kubernetes cluster
    python manage.py deploy dev cert.pem privkey.pem

You'll also want to point a domain to whatever IP address the Kubernetes
cluster gives your web application, since the crowdworkers will need to
connect to that IP address over HTTPS.

### Running Tests

Tests are written using the built-in `unittest` module. To run the
tests:

    python -m unittest

Currently, only the backend has tests. The frontend is tested manually.


Running HITs on Mechanical Turk
-------------------------------
To reproduce our crowdsourcing pipeline for building the dataset,
you'll have to run the HITs on Mechanical Turk. Make sure you have
followed the instructions in [Setup](#setup).

Note that if you run the HITs on MTurk -- especially the games -- you'll
be managing a community of workers completing the tasks. That means
you'll most likely have to correspond with some of them if they
encounter issues or want to report problems with other players.

All the HITs are written as [amti][amti] HIT definitions, and each HIT
produces output that is fed into the next HIT. The crowdsourcing
pipeline as a whole looks like:


    +---------------------------+
    |      twentyquestions      |
    +---------------------------+
                  |
                  v
    +---------------------------+
    | questions-quality-control |
    +---------------------------+
                  |
                  v
    +---------------------------+
    |  questions-to-assertions  |
    +---------------------------+
                  |
                  v
    +---------------------------+
    |    assertion-labeling     |
    +---------------------------+

### Running `twentyquestions`

Make sure you've deployed the web application, as described in
[Development](#development), then create a file similar to
[`mturk-definitions/twentyquestions/data.jsonl`](./mturk-definitions/twentyquestions/data.jsonl)
except pointing to the domain at which the web application is running
instead of `https://twentyquestions.allenai.org/`. Then, run `amti` to
create the batch:

    amti create_batch \
      --live \
      mturk-definitions/twentyquestions/definition \
      data.jsonl \
      .

Once the games have run, collect the results, extract the XML
responses from MTurk, and run `python manage.py extractquestions` to
extract out the subject-question-answer triples. For example:

    amti review_batch \
      --live \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      # review the batch
    amti save_batch \
      --live \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    amti extract_xml \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
      .
    python manage.py extractquestions \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xml \
      questions.jsonl

### Running `questions-quality-control`

Once you've run the games and extracted the questions, first group the
data by subject to prepare it for labeling:

    python manage.py groupbysubject \
      questions.jsonl \
      quality-control-input.jsonl

Then, use the grouped questions as input to the
`questions-quality-control` task:

    amti create_batch \
      --live \
      mturk-definitions/questions-quality-control/definition \
      quality-control-input.jsonl \
      .

Once all the questions have been labeled as high quality, you can
collect the results, extract the XML responses from MTurk, and run
`python manage.py extractquality` to extract out the data:

    amti review_batch \
      --live \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      # review batch
    amti save_batch \
      --live \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    amti extract_xml \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
      .
    python manage.py extractquality \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xml \
      quality.jsonl

### Running `questions-to-assertions`

Once you have the quality labels, group them by subject and prepare it
for the next HIT:

    python manage.py groupbysubject \
      quality.jsonl \
      questions-to-assertion-input.jsonl

You may want to filter the rows that have `"high_quality"` set to
`false`. Then, use the grouped questions as input to the
`questions-to-assertions` task:

    amti create_batch \
      --live \
      mturk-definitions/questions-to-assertions/definition \
      questions-to-assertions-input.jsonl

Once all the questions have been converted into assertions, you can
collect the results, extract the XML responses from MTurk, and run
`python manage.py extractassertions` to extract out the data:

    amti review_batch \
      --live \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      # review batch
    amti save_batch \
      --live \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    amti extract_xml \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
      .
    python manage.py extractassertions \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xml \
      assertions.jsonl


### Running `assertion-labeling`

Once you have the assertions, the last step is to label them as `true`
or `false`. Group them by subject and prepare it for the next HIT:

    python manage.py groupbysubject \
      assertions.jsonl \
      assertion-labeling-input.jsonl

Use the grouped questions as input to the `assertion-labeling` task:

    amti create_batch \
      --live \
      mturk-definitions/assertion-labeling/definition \
      assertion-labeling-input.jsonl

Once all the assertions have been labeled, you can collect the results,
extract the XML responses from MTurk, and run `python manage.py
extractlabels` to extract out the data:

    amti review_batch \
      --live \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      # review batch
    amti save_batch \
      --live \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    amti extract_xml \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
      .
    python manage.py extractlabels \
      batch-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xml \
      labeled-assertions.jsonl

### Post-Processing

After running the `assertion-labeling` HIT, the process is complete. For
the ATOMIC dataset, we also post-processed this data by making sure the
class distribution is balanced for each key word and removing all
assertions which weren't voted true or false unanimously (have a score
of 3).


Contact
-------
This code was authored by Nick Lourie for [Alexandria][alexandria],
reach out to him with any questions.


[alexandria]: https://allenai.org/alexandria/
[amti]: https://github.com/allenai/amti
[direnv]: https://direnv.net/
[hit-definitions]: ./mturk-definitions/
[subjects-list]: ./backend/subjects.txt
[pyenv]: https://github.com/pyenv/pyenv
[pyenv-virtualenv]: https://github.com/pyenv/pyenv-virtualenv

Development
===========
Full development documentation for `twentyquestions`.

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


The `--help` option also works on the subcommands:

    $ python manage.py build --help
    Usage: manage.py build [OPTIONS]

      Build twentyquestions.

      Build twentyquestions by building the frontend client and copying it into
      the proper location for the backend.

    Options:
      -h, --help  Show this message and exit.


Using Your Own List of Seed Entities
------------------------------------
To encourage diversity in the data, we provide the subject of each game
of 20 Questions from a list we compiled. The default list is in this
repository at [backend/subjects.txt][../backend/subjects.txt]. You can replace
it with your own seed list if desired.


Serving for Development
-----------------------
To serve `twentyquestions` for development, perform the following steps:

  1. Change `const env` from `'live'` to `'local'` in
     `frontend/src/twentyquestions/settings.js`.
  2. Run `npm run dev` from the `frontend` directory to run the
     hot-reloading webpack dev server for the frontend.
  3. Run `python manage.py serve` from the root of the repo to run the
     backend on localhost.


Serving for Production
----------------------
To serve `twentyquestions` in a production context:

  1. Make sure that `const env` is set to `'live'` in
     `frontend/src/twentyquestions/settings.js`.
  2. Make sure the frontend is built and up-to-date by running
     `python manage.py build`.
  3. Run `python manage.py serve` on the production machine.


Deploying to Kubernetes
-----------------------
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


Running Tests
-------------
Tests are written using the built-in `unittest` module. To run the
tests:

    python -m unittest

Currently, only the backend has tests. The frontend is tested manually.

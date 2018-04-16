twentyquestions
===============
A web application for playing 20 Questions to crowdsource common sense.


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
      build         Build twentyquestions.
      deploy        Deploy twentyquestions to ENV.
      dockerize     Create the docker image for running...
      extractgames  Extract 20 Questions data from XML_DIR and...
      promote       Promote the docker image from SOURCE to DEST.
      serve         Serve twentyquestions on port 5000.

The `--help` option also works on the subcommands:

    $ python manage.py build --help
    Usage: manage.py build [OPTIONS]

      Build twentyquestions.

      Build twentyquestions by building the frontend client and copying it into
      the proper location for the backend.

    Options:
      -h, --help  Show this message and exit.

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

### Running Tests

Tests are written using the built-in `unittest` module. To run the
tests:

    python -m unittest

Currently, only the backend has tests. The frontend is tested manually.


Contact
-------
This code was authored by Nick Lourie for Alexandria, reach out to him
with any questions.


[amti]: https://github.com/allenai/amti
[direnv]: https://direnv.net/
[pyenv]: https://github.com/pyenv/pyenv
[pyenv-virtualenv]: https://github.com/pyenv/pyenv-virtualenv

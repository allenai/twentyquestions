Setup
=====
Full setup and installation documentation for `twentyquestions`.

You'll need to be setup with a docker container registry and a
kubernetes cluster for deployment. The code was originally developed
with Google Cloud (GCR and GKE), but should work with any container
registry and kubernetes cluster.

Fill out the following [settings](../backend/settings.py) to point to your
container registry:

    # URL for the container registry
    CONTAINER_REGISTRY_URL = 'gcr.io'
    # The user part of the image location, i.e. 'library' in
    # library/ubuntu:latest
    CONTAINER_REGISTRY_USER = 'ai2-alexandria'
    # A name for the docker image for the backend server
    CONTAINER_REGISTRY_IMAGE_NAME = 'twentyquestions-server'

Then make sure that you have kubectl configured with a kubernetes
cluster that can pull images from the registry.

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


[amti]: https://github.com/allenai/amti
[direnv]: https://direnv.net/
[pyenv]: https://github.com/pyenv/pyenv
[pyenv-virtualenv]: https://github.com/pyenv/pyenv-virtualenv

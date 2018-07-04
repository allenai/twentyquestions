"""Settings and constants."""

import os


####################
# Project Settings #
####################

# paths

REPO_DIR = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

DOCKERFILE = os.path.join(REPO_DIR, 'Dockerfile')

FRONTEND_DIR = os.path.join(REPO_DIR, 'frontend')
FRONTEND_INDEX = os.path.join(
    FRONTEND_DIR, 'dist/index.html')
FRONTEND_BUNDLE = os.path.join(
    FRONTEND_DIR,
    'dist/static/app-v2.bundle.js')

BACKEND_DIR = os.path.join(REPO_DIR, 'backend')
BACKEND_TEMPLATES_DIR = os.path.join(BACKEND_DIR, 'templates')
BACKEND_STATIC_DIR = os.path.join(BACKEND_DIR, 'static')


# the different environments

ENVS = {
    'local': 'local',
    'dev': 'dev',
    'prod': 'prod'
}


# docker images

# The URL for the container registry
CONTAINER_REGISTRY_URL = 'gcr.io'
# The user part of the image location, i.e. 'library' in
# library/ubuntu:latest
CONTAINER_REGISTRY_USER = 'ai2-alexandria'
# A name for the docker image for the backend server
CONTAINER_REGISTRY_IMAGE_NAME = 'twentyquestions-server'

KUBERNETES_CONFIG = os.path.join(
    REPO_DIR, 'ops/twentyquestions.yaml')

CERT_SECRET_NAME = 'twentyquestions-cert'

###################
# Server Settings #
###################

# how long a client has to ping the server before being disconnected
# when using polling transport
TIME_TO_DISCONNECT = 30
assert TIME_TO_DISCONNECT >= 15, "Time to disconnect cannot be less than 15."

# how long in seconds a client has to reconnect after a disconnect event
TIME_TO_RECONNECT = 30

# a text file containing the subjects with which to seed games
SUBJECTS_FILE_PATH = os.path.join(BACKEND_DIR, 'subjects.txt')

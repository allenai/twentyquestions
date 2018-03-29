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
    'dist/static/app.bundle.js')

BACKEND_TEMPLATES_DIR = os.path.join(
    REPO_DIR,
    'backend/templates')
BACKEND_STATIC_DIR = os.path.join(
    REPO_DIR,
    'backend/static')


# the different environments
ENVS = {
    'local': 'local',
    'dev': 'dev',
    'prod': 'prod'
}

# docker images
CONTAINER_REGISTRY = 'gcr.io'
PROJECT_ID = 'ai2-alexandria'
SERVER_IMAGE_NAME = 'twentyquestions-server'

KUBERNETES_CONFIG = os.path.join(
    REPO_DIR, 'ops/twentyquestions.yaml')

CERT_SECRET_NAME = 'twentyquestions-cert'

###################
# Server Settings #
###################

# how long a client has to ping the server before being disconnected
TIME_TO_DISCONNECT = 15
assert TIME_TO_DISCONNECT >= 9, "Time to disconnect cannot be less than 9."

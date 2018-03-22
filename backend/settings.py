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
    FRONTEND_DIR, 'dist/twentyquestions.html')
FRONTEND_BUNDLE = os.path.join(
    FRONTEND_DIR,
    'dist/twenty-questions/static/twentyquestions/twentyquestions.bundle.js')

BACKEND_TEMPLATES_DIR = os.path.join(
    REPO_DIR,
    'backend/templates/twentyquestions')
BACKEND_STATIC_DIR = os.path.join(
    REPO_DIR,
    'backend/static/twentyquestions')


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

QUORUM = 2

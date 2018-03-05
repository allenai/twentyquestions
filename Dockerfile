# Deployment image for crowdsense

FROM library/python:3.6-slim-jessie


# set the working directory

WORKDIR /crowdsense


# install python packages

ADD ./requirements.txt .

RUN pip3.6 install -r ./requirements.txt

# add the code as the final step so that when we modify the code
# we don't bust the cached layers holding the dependencies and
# system packages.
ADD . .


# When firing off long-running processes, use `docker run --init`
CMD [ "/bin/bash" ]

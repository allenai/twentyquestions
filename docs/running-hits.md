Running HITs on Mechanical Turk
===============================
Full documentation for running HITs from `twentyquestions`.

To reproduce our crowdsourcing pipeline for building the dataset,
you'll have to run the HITs on Mechanical Turk. Make sure you have
followed the instructions in [Setup](./setup.md).

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


Running `twentyquestions`
-------------------------
Make sure you've deployed the web application, as described in
[Development](./development.md), then create a file similar to
[`mturk-definitions/twentyquestions/data.jsonl`](../mturk-definitions/twentyquestions/data.jsonl)
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


Running `questions-quality-control`
-----------------------------------
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


Running `questions-to-assertions`
---------------------------------
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


Running `assertion-labeling`
----------------------------
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


[amti]: https://github.com/allenai/amti

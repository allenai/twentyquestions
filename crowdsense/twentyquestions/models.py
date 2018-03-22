"""Code modeling the 20 Questions game."""

import json
import logging


logger = logging.getLogger(__name__)


# helper classes and functions

class Data(object):
    """A base class for modeling data.

    To subclass this base class, you must implement the ``from_dict``
    and ``to_dict`` methods.
    """

    @classmethod
    def from_dict(cls, data):
        """Create an instance from a dictionary.

        Parameters
        ----------
        data : dict
            A dictionary containing all the attributes necessary to
            create an instance.

        Returns
        -------
        Data
            The newly created instance.
        """
        raise NotImplementedError

    def to_dict(self):
        """Serialize the instance to a dictionary.

        Returns
        -------
        dict
            A dictionary serializing the instance.
        """
        raise NotImplementedError

    def __eq__(self, other):
        """Compare two instances for equality.

        Parameters
        ----------
        other : Data
            The instance to compare against.

        Returns
        -------
        bool
            ``True`` if the two instances are equal attribute by
            attribute, ``False`` otherwise.
        """
        return self.to_dict() == other.to_dict()

    def copy(self, **kwargs):
        """Copy the instance, updating its attributes with ``kwargs``.

        All key value parameters will be wrapped up into a dictionary
        and used to update the copied instance.

        Returns
        -------
        Data
            A copy of this instance with the attributes replaced by
            keyword arguments passed to ``copy``.
        """
        # use ``vars`` and not the ``to_dict`` method, because we only
        # want shallow references.
        attributes = vars(self)
        attributes.update(kwargs)

        return self.__class__(**attributes)


# constants

# roles that the players can take
ROLES = {
    'asker': 'asker',
    'answerer': 'answerer'
}

# states that the game can be in
STATES = {
    'CHOOSESUBJECT': 'CHOOSESUBJECT',
    'ASKQUESTION': 'ASKQUESTION',
    'PROVIDEANSWER': 'PROVIDEANSWER',
    'MAKEGUESS': 'MAKEGUESS',
    'ANSWERGUESS': 'ANSWERGUESS',
    'SUBMITRESULTS': 'SUBMITRESULTS'
}


# data models

class Player(Data):
    """A model of an individual player."""

    def __init__(
            self,
            player_id):
        """Create a new instance.

        Parameters
        ----------
        player_id : str
            The ID for the player.

        Returns
        -------
        Player
            The new instance.
        """
        self.player_id = player_id

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            player_id=data['playerId'])

    def to_dict(self):
        """See ``Data``."""
        return {
            'playerId': self.player_id
        }


class Question(Data):
    """A model of a question."""

    def __init__(
            self,
            asker_id,
            question_text):
        """Create an instance.

        Parameters
        ----------
        asker_id : str
            The ID for the player who asked the question.
        question_text : str
            The text of the question.

        Returns
        -------
        Question
            The new instance.
        """
        self.asker_id = asker_id
        self.question_text = question_text

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            asker_id=data['askerId'],
            question_text=data['questionText'])

    def to_dict(self):
        """See ``Data``."""
        return {
            'askerId': self.asker_id,
            'questionText': self.question_text
        }


class Answer(Data):
    """A model of an answer."""

    def __init__(
            self,
            answerer_id,
            answer_bool):
        """Create an instance.

        Parameters
        ----------
        answerer_id : str
            The ID of the player who provided this answer.
        answer_bool : bool
            A boolean indicating the answer to the question.

        Returns
        -------
        Answer
            The new instance.
        """
        self.answerer_id = answerer_id
        self.answer_bool = answer_bool

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            answerer_id=data['answererId'],
            answer_bool=data['answerBool'])

    def to_dict(self):
        """See ``Data``."""
        return {
            'answererId': self.answerer_id,
            'answerBool': self.answer_bool
        }


class QuestionAndAnswer(Data):
    """A model for a question-answer pair."""

    def __init__(
            self,
            question,
            answer):
        """Create an instance.

        Parameters
        ----------
        question : Question
            The ``Question`` instance representing the question for the
            pair.
        answer : Optional[Answer]
            An optional ``Answer`` instance representing the answer to
            the question.

        Returns
        -------
        QuestionAndAnswer
            The new instance.
        """
        self.question = question
        self.answer = answer

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        if data['answer'] is None:
            answer = None
        else:
            answer = Answer.from_dict(data['answer'])

        return cls(
            question=Question.from_dict(data['question']),
            answer=answer)

    def to_dict(self):
        """See ``Data``."""
        if self.answer is None:
            answer = None
        else:
            answer = self.answer.to_dict()

        return {
            'question': self.question.to_dict(),
            'answer': answer
        }


class Round(Data):
    """A model of a single round of the game."""

    def __init__(
            self,
            subject,
            guess,
            question_and_answers):
        """Create a new instance.

        Parameters
        ----------
        subject : Optional[str]
            A string giving the subject of the round, i.e. what the
            askers are trying to guess.
        guess : Optional[QuestionAndAnswer]
            The guess for what the subject is.
        question_and_answers : List[QuestionAndAnswer]
            A list of question-answer pairs that have been asked and
            answered so far this round.

        Returns
        -------
        Round
            The new instance.
        """
        self.subject = subject
        self.guess = guess
        self.question_and_answers = question_and_answers

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        if data['guess'] is None:
            guess = None
        else:
            guess = QuestionAndAnswer.from_dict(data['guess'])

        return cls(
            subject=data['subject'],
            guess=guess,
            question_and_answers=[
                QuestionAndAnswer.from_dict(d)
                for d in data['questionAndAnswers']
            ])

    def to_dict(self):
        """See ``Data``."""
        if self.guess is None:
            guess = None
        else:
            guess = self.guess.to_dict()

        return {
            'subject': self.subject,
            'guess': guess,
            'questionAndAnswers': [
                qna.to_dict()
                for qna in self.question_and_answers
            ]
        }


class Game(Data):
    """A model for the 20 Questions game as a whole."""

    def __init__(
            self,
            players,
            state,
            answerer_id,
            asker_id,
            round_):
        """Create a new instance.

        Parameters
        ----------
        players : List[Player]
            A list of the players in the game.
        state : str
            A string representing the current state of the game. Must be
            on of the values from the models.STATES dictionary.
        answerer_id : Optional[str]
            The ID for the player who answers questions this round.
        asker_id : Optional[str]
            The ID for the player who asks questions this round.
        round_ : Round
            The round for the game.

        Returns
        -------
        Game
            The new instance.
        """
        self.players = players
        self.state = state
        self.answerer_id = answerer_id
        self.asker_id = asker_id
        self.round_ = round_

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            players=[Player.from_dict(d) for d in data['players']],
            state=data['state'],
            answerer_id=data['answererId'],
            asker_id=data['askerId'],
            round_=Round.from_dict(data['round']))

    def to_dict(self):
        """See ``Data``."""
        return {
            'players': [p.to_dict() for p in self.players],
            'state': self.state,
            'answererId': self.answerer_id,
            'askerId': self.asker_id,
            'round': self.round_.to_dict()
        }


class WaitingRoom(Data):
    """A room for players to wait for the right number."""

    def __init__(self, room_id, player_ids, quorum):
        """Create a new instance.

        Parameters
        ----------
        room_id : str
            The ID for the waiting room.
        player_ids : List[str]
            A list of IDs for the players in the waiting room.
        quorum : int
            The number of players that must enter the waiting room
            before starting a game.

        Returns
        -------
        WaitingRoom
            The new instance.
        """
        self.room_id = room_id
        self.player_ids = player_ids
        self.quorum = quorum

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            room_id=data['roomId'],
            player_ids=data['playerIds'],
            quorum=data['quorum'])

    def to_dict(self):
        """See ``Data``."""
        return {
            'roomId': self.room_id,
            'playerIds': self.player_ids,
            'quorum': self.quorum
        }


class GameRoom(Data):
    """A room for players to play a game."""

    def __init__(self, room_id, game):
        """Create a new instance.

        Parameters
        ----------
        room_id : str
            The ID for the game room.
        game : Game
            The ``Game`` instance being played in the game room.

        Returns
        -------
        GameRoom
            The new instance.
        """
        self.room_id = room_id
        self.game = game

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            room_id=data['roomId'],
            game=Game.from_dict(data['game']))

    def to_dict(self):
        """See ``Data``."""
        return {
            'roomId': self.room_id,
            'game': self.game.to_dict()
        }

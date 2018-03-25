"""Code modeling the 20 Questions game."""

import copy
import json
import logging
import uuid


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

# statuses that a player may occupy
PLAYERSTATUSES = {
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
    'ABANDONED': 'ABANDONED'
}

# The required number of players to play a game.
REQUIREDPLAYERS = 2


# data models

class Player(Data):
    """A model of an individual player."""

    def __init__(
            self,
            player_id,
            status):
        """Create a new instance.

        Parameters
        ----------
        player_id : str
            The ID for the player.
        status : str
            The current status for the player.

        Returns
        -------
        Player
            The new instance.
        """
        self.player_id = player_id
        self.status = status

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            player_id=data['playerId'],
            status=data['status'])

    def to_dict(self):
        """See ``Data``."""
        return {
            'playerId': self.player_id,
            'status': self.status
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
            state,
            answerer_id,
            asker_id,
            round_):
        """Create a new instance.

        Parameters
        ----------
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
        self.state = state
        self.answerer_id = answerer_id
        self.asker_id = asker_id
        self.round_ = round_

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            state=data['state'],
            answerer_id=data['answererId'],
            asker_id=data['askerId'],
            round_=Round.from_dict(data['round']))

    def to_dict(self):
        """See ``Data``."""
        return {
            'state': self.state,
            'answererId': self.answerer_id,
            'askerId': self.asker_id,
            'round': self.round_.to_dict()
        }


class GameRoom(Data):
    """A room for players to play a game."""

    def __init__(
            self,
            room_id,
            game,
            player_ids):
        """Create a new instance.

        Parameters
        ----------
        room_id : str
            The ID for the game room.
        game : Game
            The ``Game`` instance being played in the game room.
        player_ids : List[str]
            The list of ids for players currently in the game room.

        Returns
        -------
        GameRoom
            The new instance.
        """
        self.room_id = room_id
        self.game = game
        self.player_ids = player_ids

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            room_id=data['roomId'],
            game=Game.from_dict(data['game']),
            player_ids=data['playerIds'])

    def to_dict(self):
        """See ``Data``."""
        return {
            'roomId': self.room_id,
            'game': self.game.to_dict(),
            'playerIds': self.player_ids
        }


class PlayerRouter(object):
    """A class for routing players into games.

    ``PlayerRouter`` does NOT inherit from data, should only be
    instantiated once and performs mutation on itself.
    """

    def __init__(
            self,
            game_rooms,
            players,
            game_room_priorities,
            player_matches):
        """Create a new instance.

        Parameters
        ----------
        game_rooms : Dict[str, GameRoom]
            A dictionary mapping room_ids to game rooms.
        players : Dict[str, Player]
            A dictionary mapping player ids to players. This dictionary
            represents all players currently known to the server.
        game_room_priorities : List[List[str]]
            A list of lists of game room ids. The i'th index of the
            outer list returns a stack of game room ids where each game
            room in the stack has as many players as the value of the
            index. Games that require fewer players to fill are filled
            up first.
        player_matches : Dict[str, str]
            A dictionary mapping player ids to game room ids.

        Returns
        -------
        PlayerRouter
            The new instance.
        """
        self.game_rooms = game_rooms
        self.players = players
        # there should be one stack for each possible number of players
        # in a game which is not full
        for i in range(len(game_room_priorities), REQUIREDPLAYERS):
            game_room_priorities.append([])
        self.game_room_priorities = game_room_priorities
        self.player_matches = player_matches

    def route_player(self, player_id):
        """Route a player to a game.

        Route the player represented by ``player_id`` to a game. If no
        player is known by ``player_id``, then also create a new player
        for the id.

        If the player is already matched with a game, then nothing
        happens as this method is idempotent.

        Parameters
        ----------
        player_id : str
            The ID of the player to match to a game.

        Returns
        -------
        None
        """
        # check if the player has already been matched to a game
        if player_id in self.player_matches:
            return

        # create the player if the player is new
        if player_id not in self.players:
            self.players[player_id] = Player(
                player_id=player_id,
                status=PLAYERSTATUSES['ACTIVE'])

        # get the first list of game_ids
        for game_room_ids in reversed(self.game_room_priorities):
            if len(game_room_ids) > 0:
                break

        if len(game_room_ids) == 0:
            # there are no partially full game rooms so create a new
            # game room.
            room_id = str(uuid.uuid4()).replace('-', '')
            game_room = GameRoom(
                room_id=room_id,
                game=Game(
                    state=STATES['CHOOSESUBJECT'],
                    answerer_id=None,
                    asker_id=None,
                    round_=Round(
                        subject=None,
                        guess=None,
                        question_and_answers=[])),
                player_ids=[player_id])

            self.game_rooms[room_id] = game_room
            self.game_room_priorities[1].append(room_id)
            self.player_matches[player_id] = room_id
        else:
            # take the game room with the most players in it currently
            # and fill it up
            room_id = game_room_ids.pop()
            old_game_room = self.game_rooms[room_id]
            game_room = old_game_room.copy(
                player_ids=[
                    player_id,
                    *old_game_room.player_ids
                ])

            self.game_rooms[room_id] = game_room

            num_players = len(game_room.player_ids)
            if num_players < REQUIREDPLAYERS:
                game_room_priorities[num_players].append(room_id)

            self.player_matches[player_id] = room_id

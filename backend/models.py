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

    def __repr__(self):
        """Return a string representation of the instance.

        Returns
        -------
        str
            A string representation of the instance.
        """
        repr_lines = [f'{self.__class__.__name__}(']
        for k, v in vars(self).items():
            indented_v_repr = repr(v).replace('\n', '\n  ')
            repr_lines.append(f'  {k}={indented_v_repr}')
        repr_lines.append(')')
        return '\n'.join(repr_lines)

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
        attributes = vars(self).copy()
        attributes.update(kwargs)

        return self.__class__(**attributes)


# constants

# The maximum number of questions that can be asked in a round. */
MAXQUESTIONS = 20

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
    'WAITING': 'WAITING',
    'READYTOPLAY': 'READYTOPLAY',
    'PLAYING': 'PLAYING',
    'INACTIVE': 'INACTIVE',
    'BANNED': 'BANNED'
}

# The required number of players to play a game.
REQUIREDPLAYERS = 2

# the status transitions a player can initiate on themselves
PLAYERACTIONS = {
    'STARTPLAYING': 'STARTPLAYING',
    'FINISHGAME': 'FINISHGAME',
    'GOINACTIVE': 'GOINACTIVE',
    'GOACTIVE': 'GOACTIVE'
}


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
            answer_value):
        """Create an instance.

        Parameters
        ----------
        answerer_id : str
            The ID of the player who provided this answer.
        answer_value : str
            A string indicating the answer, must be one of 'always',
            'usually', 'sometimes', 'rarely', 'never', 'irrelevant'.

        Returns
        -------
        Answer
            The new instance.
        """
        self.answerer_id = answerer_id
        self.answer_value = answer_value

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            answerer_id=data['answererId'],
            answer_value=data['answerValue'])

    def to_dict(self):
        """See ``Data``."""
        return {
            'answererId': self.answerer_id,
            'answerValue': self.answer_value
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


class Guess(Data):
    """A model of a guess."""

    def __init__(
            self,
            asker_id,
            guess_text):
        """Create an instance.

        Parameters
        ----------
        asker_id : str
            The ID for the player who made the guess.
        guess_text : str
            The text of the guess.

        Returns
        -------
        Guess
            The new instance.
        """
        self.asker_id = asker_id
        self.guess_text = guess_text

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            asker_id=data['askerId'],
            guess_text=data['guessText'])

    def to_dict(self):
        """See ``Data``."""
        return {
            'askerId': self.asker_id,
            'guessText': self.guess_text
        }


class GuessAnswer(Data):
    """A model of an answer to a guess."""

    def __init__(
            self,
            answerer_id,
            correct):
        """Create an instance.

        Parameters
        ----------
        answerer_id : str
            The ID of the player who provided this answer to the guess.
        correct : bool
            A boolean indicating whether or not the guess is correct.

        Returns
        -------
        GuessAnswer
            The new instance.
        """
        self.answerer_id = answerer_id
        self.correct = correct

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        return cls(
            answerer_id=data['answererId'],
            correct=data['correct'])

    def to_dict(self):
        """See ``Data``."""
        return {
            'answererId': self.answerer_id,
            'correct': self.correct
        }


class GuessAndAnswer(Data):
    """A model for a guess - guess answer pair."""

    def __init__(
            self,
            guess,
            guess_answer):
        """Create an instance.

        Parameters
        ----------
        guess : Guess
            The ``Guess`` instance representing the guess for the
            pair.
        guess_answer : Optional[GuessAnswer]
            An optional ``GuessAnswer`` instance representing the answer
            to the guess.

        Returns
        -------
        GuessAndAnswer
            The new instance.
        """
        self.guess = guess
        self.guess_answer = guess_answer

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        if data['guessAnswer'] is None:
            guess_answer = None
        else:
            guess_answer = GuessAnswer.from_dict(data['guessAnswer'])

        return cls(
            guess=Guess.from_dict(data['guess']),
            guess_answer=guess_answer)

    def to_dict(self):
        """See ``Data``."""
        if self.guess_answer is None:
            guess_answer = None
        else:
            guess_answer = self.guess_answer.to_dict()

        return {
            'guess': self.guess.to_dict(),
            'guessAnswer': guess_answer
        }


class Round(Data):
    """A model of a single round of the game."""

    def __init__(
            self,
            subject,
            guess_and_answer,
            question_and_answers):
        """Create a new instance.

        Parameters
        ----------
        subject : Optional[str]
            A string giving the subject of the round, i.e. what the
            askers are trying to guess.
        guess_and_answer : Optional[GuessAndAnswer]
            The guess and answer pair for what the subject is.
        question_and_answers : List[QuestionAndAnswer]
            A list of question-answer pairs that have been asked and
            answered so far this round.

        Returns
        -------
        Round
            The new instance.
        """
        self.subject = subject
        self.guess_and_answer = guess_and_answer
        self.question_and_answers = question_and_answers

    @classmethod
    def from_dict(cls, data):
        """See ``Data``."""
        if data['guessAndAnswer'] is None:
            guess_and_answer = None
        else:
            guess_and_answer = GuessAndAnswer.from_dict(data['guessAndAnswer'])

        return cls(
            subject=data['subject'],
            guess_and_answer=guess_and_answer,
            question_and_answers=[
                QuestionAndAnswer.from_dict(d)
                for d in data['questionAndAnswers']
            ])

    def to_dict(self):
        """See ``Data``."""
        if self.guess_and_answer is None:
            guess_and_answer = None
        else:
            guess_and_answer = self.guess_and_answer.to_dict()

        return {
            'subject': self.subject,
            'guessAndAnswer': guess_and_answer,
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

    def add_player(self, player):
        """Return a new game room with the player added.

        Parameters
        ----------
        player : Player
            The player to add to the game room.

        Returns
        -------
        GameRoom
            The new instance with the player added.
        """
        if self.game.answerer_id is None:
            new_game = self.game.copy(answerer_id=player.player_id)
        elif self.game.asker_id is None:
            new_game = self.game.copy(asker_id=player.player_id)
        else:
            raise ValueError(
                'Cannot add a player to a full game room.')

        return self.copy(
            game=new_game,
            player_ids=[player.player_id, *self.player_ids])

    def remove_player(self, player):
        """Return a new game room with the player removed.

        Parameters
        ----------
        player : Player
            The player to remove from the game room.

        Returns
        -------
        GameRoom
            The new instance with the player removed.
        """
        if player.player_id == self.game.answerer_id:
            new_game = self.game.copy(answerer_id=None)
        elif player.player_id == self.game.asker_id:
            new_game = self.game.copy(asker_id=None)
        else:
            new_game = self.game

        return self.copy(
            game=new_game,
            player_ids=[
                other_player_id
                for other_player_id in self.player_ids
                if other_player_id != player.player_id
            ])


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

    # helper methods

    def _match_player_to_game_room(self, player_id):
        """Match the player for ``player_id`` to a game room.

        Parameters
        ----------
        player_id : str
            The ID for the player to match to a game room.
        """
        # check pre-conditions
        player = self.players[player_id]
        if player.status != PLAYERSTATUSES['WAITING']:
            raise ValueError(
                'Only "WAITING" players may be matched to game rooms.')
        if self.player_matches[player_id] != None:
            raise ValueError(
                'Player is already matched to a game room.')

        # get the first list of game ids by priority
        for game_room_ids in reversed(self.game_room_priorities):
            if len(game_room_ids) > 0:
                break

        # match the player to a game room
        if len(game_room_ids) == 0:
            # there are no partially full game rooms
            # create a new game room for this player
            room_id = str(uuid.uuid4()).replace('-', '')
            game_room = GameRoom(
                room_id=room_id,
                game=Game(
                    state=STATES['CHOOSESUBJECT'],
                    answerer_id=None,
                    asker_id=None,
                    round_=Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=[]
            ).add_player(player)

            # update game room and player matches
            self.game_rooms[room_id] = game_room
            self.player_matches[player_id] = room_id

            # add the game room into the priority queue
            self.game_room_priorities[1].append(room_id)
        else:
            # add the player to the game room that's closest to full

            # pop from the front of the array to get the game that's
            # been waiting the longest.
            room_id = game_room_ids.pop(0)
            old_game_room = self.game_rooms[room_id]
            game_room = old_game_room.add_player(player)

            # update game room and player matches
            self.game_rooms[room_id] = game_room
            self.player_matches[player_id] = room_id

            # add game room into priority queue or kick of play
            num_players = len(game_room.player_ids)
            if num_players < REQUIREDPLAYERS:
                # add the game room back to the priority queue
                self.game_room_priorities[num_players].append(room_id)
            else:
                # change players in room to 'READYTOPLAY'
                for a_player_id in game_room.player_ids:
                    a_player = self.players[a_player_id]
                    if a_player.status == PLAYERSTATUSES['WAITING']:
                        self.players[a_player_id] = a_player.copy(
                            status=PLAYERSTATUSES['READYTOPLAY'])

    # server connection actions

    def create_player(self, player_id):
        """Create a new player.

        Create a new player corresponding to ``player_id`` and match the
        player to a game room. If a player already exists with the ID
        then an error is thrown.

        Parameters
        ----------
        player_id : str
            The ID of the player to match to a game.
        """
        if player_id in self.players:
            raise ValueError('Player IDs must be unique.')

        # create the player
        player = Player(
            player_id=player_id,
            status=PLAYERSTATUSES['WAITING'])
        self.players[player_id] = player

        # set the player's match to the None game room
        self.player_matches[player_id] = None

        # match the player to a game room
        self._match_player_to_game_room(player_id)

    def delete_player(self, player_id):
        """Remove the player from the server.

        Players will be removed from the server after they disconnect
        unexpectedly or alternatively when they finish a game.

        Parameters
        ----------
        player_id : str
            The ID for the player who just finished a game.
        """
        player = self.players[player_id]

        # update the game room that the player is currently in
        room_id = self.player_matches[player_id]
        if room_id is not None:
            old_game_room = self.game_rooms[room_id]
            game_room = old_game_room.remove_player(player)
            num_players = len(game_room.player_ids)
            game_finished = game_room.game.state == STATES['SUBMITRESULTS']
            if num_players == 0 and game_finished:
                # the game is complete and all players are gone
                # delete the game room
                del self.game_rooms[room_id]
            elif num_players > 0 and game_finished:
                # the game is complete but players are left
                self.game_rooms[room_id] = game_room
            elif not game_finished:
                # the game is incomplete, put it back in the queue
                self.game_rooms[room_id] = game_room
                # remove the old game room priority if there is one
                self.game_room_priorities = [
                    [a_room_id for a_room_id in room_ids if a_room_id != room_id]
                    for room_ids in self.game_room_priorities
                ]
                # append the game room to its new priority position
                self.game_room_priorities[num_players].append(room_id)

        # delete the player
        del self.players[player_id]
        del self.player_matches[player_id]

    # player actions

    def start_playing(self, player_id):
        """Transition ``player_id`` from 'READYTOPLAY' to 'PLAYING'.

        Parameters
        ----------
        player_id : str
            The ID for the player to transition.
        """
        room_id = self.player_matches[player_id]

        # update the player's status
        old_player = self.players[player_id]
        if old_player.status != PLAYERSTATUSES['READYTOPLAY']:
            raise ValueError(
                'Player can only start playing when "READYTOPLAY".')
        player = old_player.copy(status=PLAYERSTATUSES['PLAYING'])
        self.players[player_id] = player

        # the game room's state doesn't need to be updated because
        # players are pre-emptively placed into roles in the game when
        # they enter the game room.

    def finish_game(self, player_id):
        """Perform clean up actions for when a player finishes a game.

        Most players will leave the server after they finish a game, so
        when players finish games we'll remove them from the server.

        Parameters
        ----------
        player_id : str
            The ID for the player who just finished a game.
        """
        self.delete_player(player_id)

    def go_inactive(self, player_id):
        """Set a player as inactive.

        An inactive player will be removed from any game they are
        currently in and will not be asked to join new games until they
        confirm that they're no longer inactive.

        Parameters
        ----------
        player_id : str
            The ID of the player to set as inactive.
        """
        old_player = self.players[player_id]
        if old_player.status == 'INACTIVE':
            logger.warning(
                f'Player {player_id} going inactive while already'
                 ' inactive.')
            # the method should be idempotent in case of refires
            return

        # set the player's status as inactive
        player = old_player.copy(
            status=PLAYERSTATUSES['INACTIVE'])
        self.players[player_id] = player

        # remove the player from the game room
        room_id = self.player_matches[player_id]
        if room_id == None:
            logger.warning(
                f'Player {player_id} going inactive while not currently'
                 ' matched to a game room.')
            # nothing to do on the players game room so exit
            return

        self.game_rooms[room_id] = \
            self.game_rooms[room_id].remove_player(player)

        # update the player's match
        self.player_matches[player_id] = None

        # update the game room's priority
        num_players = len(self.game_rooms[room_id].player_ids)
        self.game_room_priorities = [
            [a_room_id for a_room_id in room_ids if a_room_id != room_id]
            for room_ids in self.game_room_priorities
        ]
        self.game_room_priorities[num_players].append(room_id)

    def go_active(self, player_id):
        """Set a player as active.

        Set the player as active and match them to a game room.

        Parameters
        ----------
        player_id : str
            The ID of the player to set as active.
        """
        # set the player's status as active
        player = self.players[player_id].copy(
            status=PLAYERSTATUSES['WAITING'])
        self.players[player_id] = player

        # match the player to a game room
        self._match_player_to_game_room(player_id)

    # update the game state

    def update_game(self, player_id, game):
        """Update the state for a game.

        Parameters
        ----------
        player_id : str
            The ID for the player who is updating the game.
        game : Game
            The new game state to update to.
        """
        room_id = self.player_matches[player_id]
        game_room = self.game_rooms[room_id]

        self.game_rooms[room_id] = game_room.copy(game=game)

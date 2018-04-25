"""Test models."""

import logging
import unittest

from . import models


class DataTestCase(unittest.TestCase):
    """Test the ``Data`` class."""

    def setUp(self):
        """Create classes used in the tests.

        Because ``Data`` is meant to be subclassed, in this setup
        method we'll create two subclasses of ``Data`` to use in
        testing the class.
        """
        class FlatData(models.Data):
            """Data with only built-in types as attributes."""

            def __init__(self, foo):
                self.foo = foo

            @classmethod
            def from_dict(cls, data):
                return cls(foo=data['foo'])

            def to_dict(self):
                return {'foo': self.foo}

        self.FlatData = FlatData

        class NestedData(models.Data):
            """Data with a data class as an attribute."""

            def __init__(self, bar, flat_data):
                self.bar = bar
                self.flat_data = flat_data

            @classmethod
            def from_dict(cls, data):
                return cls(
                    bar=data['bar'],
                    flat_data=FlatData.from_dict(data['flat_data']))

            def to_dict(self):
                return {
                    'bar': self.bar,
                    'flat_data': self.flat_data.to_dict()
                }

        self.NestedData = NestedData

    def test_from_dict(self):
        """Test the ``Data.from_dict`` method."""

        flat_data = self.FlatData.from_dict({'foo': 'foo'})
        self.assertEqual(
            vars(flat_data),
            {'foo': 'foo'})

        nested_data = self.NestedData.from_dict({
            'bar': 'bar',
            'flat_data': {
                'foo': 'foo'
            }
        })
        self.assertEqual(
            vars(nested_data),
            {
                'bar': 'bar',
                'flat_data': nested_data.flat_data
            })

    def test_to_dict(self):
        """Test the ``Data.to_dict`` method."""

        flat_data = self.FlatData(foo='foo')
        self.assertEqual(flat_data.to_dict(), {'foo': 'foo'})

        nested_data = self.NestedData(bar='bar', flat_data=flat_data)
        self.assertEqual(
            nested_data.to_dict(),
            {
                'bar': 'bar',
                'flat_data': {
                    'foo': 'foo'
                }
            })

    def test___repr__(self):
        """Test the ``Data.__repr__`` method."""

        flat_data = self.FlatData(foo='boo')
        nested_data = self.NestedData(
            bar='baz',
            flat_data=flat_data)

        self.assertEqual(
            repr(flat_data),
              "FlatData("
            "\n  foo='boo'"
            "\n)")
        self.assertEqual(
            repr(nested_data),
              "NestedData("
            "\n  bar='baz'"
            "\n  flat_data=FlatData("
            "\n    foo='boo'"
            "\n  )"
            "\n)")

    def test___eq__(self):
        """Test the ``Data.__eq__`` method."""

        flat_data = self.FlatData(foo='bop')
        nested_data = self.NestedData(
            bar='baz',
            flat_data=flat_data)

        self.assertEqual(
            flat_data,
            self.FlatData(foo='bop'))
        self.assertEqual(
            nested_data,
            self.NestedData(
                bar='baz',
                flat_data=self.FlatData(foo='bop')))

    def test_copy(self):
        """Test the ``Data.copy`` method."""

        flat_data = self.FlatData(foo='bop')
        modified_flat_data = flat_data.copy(foo='beep')
        self.assertEqual(flat_data.foo, 'bop')
        self.assertEqual(modified_flat_data.foo, 'beep')

        nested_data = self.NestedData(
            bar='baz',
            flat_data=flat_data)
        modified_nested_data = nested_data.copy(
            flat_data=modified_flat_data)
        self.assertEqual(nested_data.bar, 'baz')
        self.assertEqual(nested_data.flat_data, flat_data)
        self.assertEqual(modified_nested_data.bar, 'baz')
        self.assertEqual(
            modified_nested_data.flat_data,
            modified_flat_data)


# We'll only test new methods introduced on the models rather than their
# attributes or methods inherited that are part of the ``Data`` class's
# interface.


class GameRoomTestCase(unittest.TestCase):
    """Test the ``GameRoom`` class."""

    def test_add_player(self):
        """Test the ``GameRoom.add_player`` method."""

        player_foo = models.Player(
            player_id='foo',
            status=models.PLAYERSTATUSES['PLAYING'])
        player_bar = models.Player(
            player_id='bar',
            status=models.PLAYERSTATUSES['PLAYING'])
        game_room = models.GameRoom(
            room_id='1',
            game=models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id=None,
                asker_id=None,
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])),
            player_ids=[])
        game_room_with_foo = game_room.add_player(player_foo)
        game_room_with_both = \
            game_room.add_player(player_foo).add_player(player_bar)

        self.assertEqual(
            game_room,
            models.GameRoom(
            room_id='1',
            game=models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id=None,
                asker_id=None,
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])),
            player_ids=[]))
        self.assertEqual(
            game_room_with_foo,
            models.GameRoom(
                room_id='1',
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id='foo',
                    asker_id=None,
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['foo']))
        self.assertEqual(
            game_room_with_both,
            models.GameRoom(
                room_id='1',
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id='foo',
                    asker_id='bar',
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['bar', 'foo']))

    def test_remove_player(self):
        """Test the ``GameRoom.remove_player`` method."""

        player_foo = models.Player(
            player_id='foo',
            status=models.PLAYERSTATUSES['PLAYING'])
        player_bar = models.Player(
            player_id='bar',
            status=models.PLAYERSTATUSES['PLAYING'])
        game_room = models.GameRoom(
            room_id='1',
            game=models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id='foo',
                asker_id='bar',
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])),
            player_ids=['foo', 'bar'])
        game_room_without_foo = game_room.remove_player(player_foo)
        game_room_without_bar = game_room.remove_player(player_bar)
        game_room_without_both = \
            game_room.remove_player(player_foo).remove_player(player_bar)

        self.assertEqual(
            game_room,
            models.GameRoom(
            room_id='1',
            game=models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id='foo',
                asker_id='bar',
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])),
            player_ids=['foo', 'bar']))
        self.assertEqual(
            game_room_without_foo,
            models.GameRoom(
                room_id='1',
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id=None,
                    asker_id='bar',
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['bar']))
        self.assertEqual(
            game_room_without_bar,
            models.GameRoom(
                room_id='1',
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id='foo',
                    asker_id=None,
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['foo']))
        self.assertEqual(
            game_room_without_both,
            models.GameRoom(
                room_id='1',
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id=None,
                    asker_id=None,
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=[]))


class PlayerRouterTestCase(unittest.TestCase):
    """Test the ``PlayerRouter`` class."""

    def test_create_player(self):
        """Test the ``PlayerRouter.create_player`` method."""

        # create the first player

        player_router =  models.PlayerRouter(
            game_rooms={},
            players={},
            game_room_priorities=[],
            player_matches={})
        player_router.create_player('foo')

        # check that the game room was created correctly
        self.assertEqual(len(player_router.game_rooms), 1)
        game_room = list(player_router.game_rooms.values())[0]
        self.assertEqual(game_room.player_ids, ['foo'])
        self.assertEqual(
            game_room.game,
            models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id='foo',
                asker_id=None,
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])))

        # check that the player is in the players list
        self.assertEqual(
            player_router.players['foo'],
            models.Player(
                player_id='foo',
                status=models.PLAYERSTATUSES['WAITING']))

        # check that the player is matched to the game room
        self.assertEqual(
            player_router.player_matches['foo'],
            game_room.room_id)

        # check that the game room priorities are correctly set
        self.assertEqual(
            player_router.game_room_priorities,
            [[], [game_room.room_id]])

        # create a player with one person on the server

        player_router.create_player('bar')

        # check that the game room was updated correctly
        self.assertEqual(len(player_router.game_rooms), 1)
        game_room = list(player_router.game_rooms.values())[0]
        self.assertEqual(game_room.player_ids, ['bar', 'foo'])
        self.assertEqual(
            game_room.game,
            models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id='foo',
                asker_id='bar',
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])))

        # check that the players are in the players list and that their
        # statuses were correctly updated.
        self.assertEqual(
            player_router.players['foo'],
            models.Player(
                player_id='foo',
                status=models.PLAYERSTATUSES['READYTOPLAY']))
        self.assertEqual(
            player_router.players['bar'],
            models.Player(
                player_id='bar',
                status=models.PLAYERSTATUSES['READYTOPLAY']))

        # check that the players are matched to the game room
        self.assertEqual(
            player_router.player_matches['foo'],
            game_room.room_id)
        self.assertEqual(
            player_router.player_matches['bar'],
            game_room.room_id)

        # check that the game room priorities are correctly set
        self.assertEqual(
            player_router.game_room_priorities,
            [[], []])

        # create a player with one full game on the server

        player_router.create_player('baz')

        # check that the players are in the players list
        self.assertEqual(
            player_router.players['foo'],
            models.Player(
                player_id='foo',
                status=models.PLAYERSTATUSES['READYTOPLAY']))
        self.assertEqual(
            player_router.players['bar'],
            models.Player(
                player_id='bar',
                status=models.PLAYERSTATUSES['READYTOPLAY']))
        self.assertEqual(
            player_router.players['baz'],
            models.Player(
                player_id='baz',
                status=models.PLAYERSTATUSES['WAITING']))

        # check that the player are matched to the game rooms
        self.assertEqual(
            player_router.player_matches['foo'],
            game_room.room_id)
        self.assertEqual(
            player_router.player_matches['bar'],
            game_room.room_id)
        self.assertNotEqual(
            player_router.player_matches['baz'],
            game_room.room_id)

        # check that the game room was created correctly
        self.assertEqual(len(player_router.game_rooms), 2)
        new_game_room = player_router.game_rooms[
            player_router.player_matches['baz']]
        self.assertEqual(new_game_room.player_ids, ['baz'])
        self.assertEqual(
            new_game_room.game,
            models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id='baz',
                asker_id=None,
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])))

        # check that the game room priorities are correctly set
        self.assertEqual(
            player_router.game_room_priorities,
            [[], [new_game_room.room_id]])

        # create a player with a full game and a half full game

        player_router.create_player('bop')

        # check that the game room was updated correctly
        self.assertEqual(len(player_router.game_rooms), 2)
        new_game_room = player_router.game_rooms[
            player_router.player_matches['baz']]
        self.assertEqual(new_game_room.player_ids, ['bop', 'baz'])
        self.assertEqual(
            new_game_room.game,
            models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id='baz',
                asker_id='bop',
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])))

        # check that the player is in the players list
        self.assertEqual(
            player_router.players['foo'],
            models.Player(
                player_id='foo',
                status=models.PLAYERSTATUSES['READYTOPLAY']))
        self.assertEqual(
            player_router.players['bar'],
            models.Player(
                player_id='bar',
                status=models.PLAYERSTATUSES['READYTOPLAY']))
        self.assertEqual(
            player_router.players['baz'],
            models.Player(
                player_id='baz',
                status=models.PLAYERSTATUSES['READYTOPLAY']))
        self.assertEqual(
            player_router.players['bop'],
            models.Player(
                player_id='bop',
                status=models.PLAYERSTATUSES['READYTOPLAY']))

        # check that the player is matched to the game room
        self.assertEqual(
            player_router.player_matches['foo'],
            game_room.room_id)
        self.assertEqual(
            player_router.player_matches['bar'],
            game_room.room_id)
        self.assertEqual(
            player_router.player_matches['baz'],
            new_game_room.room_id)
        self.assertEqual(
            player_router.player_matches['bop'],
            new_game_room.room_id)

        # check that the game room priorities are correctly set
        self.assertEqual(
            player_router.game_room_priorities,
            [[], []])

    def test_delete_player(self):
        """Test the ``PlayerRouter.delete_player`` method."""

        # create some players

        player_router =  models.PlayerRouter(
            game_rooms={},
            players={},
            game_room_priorities=[],
            player_matches={})
        player_router.create_player('foo')
        player_router.create_player('bar')
        player_router.create_player('baz')

        # check preconditions
        self.assertTrue('foo' in player_router.players)
        self.assertTrue('bar' in player_router.players)
        self.assertTrue('baz' in player_router.players)
        self.assertTrue('foo' in player_router.player_matches)
        self.assertTrue('bar' in player_router.player_matches)
        self.assertTrue('baz' in player_router.player_matches)
        foo_bar_game_room = player_router.game_rooms[
            player_router.player_matches['foo']]
        baz_room_id = player_router.player_matches['baz']
        self.assertEqual(
            player_router.game_room_priorities,
            [[],[baz_room_id]])

        # delete a player alone in a game

        foo_bar_game_room = player_router.game_rooms[
            player_router.player_matches['foo']]
        baz_room_id = player_router.player_matches['baz']
        player_router.delete_player('baz')

        # check the player was deleted
        self.assertTrue('foo' in player_router.players)
        self.assertTrue('bar' in player_router.players)
        self.assertTrue('baz' not in player_router.players)
        self.assertTrue('foo' in player_router.player_matches)
        self.assertTrue('bar' in player_router.player_matches)
        self.assertTrue('baz' not in player_router.player_matches)

        # check that the game room was updated correctly
        self.assertEqual(len(player_router.game_rooms), 2)
        new_baz_game_room = player_router.game_rooms[baz_room_id]
        self.assertEqual(
            new_baz_game_room.game,
            models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id=None,
                asker_id=None,
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])))
        self.assertEqual(new_baz_game_room.player_ids, [])

        # check that the game room priorities were correctly updated
        self.assertEqual(
            player_router.game_room_priorities,
            [[baz_room_id],[]])

        # check that foo and bar's game wasn't affected
        self.assertEqual(
            foo_bar_game_room,
            player_router.game_rooms[
                player_router.player_matches['foo']])

        # delete a player from a paired game

        player_router.delete_player('bar')

        # check the player was deleted
        self.assertTrue('foo' in player_router.players)
        self.assertTrue('bar' not in player_router.players)
        self.assertTrue('foo' in player_router.player_matches)
        self.assertTrue('bar' not in player_router.player_matches)

        # check that the game room was not deleted
        self.assertEqual(len(player_router.game_rooms), 2)

        # check that the game room was updated
        game_room = player_router.game_rooms[
            player_router.player_matches['foo']]
        self.assertEqual(
            game_room.game,
            models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id='foo',
                asker_id=None,
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])))
        self.assertEqual(game_room.player_ids, ['foo'])

        # check that the game room priorities were correctly updated
        self.assertEqual(
            player_router.game_room_priorities,
            [[baz_room_id], [game_room.room_id]])

    def test_start_playing(self):
        """Test the ``PlayerRouter.start_playing`` method."""

        # create some players

        player_router =  models.PlayerRouter(
            game_rooms={},
            players={},
            game_room_priorities=[],
            player_matches={})
        player_router.create_player('foo')
        player_router.create_player('bar')
        player_router.create_player('baz')

        # start foo playing
        player_router.start_playing('foo')
        self.assertEqual(
            player_router.players['foo'],
            models.Player(
                player_id='foo',
                status=models.PLAYERSTATUSES['PLAYING']))

    def test_finish_game(self):
        # the method is just a wrapper around delete player for now.
        pass

    def test_go_inactive(self):
        """Test the ``PlayerRouter.go_inactive`` method."""

        # create some players

        player_router = models.PlayerRouter(
            game_rooms={},
            players={},
            game_room_priorities=[],
            player_matches={})
        player_router.create_player('foo')
        player_router.create_player('bar')
        player_router.create_player('baz')

        player_router.start_playing('foo')

        # check pre-conditions

        # check that the players all have the correct status
        self.assertEqual(
            player_router.players['foo'].status,
            models.PLAYERSTATUSES['PLAYING'])
        self.assertEqual(
            player_router.players['bar'].status,
            models.PLAYERSTATUSES['READYTOPLAY'])
        self.assertEqual(
            player_router.players['baz'].status,
            models.PLAYERSTATUSES['WAITING'])

        # check that game room priorities is correctly set
        baz_room_id = player_router.player_matches['baz']
        self.assertEqual(
            player_router.game_room_priorities,
            [[], [baz_room_id]])

        # test setting a player in the WAITING state to inactive

        foo_bar_game_room_before = player_router.game_rooms[
            player_router.player_matches['foo']]

        player_router.go_inactive('baz')

        foo_bar_game_room_after = player_router.game_rooms[
            player_router.player_matches['foo']]

        # check that the players have the correct status and game room
        # matches
        self.assertEqual(
            player_router.players['foo'].status,
            models.PLAYERSTATUSES['PLAYING'])
        self.assertEqual(
            player_router.player_matches['foo'],
            foo_bar_game_room_before.room_id)
        self.assertEqual(
            player_router.players['bar'].status,
            models.PLAYERSTATUSES['READYTOPLAY'])
        self.assertEqual(
            player_router.player_matches['bar'],
            foo_bar_game_room_before.room_id)
        self.assertEqual(
            player_router.players['baz'].status,
            models.PLAYERSTATUSES['INACTIVE'])
        self.assertEqual(
            player_router.player_matches['baz'],
            None)

        # check that foo and bar's game is unaffected
        self.assertEqual(
            foo_bar_game_room_before,
            foo_bar_game_room_after)

        # check that baz's game is correctly updated
        self.assertEqual(
            player_router.game_rooms[baz_room_id].game,
            models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id=None,
                asker_id=None,
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])))

        # check that game room priorities were correctly updated
        self.assertEqual(
            player_router.game_room_priorities,
            [[baz_room_id],[]])

        # test setting a player in the READYTOPLAY state to inactive

        foo_bar_game_room_before = player_router.game_rooms[
            player_router.player_matches['foo']]

        # check player statuses as pre-conditions
        self.assertEqual(
            player_router.players['foo'].status,
            models.PLAYERSTATUSES['PLAYING'])
        self.assertEqual(
            player_router.players['bar'].status,
            models.PLAYERSTATUSES['READYTOPLAY'])
        self.assertEqual(
            player_router.players['baz'].status,
            models.PLAYERSTATUSES['INACTIVE'])

        player_router.go_inactive('bar')

        foo_bar_game_room_after = player_router.game_rooms[
            player_router.player_matches['foo']]

        # verify all players have correct status and correct game room
        # matches
        self.assertEqual(
            player_router.players['foo'].status,
            models.PLAYERSTATUSES['PLAYING'])
        self.assertEqual(
            player_router.player_matches['foo'],
            foo_bar_game_room_before.room_id)
        self.assertEqual(
            player_router.players['bar'].status,
            models.PLAYERSTATUSES['INACTIVE'])
        self.assertEqual(
            player_router.player_matches['bar'],
            None)
        self.assertEqual(
            player_router.players['baz'].status,
            models.PLAYERSTATUSES['INACTIVE'])
        self.assertEqual(
            player_router.player_matches['baz'],
            None)

        # check that foo and bar's game was updated correctly
        self.assertEqual(
            foo_bar_game_room_after,
            models.GameRoom(
                room_id=foo_bar_game_room_before.room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id='foo',
                    asker_id=None,
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['foo']))

        # check that baz's game was unaffected
        self.assertEqual(
            player_router.game_rooms[baz_room_id].game,
            models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id=None,
                asker_id=None,
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])))

        # check that game room priorities are correctly set
        self.assertEqual(
            player_router.game_room_priorities,
            [[baz_room_id], [foo_bar_game_room_before.room_id]])

        # test setting a player in the PLAYING state to inactive

        foo_bar_game_room_before = player_router.game_rooms[
            player_router.player_matches['foo']]

        # check player statuses as pre-condition
        self.assertEqual(
            player_router.players['foo'].status,
            models.PLAYERSTATUSES['PLAYING'])
        self.assertEqual(
            player_router.players['bar'].status,
            models.PLAYERSTATUSES['INACTIVE'])
        self.assertEqual(
            player_router.players['baz'].status,
            models.PLAYERSTATUSES['INACTIVE'])

        player_router.go_inactive('foo')

        foo_bar_game_room_after = player_router.game_rooms[
            foo_bar_game_room_before.room_id]

        # check player statuses and game room matches
        self.assertEqual(
            player_router.players['foo'].status,
            models.PLAYERSTATUSES['INACTIVE'])
        self.assertEqual(
            player_router.player_matches['foo'],
            None)
        self.assertEqual(
            player_router.players['bar'].status,
            models.PLAYERSTATUSES['INACTIVE'])
        self.assertEqual(
            player_router.player_matches['bar'],
            None)
        self.assertEqual(
            player_router.players['baz'].status,
            models.PLAYERSTATUSES['INACTIVE'])
        self.assertEqual(
            player_router.player_matches['baz'],
            None)

        # check that foo and bar's game room was correctly updated
        self.assertEqual(
            foo_bar_game_room_after,
            models.GameRoom(
                room_id=foo_bar_game_room_before.room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id=None,
                    asker_id=None,
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=[]))

        # check that baz's game room was unaffected
        self.assertEqual(
            player_router.game_rooms[baz_room_id].game,
            models.Game(
                state=models.STATES['CHOOSESUBJECT'],
                answerer_id=None,
                asker_id=None,
                round_=models.Round(
                    subject=None,
                    guess_and_answer=None,
                    question_and_answers=[])))

        # check that game room priorities are correctly set
        self.assertEqual(
            player_router.game_room_priorities,
            [[baz_room_id, foo_bar_game_room_before.room_id], []])

    def test_go_active(self):
        """Test the ``PlayerRouter.go_active`` method."""

        # create some players

        player_router = models.PlayerRouter(
            game_rooms={},
            players={},
            game_room_priorities=[],
            player_matches={})
        player_router.create_player('foo')
        player_router.create_player('bar')
        player_router.create_player('baz')

        foo_bar_game_room_id = player_router.player_matches['foo']
        baz_game_room_id = player_router.player_matches['baz']

        player_router.start_playing('foo')

        player_router.go_inactive('bar')
        player_router.go_inactive('baz')

        # check pre-conditions

        # check that the players have correct status and are matched to
        # games correctly
        self.assertEqual(
            player_router.players['foo'].status,
            models.PLAYERSTATUSES['PLAYING'])
        self.assertEqual(
            player_router.player_matches['foo'],
            foo_bar_game_room_id)
        self.assertEqual(
            player_router.players['bar'].status,
            models.PLAYERSTATUSES['INACTIVE'])
        self.assertEqual(
            player_router.player_matches['bar'],
            None)
        self.assertEqual(
            player_router.players['baz'].status,
            models.PLAYERSTATUSES['INACTIVE'])
        self.assertEqual(
            player_router.player_matches['baz'],
            None)

        # check the state of the game rooms
        foo_bar_game_room_before = player_router.game_rooms[
            foo_bar_game_room_id]

        self.assertEqual(
            foo_bar_game_room_before,
            models.GameRoom(
                room_id=foo_bar_game_room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id='foo',
                    asker_id=None,
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['foo']))

        baz_game_room_before = player_router.game_rooms[
            baz_game_room_id]

        self.assertEqual(
            baz_game_room_before,
            models.GameRoom(
                room_id=baz_game_room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id=None,
                    asker_id=None,
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=[]))

        # check the game room priorities
        self.assertEqual(
            player_router.game_room_priorities,
            [[baz_game_room_id], [foo_bar_game_room_id]])

        # try setting a player to active

        player_router.go_active('baz')

        # check the players' statuses and matches
        self.assertEqual(
            player_router.players['foo'].status,
            models.PLAYERSTATUSES['PLAYING'])
        self.assertEqual(
            player_router.player_matches['foo'],
            foo_bar_game_room_id)
        self.assertEqual(
            player_router.players['bar'].status,
            models.PLAYERSTATUSES['INACTIVE'])
        self.assertEqual(
            player_router.player_matches['bar'],
            None)
        self.assertEqual(
            player_router.players['baz'].status,
            models.PLAYERSTATUSES['READYTOPLAY'])
        self.assertEqual(
            player_router.player_matches['baz'],
            foo_bar_game_room_id)

        # check the game states
        foo_bar_game_room_after = player_router.game_rooms[
            foo_bar_game_room_id]

        self.assertEqual(
            foo_bar_game_room_after,
            models.GameRoom(
                room_id=foo_bar_game_room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id='foo',
                    asker_id='baz',
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['baz', 'foo']))

        baz_game_room_after = player_router.game_rooms[
            baz_game_room_id]

        self.assertEqual(
            baz_game_room_after,
            models.GameRoom(
                room_id=baz_game_room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id=None,
                    asker_id=None,
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=[]))

        # check the game room priorities
        self.assertEqual(
            player_router.game_room_priorities,
            [[baz_game_room_id], []])

        # try setting a second player to active

        player_router.go_active('bar')

        # check the players' statuses and matches
        self.assertEqual(
            player_router.players['foo'].status,
            models.PLAYERSTATUSES['PLAYING'])
        self.assertEqual(
            player_router.player_matches['foo'],
            foo_bar_game_room_id)
        self.assertEqual(
            player_router.players['bar'].status,
            models.PLAYERSTATUSES['WAITING'])
        self.assertEqual(
            player_router.player_matches['bar'],
            baz_game_room_id)
        self.assertEqual(
            player_router.players['baz'].status,
            models.PLAYERSTATUSES['READYTOPLAY'])
        self.assertEqual(
            player_router.player_matches['baz'],
            foo_bar_game_room_id)

        # check the game states
        foo_bar_game_room_after = player_router.game_rooms[
            foo_bar_game_room_id]

        self.assertEqual(
            foo_bar_game_room_after,
            models.GameRoom(
                room_id=foo_bar_game_room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id='foo',
                    asker_id='baz',
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['baz', 'foo']))

        baz_game_room_after = player_router.game_rooms[
            baz_game_room_id]

        self.assertEqual(
            baz_game_room_after,
            models.GameRoom(
                room_id=baz_game_room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id='bar',
                    asker_id=None,
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['bar']))

        # check the game room priorities
        self.assertEqual(
            player_router.game_room_priorities,
            [[], [baz_game_room_id]])

    def test_update_game(self):
        """Test the ``PlayerRouter.update_game`` method."""

        # create some players and a game

        player_router = models.PlayerRouter(
            game_rooms={},
            players={},
            game_room_priorities=[],
            player_matches={})
        player_router.create_player('foo')
        player_router.create_player('bar')

        # try updating the game

        new_game = models.Game(
            state=models.STATES['ASKQUESTION'],
            answerer_id='foo',
            asker_id='bar',
            round_=models.Round(
                subject='baz',
                guess_and_answer=None,
                question_and_answers=[]))

        # check that the games are not equal before the update
        self.assertNotEqual(
            player_router.game_rooms[
                player_router.player_matches['foo']].game,
            new_game)

        player_router.update_game('foo', new_game)

        # check that the games *are* equal after the update
        self.assertEqual(
            player_router.game_rooms[
                player_router.player_matches['foo']].game,
            new_game)

    def test_go_inactive_twice(self):
        """Test that ``go_inactive`` is idempotent.

        This is a regression test.
        """

        # create some players

        player_router = models.PlayerRouter(
            game_rooms={},
            players={},
            game_room_priorities=[],
            player_matches={})
        player_router.create_player('foo')
        player_router.create_player('bar')
        player_router.create_player('baz')

        player_router.start_playing('foo')

        foo_bar_room_id = player_router.player_matches['foo']
        baz_room_id = player_router.player_matches['baz']

        # check pre-conditions

        # check that the players all have the correct status
        self.assertEqual(
            player_router.players['foo'].status,
            models.PLAYERSTATUSES['PLAYING'])
        self.assertEqual(
            player_router.players['bar'].status,
            models.PLAYERSTATUSES['READYTOPLAY'])
        self.assertEqual(
            player_router.players['baz'].status,
            models.PLAYERSTATUSES['WAITING'])

        # check the state of the game rooms
        foo_bar_game_room_before = player_router.game_rooms[
            foo_bar_room_id]
        self.assertEqual(
            foo_bar_game_room_before,
            models.GameRoom(
                room_id=foo_bar_room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id='foo',
                    asker_id='bar',
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['bar', 'foo']))

        baz_game_room_before = player_router.game_rooms[
            baz_room_id]
        self.assertEqual(
            baz_game_room_before,
            models.GameRoom(
                room_id=baz_room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id='baz',
                    asker_id=None,
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['baz']))

        # check that game room priorities is correctly set
        self.assertEqual(
            player_router.game_room_priorities,
            [[], [baz_room_id]])

        # test setting a player in the PLAYING state to inactive twice

        player_router.go_inactive('foo')
        # disable logging to avoid noise in the test output
        logging.disable(logging.WARNING)
        player_router.go_inactive('foo')
        logging.disable(logging.NOTSET)

        foo_bar_game_room_after = player_router.game_rooms[
            foo_bar_room_id]
        baz_game_room_after = player_router.game_rooms[
            baz_room_id]

        # check player statuses and game room matches
        self.assertEqual(
            player_router.players['foo'].status,
            models.PLAYERSTATUSES['INACTIVE'])
        self.assertEqual(
            player_router.player_matches['foo'],
            None)
        self.assertEqual(
            player_router.players['bar'].status,
            models.PLAYERSTATUSES['READYTOPLAY'])
        self.assertEqual(
            player_router.player_matches['bar'],
            foo_bar_room_id)
        self.assertEqual(
            player_router.players['baz'].status,
            models.PLAYERSTATUSES['WAITING'])
        self.assertEqual(
            player_router.player_matches['baz'],
            baz_room_id)

        # check that foo and bar's game room was correctly updated
        self.assertEqual(
            foo_bar_game_room_after,
            models.GameRoom(
                room_id=foo_bar_room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id=None,
                    asker_id='bar',
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['bar']))

        # check that baz's game room was unaffected
        self.assertEqual(
            baz_game_room_after,
            models.GameRoom(
                room_id=baz_room_id,
                game=models.Game(
                    state=models.STATES['CHOOSESUBJECT'],
                    answerer_id='baz',
                    asker_id=None,
                    round_=models.Round(
                        subject=None,
                        guess_and_answer=None,
                        question_and_answers=[])),
                player_ids=['baz']))

        # check that game room priorities are correctly set
        self.assertEqual(
            player_router.game_room_priorities,
            [[], [baz_room_id, foo_bar_room_id]])

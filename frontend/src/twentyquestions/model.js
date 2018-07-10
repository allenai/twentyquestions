/** A model of the 20 Questions Game */

import Data from '../utilities/data';


/* constants */

/** The maximum number of questions that can be asked in a round */
const MAXQUESTIONS = 20;


/** The roles players can have in the game. */
const ROLES = {
    asker: 'asker',
    answerer: 'answerer'
};


/** The states the game can occupy */
const STATES = {
  CHOOSESUBJECT: 'CHOOSESUBJECT',
  ASKQUESTION: 'ASKQUESTION',
  PROVIDEANSWER: 'PROVIDEANSWER',
  MAKEGUESS: 'MAKEGUESS',
  ANSWERGUESS: 'ANSWERGUESS',
  SUBMITRESULTS: 'SUBMITRESULTS'
};


/** The statuses that a player can have */
const PLAYERSTATUSES = {
  READINGINSTRUCTIONS: 'READINGINSTRUCTIONS',
  WAITING: 'WAITING',
  READYTOPLAY: 'READYTOPLAY',
  PLAYING: 'PLAYING',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED'
};


/** The required number of players for a game */
const REQUIREDPLAYERS = 2;


/** The actions that a player can take. */
const PLAYERACTIONS = {
  FINISHREADINGINSTRUCTIONS: 'FINISHREADINGINSTRUCTIONS',
  STARTPLAYING: 'STARTPLAYING',
  FINISHGAME: 'FINISHGAME',
  GOINACTIVE: 'GOINACTIVE',
  GOACTIVE: 'GOACTIVE'
};


/* data models */

/**
 * A class representing an individual player.
 *
 * @extends Data
 */
class Player extends Data {
  /**
   * Create a Player instance.
   *
   * @param {String} playerId - A unique ID for the player.
   * @param {String} status - The current status of the player, must be
   *   one the values enumerated in the PLAYERSTATUSES constant.
   *
   * @return {Player} The new Player instance.
   */
  constructor(
    playerId,
    status
  ) {
    super();

    // bind attributes to instance
    this.playerId = playerId;
    this.status = status;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new Player(
      obj.playerId,
      obj.status
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      playerId: this.playerId,
      status: this.status
    };
  }
}


/**
 * A class representing a question.
 *
 * @extends Data
 */
class Question extends Data {
  /**
   * Create a Question instance.
   *
   * @param {String} askerId - The ID for the player who asked the
   *   question.
   * @param {String} questionText - A string representing the question
   *   asked.
   *
   * @return {Question} The new Question instance.
   */
  constructor(
    askerId,
    questionText
  ) {
    super();

    // bind attributes to instance
    this.askerId = askerId;
    this.questionText = questionText;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new Question(
      obj.askerId,
      obj.questionText
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      askerId: this.askerId,
      questionText: this.questionText
    };
  }
}


/**
 * A class representing an answer.
 *
 * @extends Data
 */
class Answer extends Data {
  /**
   * Create an Answer instance.
   *
   * @param {String} answererId - The ID for the player who provided the
   *   answer.
   * @param {String} answerValue - A string giving the answer to the
   *   question. Must be one of 'always', 'usually', 'sometimes',
   *   'rarely', 'never', 'irrelevant'.
   *
   * @return {Answer} The new Answer instance.
   */
  constructor(
    answererId,
    answerValue
  ) {
    super();

    const allowedValues = [
      'always',
      'usually',
      'sometimes',
      'rarely',
      'never',
      'irrelevant'
    ];
    if (!allowedValues.includes(answerValue)) {
      throw new Error(
        `${answerValue} not in allowed values.`
      );
    }

    // bind attributes to instance
    this.answererId = answererId;
    this.answerValue = answerValue;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new Answer(
      obj.answererId,
      obj.answerValue
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      answererId: this.answererId,
      answerValue: this.answerValue
    };
  }
}


/**
 * A class representing a question-answer pair.
 *
 * @extends Data
 */
class QuestionAndAnswer extends Data {
  /**
   * Create a new QuestionAndAnswer instance.
   *
   * @param {Question} question - The question that was asked.
   * @param {Optional[Answer]} answer - An optional answer. If the
   *   answer is not present, it must be null.
   *
   * @return {QuestionAndAnswer} The new QuestionAndAnswer instance.
   */
  constructor(
    question,
    answer
  ) {
    super();

    // bind attributes to instance
    this.question = question;
    this.answer = answer;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new QuestionAndAnswer(
      Question.fromObject(obj.question),
      obj.answer && Answer.fromObject(obj.answer)
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      question: this.question.toObject(),
      answer: this.answer && this.answer.toObject()
    };
  }
}


/**
 * A class representing a guess.
 *
 * @extends Data
 */
class Guess extends Data {
  /**
   * Create a Guess instance.
   *
   * @param {String} askerId - The ID for the player who made the
   *   guess.
   * @param {String} guessText - A string representing the guess made.
   *
   * @return {Guess} The new Guess instance.
   */
  constructor(
    askerId,
    guessText
  ) {
    super();

    // bind attributes to instance
    this.askerId = askerId;
    this.guessText = guessText;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new Guess(
      obj.askerId,
      obj.guessText
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      askerId: this.askerId,
      guessText: this.guessText
    };
  }
}


/**
 * A class representing an answer to a guess.
 *
 * @extends Data
 */
class GuessAnswer extends Data {
  /**
   * Create a GuessAnswer instance.
   *
   * @param {String} answererId - The ID for the player who provided the
   *   answer to the guess.
   * @param {Boolean} correct - A boolean giving the answer to the guess.
   *
   * @return {GuessAnswer} The new GuessAnswer instance.
   */
  constructor(
    answererId,
    correct
  ) {
    super();

    // bind attributes to instance
    this.answererId = answererId;
    this.correct = correct;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new GuessAnswer(
      obj.answererId,
      obj.correct
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      answererId: this.answererId,
      correct: this.correct
    };
  }
}


/**
 * A class representing a guess - guess answer pair.
 *
 * @extends Data
 */
class GuessAndAnswer extends Data {
  /**
   * Create a new GuessAndAnswer instance.
   *
   * @param {Guess} guess - The guess that was made.
   * @param {Optional[GuessAnswer]} guessAnswer - An optional answer to the
   *   guess. If the answer is not present, it must be null.
   *
   * @return {GuessAndAnswer} The new GuessAndAnswer instance.
   */
  constructor(
    guess,
    guessAnswer
  ) {
    super();

    // bind attributes to instance
    this.guess = guess;
    this.guessAnswer = guessAnswer;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new GuessAndAnswer(
      Guess.fromObject(obj.guess),
      obj.guessAnswer && GuessAnswer.fromObject(obj.guessAnswer)
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      guess: this.guess.toObject(),
      guessAnswer: this.guessAnswer && this.guessAnswer.toObject()
    };
  }
}


/**
 * A class for representing a round of twenty questions.
 *
 * @extends Data
 */
class Round extends Data {
  /**
   * Create a new Round instance.
   *
   * @param {Optional[String]} subject - The subject for this round, or
   *   the object that the asker is trying to guess. If the subject is
   *   not present it must be null.
   * @param {Optional[GuessAndAnswer]} guessAndAnswer - The guess for this
   *   round, or the guess that the asker gets to make at the end of the
   *   game. If the guess is not present it must be null.
   * @param {Array[QuestionAndAnswer]} questionAndAnswers - An array of
   *   QuestionAndAnswer instances representing the questions that have
   *   been asked and the answers that have been given so far in the
   *   round.
   *
   * @return {Round} The new Round instance.
   */
  constructor(
    subject,
    guessAndAnswer,
    questionAndAnswers
  ) {
    super();

    // bind attributes to instance
    this.subject = subject;
    this.guessAndAnswer = guessAndAnswer;
    this.questionAndAnswers = questionAndAnswers;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new Round(
      obj.subject,
      obj.guessAndAnswer && GuessAndAnswer.fromObject(obj.guessAndAnswer),
      obj.questionAndAnswers.map(o => QuestionAndAnswer.fromObject(o))
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      subject: this.subject,
      guessAndAnswer: this.guessAndAnswer && this.guessAndAnswer.toObject(),
      questionAndAnswers: this.questionAndAnswers.map(qa => qa.toObject())
    };
  }
}


/**
 * A class representing the entire state of the 20 Questions game.
 *
 * @extends Data
 */
class Game extends Data {
  /**
   * Create a new Game instance.
   *
   * @param {String} state - A string signifying the current state of
   *   the game. This state captures things like whether or not a new
   *   round just started and we need a subject for it, or whether or
   *   not a player is currently asking a question.
   * @param {Optional[String]} answererId - The playerId for the player who is the
   *   currently the answerer. If answererId is not present it must be null.
   * @param {Optional[String]} askerId - The playerId for the player who is the
   *   currently the asker. If askerId is not present it must be null.
   * @param {Round} round - Data recording what happened
   *   during the round of 20 Questions.
   *
   * @return {Game} The new Game instance.
   */
  constructor(
    state,
    answererId,
    askerId,
    round
  ) {
    super();

    // bind attributes to instance
    this.state = state;
    this.answererId = answererId;
    this.askerId = askerId;
    this.round = round;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new Game(
      obj.state,
      obj.answererId,
      obj.askerId,
      Round.fromObject(obj.round)
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      state: this.state,
      answererId: this.answererId,
      askerId: this.askerId,
      round: this.round.toObject()
    };
  }

  /**
   * Return a new Game in which a subject has been chosen for the round.
   *
   * Return a new Game in which the subject for the round has been set
   * to subject and the Game is in state ASKQUESTION.  chooseSubject can
   * only be called by the answerer when the game is in state
   * CHOOSESUBJECT. Calling chooseSubject any other way is an error.
   *
   * @param {String} answererId - The playerId for the player who is
   *   setting the subject. The player setting the subject should be the
   *   answerer.
   * @param {String} subject - The subject to set for the round.
   *
   * @return {Game} A new Game instance in which the subject has been
   *   set on the round.
   */
  chooseSubject(answererId, subject) {
    // check pre-conditions
    if (this.state !== STATES.CHOOSESUBJECT) {
      throw new Error(
        'A subject can only be set when the game is in state'
          + ' "CHOOSESUBJECT".'
      );
    } else if (answererId !== this.answererId) {
      throw new Error(
        'Only the answerer can set the subject.'
      );
    }

    return this.copy({
      state: STATES.ASKQUESTION,
      round: this.round.copy({subject})
    });
  }

  /**
   * Return a new Game where askerId has asked questionText.
   *
   * Return a new Game where askerId has asked questionText and the Game
   * is in state PROVIDEANSWER. askQuestion can only be called by the
   * asker in state ASKQUESTION. Calling askQuestion any other way is an
   * error.
   *
   * @param {String} askerId - The ID for the player who asked the
   *   question.
   * @param {String} questionText - A string representing the question to be
   *   asked.
   *
   * @returns {Game} The game with the new question asked.
   */
  askQuestion(askerId, questionText) {
    // check pre-conditions
    if (this.state !== STATES.ASKQUESTION) {
      throw new Error(
        'A question can only be asked when the game is in state'
          + ' "ASKQUESTION".'
      );
    } else if (askerId !== this.askerId) {
      throw new Error(
        'Only the asker can ask a question.'
      );
    }

    return this.copy({
      state: STATES.PROVIDEANSWER,
      round: this.round.copy({
        questionAndAnswers: [
          QuestionAndAnswer.fromObject({
            question: Question.fromObject({
              askerId,
              questionText
            }),
            answer: null
          }),
          ...this.round.questionAndAnswers
        ]
      })
    });
  }

  /**
   * Return a new Game where answererId has provided answerValue.
   *
   * Return a new Game where answererId has provided answerValue. If
   * fewer than 20 Questions have been asked, then the new Game is in
   * state ASKQUESTION. If 20 Questions have been asked, then the new
   * game is in state MAKEGUESS. provideAnswer can only be called by the
   * answerer in state PROVIDEQUESTION. Calling provideAnswer any other
   * way is an error.
   *
   * @param {String} answererId - The ID for the player who's answering
   *   the question.
   * @param {String} answerValue - A string representing the answer to
   *   the most recently asked question. Must be one of the allowed
   *   values for an answer, @see Answer.
   *
   * @returns {Game} The game with the most recent question answered.
   */
  provideAnswer(answererId, answerValue) {
    // check pre-conditions
    if (this.state !== STATES.PROVIDEANSWER) {
      throw new Error(
        'An answer can only be provided when the game is in state'
          + ' "PROVIDEANSWER".'
      );
    } else if (answererId !== this.answererId) {
      throw new Error(
        'Only the answerer can provide an answer.'
      );
    }

    // update the round with the new answer
    const [
      mostRecentQuestionAndAnswer,
      ...restQuestionAndAnswers
    ] = this.round.questionAndAnswers;
    if (mostRecentQuestionAndAnswer.answer !== null) {
      throw new Error(
        'A question cannot be answered twice.'
      );
    }
    const updatedRound = this.round.copy({
      questionAndAnswers: [
        mostRecentQuestionAndAnswer.copy({
          answer: Answer.fromObject({answererId, answerValue})
        }),
        ...restQuestionAndAnswers
      ]
    });

    // determine if the round is ready for the guess to be made
    const questionsLeft = (
      updatedRound.questionAndAnswers.length < MAXQUESTIONS
    );

    return this.copy({
      state: questionsLeft ? STATES.ASKQUESTION : STATES.MAKEGUESS,
      round: updatedRound
    });
  }

  /**
   * Return a new Game where askerId has made guess.
   *
   * The new Game will be in state ANSWERGUESS. makeGuess can only be
   * called by the asker when the game is in state MAKEGUESS. Calling
   * makeGuess any other way is an error.
   *
   * @param {String} askerId - The ID for the player who is making the
   *   guess.
   * @param {String} guessText - The text of the guess.
   *
   * @return {Game} The new Game instance with the guess made.
   */
  makeGuess(askerId, guessText) {
    // check pre-conditions
    if (this.state !== STATES.MAKEGUESS) {
      throw new Error(
        'A guess can only be made when the game is in state'
          + ' "MAKEGUESS".'
      );
    } else if (askerId !== this.askerId) {
      throw new Error(
        'Only the asker can make a guess.'
      );
    }

    // make the guess
    if (this.round.guessAndAnswer !== null) {
      throw new Error(
        'A guess cannot be made twice.'
      );
    }

    return this.copy({
      state: STATES.ANSWERGUESS,
      round: this.round.copy({
        guessAndAnswer: GuessAndAnswer.fromObject({
          guess: Guess.fromObject({
            askerId: askerId,
            guessText: guessText
          }),
          guessAnswer: null
        })
      })
    });
  }


  /**
   * Return a new Game where answererId has answered the guess.
   *
   * The new game is in state SUBMITRESULTS.
   *
   * @param {String} answererId - The ID of the player who answered the
   *   guess.
   * @param {Boolean} correct - Whether or not the guess is correct.
   *
   * @return {Game} The new Game instance with the guess answered.
   */
  answerGuess(answererId, correct) {
    // check pre-conditions
    if (this.state !== STATES.ANSWERGUESS) {
      throw new Error(
        'An guess may only be answered when the game is in state'
          + ' "ANSWERGUESS".'
      );
    } else if (answererId !== this.answererId) {
      throw new Error(
        'Only the answerer can answer a guess.'
      );
    }

    // answer the guess
    if (this.round.guessAndAnswer.guessAnswer !== null) {
      throw new Error(
        'A guess cannot be answered twice.'
      );
    }

    return this.copy({
      state: STATES.SUBMITRESULTS,
      round: this.round.copy({
        guessAndAnswer: this.round.guessAndAnswer.copy({
          guessAnswer: GuessAnswer.fromObject({
            answererId: answererId,
            correct: correct
          })
        })
      })
    });
  }
}


/**
 * A class representing a single room with a game in it.
 *
 * @extends Data
 */
class GameRoom extends Data {
  /**
   * Create a new GameRoom instance.
   *
   * @param {String} roomId - The ID for the game room.
   * @param {Game} game - The Game instance being played in the game
   *   room.
   * @param {Array[String]} playerIds - The IDs for the players
   *   currently in the game room.
   *
   * @return {GameRoom} The new GameRoom instance.
   */
  constructor(
    roomId,
    game,
    playerIds
  ) {
    super();

    // bind attributes to instance
    this.roomId = roomId;
    this.game = game;
    this.playerIds = playerIds;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new GameRoom(
      obj.roomId,
      Game.fromObject(obj.game),
      obj.playerIds
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      roomId: this.roomId,
      game: this.game.toObject(),
      playerIds: this.playerIds
    };
  }
}



/** Define exports. */

/** The exports for this module. */
const Model = {
  MAXQUESTIONS,
  ROLES,
  STATES,
  PLAYERSTATUSES,
  REQUIREDPLAYERS,
  PLAYERACTIONS,
  Player,
  Question,
  Answer,
  QuestionAndAnswer,
  Guess,
  GuessAnswer,
  GuessAndAnswer,
  Round,
  Game,
  GameRoom
};


export default Model;

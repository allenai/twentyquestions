/** A model of the 20 Questions Game */


/* helper classes and functions */

/** A base class for representing data. */
class Data {
  /**
   * Create an instance of this class from an object.
   *
   * @param {Object} obj - An object containing information for
   *   instantiating the class.
   *
   * @return {Data} An instance of the class instantiated from obj.
   */
  static fromObject(obj) {
    throw new Error('Not implemented.');
  }

  /**
   * Return the instance serialized into an object.
   *
   * @return {Object} This instance serialized as an object.
   */
  toObject() {
    throw new Error('Not implemented.');
  }

  /**
   * Return an instance of the class created from the JSON data.
   *
   * @param {String} jsonString - A JSON string from which to create the
   *   instance.
   *
   * @return {Data} An instance of the class instantiated from
   *   jsonString.
   */
  static fromJSON(jsonString) {
    return this.fromObject(JSON.parse(jsonString));
  }

  /**
   * Return the instance serialized as a JSON string.
   *
   * @return {String} The instance serialized as a JSON string.
   */
  toJSON() {
    return JSON.stringify(this.toObject());
  }

  /**
   * Return a copy of this instance, updating attributes with data.
   *
   * @param {Object} data - An object containing key-value pairs to
   *   update in the newly returned instance.
   *
   * @return {Data} A copy of this instance with the attributes defined
   *   in data overriden.
   */
  copy(data) {
    return Object.assign(new this.constructor, this, data);
  }
}



/* constants */

/** The maximum number of questions that can be asked in a round */
const MAXQUESTIONS = 20;


/** The states the game can occupy */
const STATES = {
  CHOOSESUBJECT: 'CHOOSESUBJECT',
  ASKQUESTION: 'ASKQUESTION',
  PROVIDEANSWER: 'PROVIDEANSWER'
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
   *
   * @return {Player} The new Player instance.
   */
  constructor(
    playerId
  ) {
    super();

    // bind attributes to instance
    this.playerId = playerId;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new Player(
      obj.playerId
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      playerId: this.playerId
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
   * @param {Boolean} isGuess - A boolean indicating whether or not this
   *   question was a guess.
   *
   * @return {Question} The new Question instance.
   */
  constructor(
    askerId,
    questionText,
    isGuess
  ) {
    super();

    // bind attributes to instance
    this.askerId = askerId;
    this.questionText = questionText;
    this.isGuess = isGuess;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new Question(
      obj.askerId,
      obj.questionText,
      obj.isGuess
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      askerId: this.askerId,
      questionText: this.questionText,
      isGuess: this.isGuess
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
   * @param {Boolean} answerBool - The yes-no answer to the question.
   *
   * @return {Answer} The new Answer instance.
   */
  constructor(
    answererId,
    answerBool
  ) {
    super();

    // bind attributes to instance
    this.answererId = answererId;
    this.answerBool = answerBool;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new Answer(
      obj.answererId,
      obj.answerBool
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      answererId: this.answererId,
      answerBool: this.answerBool
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
 * A class for representing a round of twenty questions.
 *
 * @extends Data
 */
class Round extends Data {
  /**
   * Create a new Round instance.
   *
   * @param {String} answererId - The playerId for the player who is
   *   the answerer for this round.
   * @param {Array[String]} askerIds - An array of strings providing the
   *   playerIds for the players who are askers for this round.
   * @param {Optional[String]} subject - The subject for this round, or the object
   *   that the askers are trying to guess. If the subject is not present
   *   it must be null.
   * @param {Array[QuestionAndAnswer]} questionAndAnswers - An array of
   *   QuestionAndAnswer instances representing the questions that have
   *   been asked and the answers that have been given so far in the
   *   round.
   *
   * @return {Round} The new Round instance.
   */
  constructor(
    answererId,
    askerIds,
    subject,
    questionAndAnswers
  ) {
    super();

    // bind attributes to instance
    this.answererId = answererId;
    this.askerIds = askerIds;
    this.subject = subject;
    this.questionAndAnswers = questionAndAnswers;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new Round(
      obj.answererId,
      obj.askerIds,
      obj.subject,
      obj.questionAndAnswers.map(o => QuestionAndAnswer.fromObject(o))
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      answererId: this.answererId,
      askerIds: this.askerIds,
      subject: this.subject,
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
   * @param {Array[Player]} players - An array of the players for the game.
   * @param {String} state - A string signifying the current state of
   *   the game. This state captures things like whether or not a new
   *   round just started and we need a subject for it, or whether or
   *   not a player is currently asking a question.
   * @param {Optional[String]} activeAskerId - The playerId of the
   *   asker who is currently allowed to ask a question.
   * @param {Optional[Round]} currentRound - The current round of the
   *   game. This attribute may be null in which case the game has no
   *   current round.
   * @param {Array[Round]} pastRounds - A list of rounds that have been
   *   played in the game so far.
   *
   * @return {Game} The new Game instance.
   */
  constructor(
    players,
    state,
    activeAskerId,
    currentRound,
    pastRounds
  ) {
    super();

    // bind attributes to instance
    this.players = players;
    this.state = state;
    this.activeAskerId = activeAskerId;
    this.currentRound = currentRound;
    this.pastRounds = pastRounds;
  }

  /** @see documentation for Data. */
  static fromObject(obj) {
    return new Game(
      obj.players.map(o => Player.fromObject(o)),
      obj.state,
      obj.activeAskerId,
      Round.fromObject(obj.currentRound),
      obj.pastRounds.map(o => Round.fromObject(o))
    );
  }

  /** @see documentation for Data. */
  toObject() {
    return {
      players: this.players.map(p => p.toObject()),
      state: this.state,
      activeAskerId: this.activeAskerId,
      currentRound: this.currentRound.toObject(),
      pastRounds: this.pastRounds.map(r => r.toObject())
    };
  }

  /**
   * Return a new Game in which a subject has been chosen for the round.
   *
   * Return a new Game in which the subject for the current round has
   * been set to subject and the Game is in state ASKQUESTION.
   * chooseSubject can only be called by the answerer when the game is
   * in state CHOOSESUBJECT. Calling chooseSubject any other way is an
   * error.
   *
   * @param {String} answererId - The playerId for the player who is
   *   setting the subject. The player setting the subject should be the
   *   answerer for the round.
   * @param {String} subject - The subject to set for the round.
   *
   * @return {Game} A new Game instance in which the subject has been
   *   set on the current round.
   */
  chooseSubject(answererId, subject) {
    // check pre-conditions
    if (this.state !== STATES.CHOOSESUBJECT) {
      throw new Error(
        'A subject can only be set when the game is in state'
          + ' "CHOOSESUBJECT".'
      );
    } else if (answererId !== this.currentRound.answererId) {
      throw new Error(
        'Only the answerer can set the subject.'
      );
    }

    return this.copy({
      activeAskerId: this.currentRound.askerIds[0] || null,
      state: STATES.ASKQUESTION,
      currentRound: this.currentRound.copy({subject})
    });
  }

  /**
   * Return a new Game where askerId has asked questionText.
   *
   * Return a new Game where askerId has asked questionText, the Game is
   * in state PROVIDEANSWER, and the active asker has been advanced to
   * the next asker. askQuestion can only be called by the active asker
   * in state ASKQUESTION. Calling askQuestion any other way is an
   * error.
   *
   * @param {String} askerId - The ID for the player who asked the
   *   question.
   * @param {String} questionText - A string representing the question to be
   *   asked.
   * @param {Boolean} isGuess - A boolean indicating whether or not this
   *   question is a guess at what the subject is.
   *
   * @returns {Game} The game with the new question asked.
   */
  askQuestion(askerId, questionText, isGuess) {
    // check pre-conditions
    if (this.state !== STATES.ASKQUESTION) {
      throw new Error(
        'A question can only be asked when the game is in state'
          + ' "ASKQUESTION".'
      );
    } else if (askerId !== this.activeAskerId) {
      throw new Error(
        'Only the active asker can ask a question.'
      );
    }

    // create the QuestionAndAnswer instance to be inserted
    const newQuestionAndAnswer = QuestionAndAnswer.fromObject({
      question: Question.fromObject({
        askerId,
        questionText,
        isGuess
      }),
      answer: null
    });

    // advance the active asker to the next asker
    const askerIds = this.currentRound.askerIds;
    const activeAskerIdIndex = askerIds.findIndex(
      id => id === this.activeAskerId
    );
    const newActiveAskerId = askerIds[
      (activeAskerIdIndex + 1) % askerIds.length
    ];

    return this.copy({
      activeAskerId: newActiveAskerId,
      state: STATES.PROVIDEANSWER,
      currentRound: this.currentRound.copy({
        questionAndAnswers: [
          newQuestionAndAnswer,
          ...this.currentRound.questionAndAnswers
        ]
      })
    });
  }

  /**
   * Return a new Game where answererId has provided answerBool.
   *
   * Return a new Game where answererId has provided answerBool. If the
   * current round should continue, then the new Game is in state
   * ASKQUESTION. If a new round should start, then the new game is in
   * state CHOOSESUBJECT, the answerer is advanced to the next player,
   * and a new active asker is set. provideAnswer can only be called by
   * the answerer in state PROVIDEQUESTION. Calling provideAnswer any
   * other way is an error.
   *
   * @param {String} answererId - The ID for the player who's answering
   *   the question.
   * @param {Boolean} answerBool - A boolean representing the answer to
   *   the most recently asked question.
   *
   * @returns {Game} The game with the most recent question answered.
   */
  provideAnswer(answererId, answerBool) {
    // check pre-conditions
    if (this.state !== STATES.PROVIDEANSWER) {
      throw new Error(
        'An answer can only be provided when the game is in state'
          + ' "PROVIDEANSWER".'
      );
    } else if (answererId !== this.currentRound.answererId) {
      throw new Error(
        'Only the answerer can provide an answer.'
      );
    }

    // update the current round with the new answer
    const [
      mostRecentQuestionAndAnswer,
      ...restQuestionAndAnswers
    ] = this.currentRound.questionAndAnswers;
    if (mostRecentQuestionAndAnswer.answer !== null) {
      throw new Error(
        'A question cannot be answered twice.'
      );
    }
    const updatedCurrentRound = this.currentRound.copy({
      questionAndAnswers: [
        mostRecentQuestionAndAnswer.copy({
          answer: Answer.fromObject({answererId, answerBool})
        }),
        ...restQuestionAndAnswers
      ]
    });

    // create the new Game that we'll return
    let newGame = null;
    // determine if the round is finished
    const outOfQuestions = (
      updatedCurrentRound.questionAndAnswers.length === MAXQUESTIONS
    );
    const guessedCorrectly = (
      updatedCurrentRound.questionAndAnswers[0].question.isGuess
        && updatedCurrentRound.questionAndAnswers[0].answer.answerBool
    );
    if (outOfQuestions || guessedCorrectly) {
      // advance the answerer to the next player

      const playerIds = this.players.map(p => p.playerId);
      const answererIndex = playerIds.findIndex(
        id => id === updatedCurrentRound.answererId
      );
      // copy playerIds to newAskerIds which we'll mutate
      const newAskerIds = [...playerIds];
      // mutate newAskerIds to remove the new answerer id
      const [newAnswererId] = newAskerIds.splice(
        (answererIndex + 1) % newAskerIds.length,
        1
      );

      newGame = this.copy({
        state: STATES.CHOOSESUBJECT,
        activeAskerId: null,
        currentRound: Round.fromObject({
          answererId: newAnswererId,
          askerIds: newAskerIds,
          subject: null,
          questionAndAnswers: []
        }),
        pastRounds: [
          updatedCurrentRound,
          ...this.pastRounds
        ]
      });
    } else {
      // the active asker id should've been advanced after the most
      // recent question was asked, so we don't need to do that here.
      newGame = this.copy({
        state: STATES.ASKQUESTION,
        currentRound: updatedCurrentRound
      });
    }

    return newGame;
  }
}



/** Define exports. */

/** The exports for this module. */
const model = {
  MAXQUESTIONS,
  STATES,
  Player,
  Question,
  Answer,
  QuestionAndAnswer,
  Round,
  Game
};


export default model;
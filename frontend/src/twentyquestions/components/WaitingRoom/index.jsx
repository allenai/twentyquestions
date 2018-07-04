/** A component for allowing players to enter a game room. */

import React from 'react';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';

import InactiveModal from '../InactiveModal';
import model from '../../model';
import settings from '../../settings';


/** Style rules to apply to the component. */
const styles = theme => ({
  margined: {
    margin: theme.spacing.unit
  },
  padded: {
    padding: theme.spacing.unit * 2
  }
});


/**
 * A react component for the waiting room.
 *
 * @prop {Optional[GameRoom]} gameRoom - The game room.
 * @prop {Optional[Player]} player - The player for this client.
 * @prop {Controller} controller - The controller for the application.
 */
class WaitingRoom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      secondsLeft: settings.SECONDSTORESPOND
    };
  }

  enterGameRoom() {
    const {player, controller} = this.props;

    controller.takePlayerAction(model.PLAYERACTIONS.STARTPLAYING);
  }

  decrement() {
    const {player, controller} = this.props;

    const readyToPlay = player === null ?
          false
          : player.status === model.PLAYERSTATUSES.READYTOPLAY;

    // only change the countdown if in state 'READYTOPLAY'
    if (readyToPlay) {
      const {secondsLeft} = this.state;

      // decrement the countdown
      this.setState({secondsLeft: secondsLeft - 1});

      if (secondsLeft - 1 === 0) {
        this.setState({secondsLeft: settings.SECONDSTORESPOND});

        controller.takePlayerAction(model.PLAYERACTIONS.GOINACTIVE);
      }
    }
  }

  componentDidMount() {
    this.countdown = setInterval(() => this.decrement(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.countdown);
  }

  render() {
    const {classes} = this.props;
    const {gameRoom, player, controller} = this.props;

    let informationalContent = null;
    if (
      player === null
        || player.status === model.PLAYERSTATUSES.WAITING
    ) {
      informationalContent = (
        <Grid container>
            <Grid item xs={12}>
              <Typography
                variant='title'
                align='center'>
                Waiting for Other Player
              </Typography>
              <Typography
                align='center'>
                You're currently waiting for another player to
                join. Once a Turker takes up one of the other HITs,
                we'll match them to you and the game will get
                started.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='headline'>
                Instructions
              </Typography>
              <ol>
                <li>
                  <Typography>
                    The first player is provided a hidden object. It could
                    be concrete like "library" or more abstract like
                    "labor organization".
                  </Typography>
                </li>
                <li>
                  <Typography>
                    The second player will ask 20 yes-no questions
                    about the object. <b>Questions should be as unique
                      as possible</b>. In particular, questions should
                    <i> ask about many different kinds of things</i> and avoid
                    re-using the same key words.
                  </Typography>
                </li>
                <li>
                  <Typography>
                    The first player will answer the questions
                    truthfully, with one of "always", "usually",
                    "sometimes", "rarely", "never" or "irrelevant".
                  </Typography>
                </li>
                <li>
                  <Typography>
                    <b>
                      <i>Only</i> after 20 questions have been asked,
                      the second player will guess what the object is.
                    </b>
                  </Typography>
                </li>
              </ol>
              <Typography>
                Do <b>not</b> ask questions about the letters in the word.
              </Typography>
              <Typography>
                Some of the subjects we provide are difficult to
                guess. We're looking for people to make a good faith
                effort to ask relevant questions and provide truthful
                answers. Also, please treat your partners respectfully.
                Abusive language or personal questions are not
                tolerated.
              </Typography>
            </Grid>
            <Grid item align='center' xs={12}>
              <CircularProgress color='primary'/>
            </Grid>
        </Grid>
      );
    } else if (player.status === model.PLAYERSTATUSES.READYTOPLAY) {
      informationalContent = (
        <Grid container>
            <Grid item xs={12}>
              <Typography
                variant='headline'
                align='center'>
                Ready to Play!
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='subheading'
                align='center'>
                {this.state.secondsLeft} Seconds Left
              </Typography>
            </Grid>
        </Grid>
      );
    } else if (player.status === model.PLAYERSTATUSES.INACTIVE) {
      informationalContent = (
        <InactiveModal
          gameRoom={gameRoom}
          player={player}
          controller={controller}/>
      );
    }

    const readyToPlay = player === null ?
          false
          : player.status === model.PLAYERSTATUSES.READYTOPLAY;

    return (
      <div>
        <Paper className={`${classes.padded} ${classes.margined}`}>
          <Grid
            container
            className={classes.padded}>
            <Grid item xs={12}>
              { informationalContent }
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              className={classes.padded}
              alignContent='center'
              alignItems='center'
              justify='center'>
              <Button
                variant='raised'
                color='primary'
                onClick={() => this.enterGameRoom()}
                disabled={!readyToPlay}>
                Play
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}


export default withStyles(styles)(WaitingRoom);

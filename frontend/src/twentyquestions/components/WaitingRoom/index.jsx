/** A component for allowing players to enter a game room. */

import React from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/Styles';

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
                variant='headline'
                color='primary'>
                Instructions
              </Typography>
              <ol>
                <li>
                  <Typography>
                    The first player is provided a hidden object. It
                    could be concrete like "library" or more abstract
                    like "account".
                  </Typography>
                </li>
                <li>
                  <Typography>
                    The second player will ask 20 yes-no questions
                    about the object. See "How to Ask Good Questions"
                    for instructions on asking great questions.
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
              <Typography gutterBottom>
                Some of the subjects we provide are difficult to
                guess. We're looking for people to make a good faith
                effort to ask relevant questions and provide truthful
                answers. Also, please treat your partners respectfully.
                Abusive language or personal questions are not
                tolerated.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='headline'
                color='primary'
                gutterBottom>
                How to Ask Good Questions
              </Typography>
              <Typography>
                 Questions should be as <b>unique</b> as possible and
                 <b> avoid re-using the same key words</b>. See the table
                 below for examples. Please <span style={ {textDecoration: "underline", color: "#af0000"} }>
                   don't</span> use the examples we provide in your
                 games directly. Come up with your own.
              </Typography>
              <Paper className={classes.margined}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Question Type</TableCell>
                      <TableCell>Examples</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        Things a person would use the object for
                      </TableCell>
                      <TableCell>
                        Can you cut something with it? Could you use it to cook?
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        Things the object does on its own
                      </TableCell>
                      <TableCell>
                        Does it make noise? Does it move?
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        Things the object is capable of, or things people
                        <i> could</i> do with the object.
                      </TableCell>
                      <TableCell>
                        Could it support your weight if you stood on it?
                        Would it fit inside a car?
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        People's feelings and reactions towards the the
                        object?
                      </TableCell>
                      <TableCell>
                        Would someone be happy to own it? Would it surprise
                        someone to see it?
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        Situations the object would typically be in, or
                        situations where a person would find or need the
                        object
                      </TableCell>
                      <TableCell>
                        Would you use the object when it's cold outside? Is
                        it often found at concerts?
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        Where is the object found? When is the object found?
                      </TableCell>
                      <TableCell>
                        Does it only come out at night? Would you find it in
                        a tree?
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
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

/** A component to display instructions to the player. */

import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/Styles';


/** Style rules to apply to the component. */
const styles = theme => ({
  margined: {
    margin: theme.spacing.unit * 2
  },
  padded: {
    padding: theme.spacing.unit * 2
  },
  fancy1: {
    'font-size': '1.2em',
    'font-weight': 'bold',
    color: '#7a0dad'
  },
  fancy2: {
    'font-size': '1.2em',
    'font-style': 'italic',
    color: '#ad1457'
  },
  fancy3: {
    'font-size': '1.2em',
    'font-variant': 'small-caps',
    color: '#e65100'
  },
  sparkling: {
    'font-size': '1.5em',
    'font-style': 'italic',
    color: '#f442b9',
    'font-variant': 'small-caps'
  },
  emphasized: {
    'font-size': '1.2em',
    'font-style': 'italic',
    color: '#00695c'
  },
  warning: {
    'font-size': '1.2em',
    color: '#ba000d'
  }
});


/**
 * A react component for providing instructions to the players.
 */
class Instructions extends React.Component {
  render() {
    const {classes} = this.props;

    return (
      <Grid container>
        <Grid item xs={12}>
          <Typography
            variant='headline'
            color='primary'>
            How to Play The Game
          </Typography>
          <ol>
            <li>
              <Typography>
                The first player is provided a hidden concept. It
                could be a concrete noun like "library", a more abstract
                noun like "account", or a verb like "warn".
              </Typography>
            </li>
            <li>
              <Typography>
                The second player will ask 20 yes-no questions
                about the concept.
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
                  the second player will guess what the concept is.
                </b>
              </Typography>
            </li>
          </ol>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant='headline'
            color='primary'
            gutterBottom>
            What We <b>DO</b> Want
          </Typography>
          <ul>
            <li>
              Be <span className={classes.sparkling}>✨creative✨</span>!
            </li>
            <li>
              Make questions as <span className={classes.fancy1}>unique</span>,
              <span className={classes.fancy2}> diverse</span>, and
              <span className={classes.fancy3}> interesting</span> as possible.
            </li>
            <li>
              Make questions <span className={classes.emphasized}>relevant </span>
              to what you think the subject could be.
            </li>
            <li>
              <span className={classes.warning}>Avoid</span> re-using
              the same questions and key words.
            </li>
            <li>
              Provide your best <b>truthful </b>
              answers.
            </li>
          </ul>
          <Typography>
            See the table below for examples. Please <b>don't</b> use
            these examples directly. Come up with your own.
          </Typography>
          <Paper className={classes.margined}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Question Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Examples</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    Purpose
                  </TableCell>
                  <TableCell>
                    Things a person would use the object or take the
                    action for
                  </TableCell>
                  <TableCell>
                    Can you cut something with it? Would you do it to
                    prepare a meal?
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Behavior
                  </TableCell>
                  <TableCell>
                    Things the object does on its own
                  </TableCell>
                  <TableCell>
                    Does it make noise? Does it move?
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Capabilities
                  </TableCell>
                  <TableCell>
                    Things the object is capable of, or things people
                    <i> could</i> accomplish with the action
                  </TableCell>
                  <TableCell>
                    Could it support your weight if you stood on it?
                    Could you do it to cheer someone up?
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Reactions and Emotions
                  </TableCell>
                  <TableCell>
                    People's feelings and reactions towards the the
                    object or action.
                  </TableCell>
                  <TableCell>
                    Would someone be happy to own it? Would it surprise
                    someone to see it?
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Locations
                  </TableCell>
                  <TableCell>
                    Where or when the object is found or the action occurs.
                  </TableCell>
                  <TableCell>
                    Does it only come out at night? Would you do it at
                    the beach?
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Typical Situations
                  </TableCell>
                  <TableCell>
                    Situations the object would typically be in, or
                    situations where a person would find the object or
                    take the action.
                  </TableCell>
                  <TableCell>
                    Would you use the object when it's cold outside? Is
                    it often seen at concerts?
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant='headline'
            color='primary'>
            What We <b>DO NOT</b> Want
          </Typography>
          <ul>
            <li>questions about the letters in the word.</li>
            <li>questions that are irrelevant to the game, i.e. personal questions.</li>
            <li>questions that include abusive language.</li>
          </ul>
        </Grid>
      </Grid>
    );
  }
}


export default withStyles(styles)(Instructions);

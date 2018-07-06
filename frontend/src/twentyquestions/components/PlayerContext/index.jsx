/** A component for display game context to the player. */

import React from 'react';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import Chip from '@material-ui/core/Chip';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
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
  elbowRoom: {
    paddingLeft: `${theme.spacing.unit * 2}px`,
    paddingRight: `${theme.spacing.unit * 2}px`
  },
  role: {
    textAlign: 'left'
  },
  countInfo: {
    textAlign: 'right'
  },
  [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
    countInfo: {
      textAlign: 'left'
    }
  }
});


/**
 * A react component for displaying relevant context to the player.
 *
 * @prop {Object} playerRole - An object representing the role of the
 *   player.
 * @prop {Number} numPlayers - The number of players in the game
 *   currently.
 * @prop {Number} numQuestionsLeft - The number of questions left to ask
 *   in the round.
 */
class PlayerContext extends React.Component {
  render() {
    const { classes } = this.props;
    const { playerRole, numPlayers, numQuestionsLeft } = this.props;

    const askerName = playerRole.id === 'asker' ?
          'You'
          : 'The other player';
    const answererName = playerRole.id === 'answerer' ?
          'You'
          : 'The other player';

    return (
      <ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Grid container>
            <Grid className={classes.role} item xs={6}>
              <Chip
                avatar={<Avatar><AccountCircleIcon color="primary"/></Avatar>}
                label={<Typography>Role: <b>{playerRole.label}</b></Typography>} />
            </Grid>
            <Grid className={classes.countInfo} item xs={12} sm={6}>
              <Badge badgeContent={numPlayers} color="primary">
                <Typography className={classes.elbowRoom}>Players Present</Typography>
              </Badge>
              <Badge badgeContent={numQuestionsLeft} color="primary">
                <Typography className={classes.elbowRoom}>Questions Left</Typography>
              </Badge>
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container>
            <Grid item xs={12}>
              <Typography
                variant='headline'
                color='primary'>
                Instructions
              </Typography>
              <Typography>
                You are the <b>{playerRole.label}</b>.
              </Typography>
              <ol>
                <li>
                  <Typography>
                    {answererName} is provided a hidden object. It
                    could be concrete like "library" or more abstract
                    like "account".
                  </Typography>
                </li>
                <li>
                  <Typography>
                    {askerName} will ask 20 yes-no questions
                    about the object. See "How to Ask Good Questions"
                    for instructions on asking great questions.
                  </Typography>
                </li>
                <li>
                  <Typography>
                    {answererName} will answer the questions
                    truthfully, with one of "always", "usually",
                    "sometimes", "rarely", "never" or "irrelevant".
                  </Typography>
                </li>
                <li>
                  <Typography>
                    <b>
                      {askerName} will guess what the object
                      is <i>after</i> 20 questions have been asked.
                    </b>
                  </Typography>
                </li>
              </ol>
              <Typography>
                Do <b>not</b> ask questions about the letters in the word.
              </Typography>
              <Typography gutterBottom>
                Some subjects we provide are difficult to guess. Please
                make a good faith effort to ask relevant questions and
                provide truthful answers.  Also, please treat your
                partners respectfully. Abusive language or personal
                questions are not tolerated.
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
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}


export default withStyles(styles)(PlayerContext);

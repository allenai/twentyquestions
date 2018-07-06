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
                variant='headline'>
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
                    like "labor organization".
                  </Typography>
                </li>
                <li>
                  <Typography>
                    {askerName} will ask 20 yes-no questions
                    about the object. <b>Questions should be as unique
                      as possible</b>. In particular, questions should
                    <i> ask about many different kinds of things</i> and avoid
                    re-using the same key words.
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
              <Typography>
                Some of the subjects we provide are difficult to
                guess. We're looking for people to make a good faith
                effort to ask relevant questions and provide truthful
                answers.  Also, please treat your partners respectfully.
                Abusive language or personal questions are not
                tolerated.
              </Typography>
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}


export default withStyles(styles)(PlayerContext);

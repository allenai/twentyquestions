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
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/Styles';

import Instructions from '../Instructions';


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
          <Instructions/>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}


export default withStyles(styles)(PlayerContext);

/** A component for display game context to the player. */

import React from 'react';
import AccountCircleIcon from 'material-ui-icons/AccountCircle';
import Avatar from 'material-ui/Avatar';
import Badge from 'material-ui/Badge';
import Chip from 'material-ui/Chip';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary
} from 'material-ui/ExpansionPanel';
import Grid from 'material-ui/Grid';
import Hidden from 'material-ui/Hidden';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';


/** Style rules to apply to the component. */
const styles = theme => ({
  elbowRoom: {
    paddingLeft: `${theme.spacing.unit * 2}px`,
    paddingRight: `${theme.spacing.unit * 2}px`
  },
  textLeft: {
    textAlign: 'left'
  },
  textRight: {
    textAlign: 'right'
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

    return (
      <ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Grid container>
            <Grid className={classes.textLeft} item xs={6}>
              <Chip
                avatar={<Avatar><AccountCircleIcon color="primary"/></Avatar>}
                label={<Typography>Role: <b>{playerRole.label}</b></Typography>} />
            </Grid>
            <Grid className={classes.textRight} item xs={6}>
              <Hidden xsDown>
                <Badge badgeContent={numPlayers} color="primary">
                  <Typography className={classes.elbowRoom}>Players Present</Typography>
                </Badge>
                <Badge badgeContent={numQuestionsLeft} color="primary">
                  <Typography className={classes.elbowRoom}>Questions Left</Typography>
                </Badge>
              </Hidden>
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography>{playerRole.description}</Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}


export default withStyles(styles)(PlayerContext);

/** A component for informing players that they're banned. */

import React from 'react';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';


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
 * A react component for the banned room.
 *
 * @prop {GameRoom} gameRoom - The game room.
 * @prop {Player} player - The player for this client.
 * @prop {Controller} controller - The controller for the application.
 */
class BannedRoom extends React.Component {
  render() {
    const {classes} = this.props;

    return (
      <div>
        <Paper className={`${classes.padded} ${classes.margined}`}>
          <Grid
            container
            className={classes.padded}>
            <Grid item xs={12}>
              <Typography
                variant='headline'
                align='center'>
                No more games available for you
              </Typography>
              <Typography
                variant='subheading'
                align='center'>
                You've exhausted the number of games you can play. Thanks for participating.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}


export default withStyles(styles)(BannedRoom);

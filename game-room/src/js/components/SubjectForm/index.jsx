/** Components for setting the subject of the round */

import React from 'react';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';


/** Style rules to apply to the component. */
const styles = theme => ({});


/**
 * A react component for the answerer to set the subject of a round.
 *
 * @prop {String} playerId - The ID for the player using this client.
 * @prop {Function} chooseSubject - The controller callback for choosing
 *   a subject.
 */
class SubjectForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ''
    };
  }

  handleChange(e) {
    this.setState({value: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();

    const {chooseSubject, playerId} = this.props;

    chooseSubject(playerId, this.state.value);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <Typography variant='subheading'>
          Choose a Subject
        </Typography>
        <TextField
          id='subject-input'
          label='Subject'
          placeholder='i.e., dog, chair, bowl'
          value={this.state.value}
          autoComplete='off'
          onChange={this.handleChange.bind(this)}
          margin='normal'
          InputLabelProps={ {shrink: true} }
          helperText='Choose an object for the round that the other players will know well.'
          fullWidth/>
      </form>
    );
  }
}


export default withStyles(styles)(SubjectForm);

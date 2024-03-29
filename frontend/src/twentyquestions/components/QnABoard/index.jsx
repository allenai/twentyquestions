/** A component for representing a list of questions and answer. */

import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/Styles';


/** Style rules to apply to the QnABoard component. */
const styles = theme => ({});


/**
 * A react component for representing a question and an answer.
 *
 * @prop {QuestionAndAnswer} questionAndAnswer - The question answer
 *   pair to display.
 */
class QnA extends React.Component {
  render() {
    const { questionAndAnswer } = this.props;

    const question = questionAndAnswer.question;
    const answer = questionAndAnswer.answer;

    const questionText = question.questionText;

    let answerText = null;
    if (answer === null) {
      answerText = '';
    } else {
      answerText = answer.answerValue;
    }

    return (
      <ListItem disableGutters>
        <Tooltip
          id='tooltip-question'
          title='question'>
          <Avatar>Q</Avatar>
        </Tooltip>
        <ListItemText
          primary={ questionText }
          secondary={ answerText }/>
      </ListItem>
    );
  }
}


/**
 * A react component for displaying a list of questions and answers.
 *
 * @prop {Array[QuestionAndAnswer]} questionAndAnswers - An array of the
 *   questions and answers that have been asked so far this round.
 */
class QnABoard extends React.Component {
  render() {
    const { classes } = this.props;
    const { questionAndAnswers } = this.props;

    let qnaComponents = null;
    if (questionAndAnswers.length > 0) {
        qnaComponents = questionAndAnswers
        .map((qna, i) => {
          return (
            <QnA
              key={`qna-${i}`}
              questionAndAnswer={qna}/>
          );
        })
        .reduceRight((acc, val, i) => {
          return [
            val,
            <Divider
              key={`divider-${i}`}
              inset/>,
            acc
          ];
        });
    } else {
      qnaComponents = [];
    }

    return (
      <div>
        <Typography variant='subheading'>
          Questions and Answers
        </Typography>
        <List>
          {qnaComponents}
        </List>
      </div>
     );
  }
}


export default withStyles(styles)(QnABoard);

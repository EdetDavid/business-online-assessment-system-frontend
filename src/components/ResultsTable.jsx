import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tooltip,
  IconButton,
  TablePagination
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

const ResultsTable = ({ responses }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Early return if no responses
  if (!responses || responses.length === 0) {
    return (
      <Box p={2} textAlign="center">
        <Typography variant="body1">No responses available.</Typography>
      </Box>
    );
  }

  // Process the responses to get all question IDs and organize data
  const allQuestions = {};
  
  // First collect all unique questions from all responses
  responses.forEach(response => {
    if (response.answers && response.answers.length > 0) {
      response.answers.forEach(answer => {
        if (answer.question && !allQuestions[answer.question]) {
          // Store question ID as a placeholder
          allQuestions[answer.question] = `Question ${answer.question}`;
        }
      });
    }
  });

  // The table displays the email and then one column per question
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper elevation={2}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Respondent</TableCell>
              <TableCell>Date Submitted</TableCell>
              {Object.keys(allQuestions).map(questionId => (
                <TableCell key={questionId}>
                  <Box display="flex" alignItems="center">
                    {allQuestions[questionId]}
                    <Tooltip title="View full question">
                      <IconButton size="small">
                        <InfoOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {responses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((response) => {
                // Create an object to map question IDs to their answers for this response
                const answerMap = {};
                if (response.answers) {
                  response.answers.forEach(answer => {
                    answerMap[answer.question] = answer.answer_text;
                  });
                }

                return (
                  <TableRow key={response.id}>
                    <TableCell>{response.respondent_email}</TableCell>
                    <TableCell>
                      {new Date(response.submitted_at).toLocaleString()}
                    </TableCell>
                    {Object.keys(allQuestions).map(questionId => (
                      <TableCell key={`${response.id}-${questionId}`}>
                        {answerMap[questionId] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={responses.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default ResultsTable;
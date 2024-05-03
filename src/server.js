const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());
app.post('/api/submit-form', (req, res) => {
  const formData = req.body;

  // Write form data to CSV file
  const csvWriter = createObjectCsvWriter({
    path: 'C:/Users/dhruvi/OneDrive/Documents/GitHub/AI_Based_Interviewer/companydashboard/companyspecific/public/att.csv',
    header: [
      { id: 'firstName', title: 'First Name' },
      { id: 'email', title: 'Email' },
      { id: 'passcode', title: 'Passcode' }
    ],
    append: true
  });

  csvWriter.writeRecords([formData])
    .then(() => {
      console.log('Form data written to CSV file');
      res.sendStatus(200);
    })
    .catch(error => {
      console.error('Error writing form data to CSV:', error);
      res.sendStatus(500);
    });
});

// Updated route to handle submitted results array and compare iteratively
app.post('/submitResults', async (req, res) => {
  const { resultsArray } = req.body;
  const feedbackArray = [];

  // Process the submitted results array iteratively
  for (const result of resultsArray) {
    const { question_text, user_response, answer_text } = result;

    // Construct command to call compare.py
    const command = `python compare.py "${user_response}" "${answer_text}" "${question_text}"`;

    // Wrap the exec call in a Promise for better handling
    const executeCommand = () => {
      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            reject(error);
          }
          if (stderr) {
            console.error(`stderr: ${stderr}`);
          }

          const comparisonResult = stdout.trim().toLowerCase();
          console.log(`Comparison Result for ${question_text}: ${comparisonResult}`);
          console.log(`User Response: ${user_response}`);
          console.log(`Correct Answer: ${answer_text}`);
          console.log(`Question Text: ${question_text}`);
          console.log(); // Add a line break for better readability

          // Add feedback to the array
          feedbackArray.push({
            question_text,
            feedback: comparisonResult, // Assuming the feedback is the comparison result
          });
          resolve();
        });
      });
    };
    app.post('/updateScore', async (req, res) => {
      try {
        const { name, email, totalScore } = req.body;
    
        // Read the CSV file
        const csvFilePath = 'C:/Users/dhruvi/OneDrive/Documents/GitHub/AI_Based_Interviewer/companydashboard/companyspecific/public/att.csv';
        let csvData = fs.readFileSync(csvFilePath, 'utf8');
    
        // Find the last row of the CSV
        const rows = csvData.split('\n');
        const lastRow = rows[rows.length - 2]; // Exclude the header row
        const cells = lastRow.split(',');
    
        // Update the last cell with the total score
        cells[cells.length - 1] = totalScore;
    
        // Update the CSV data with the modified last row
        rows[rows.length - 2] = cells.join(',');
    
        // Write the updated CSV data back to the file
        fs.writeFileSync(csvFilePath, rows.join('\n'), 'utf8');
    
        console.log('Score updated successfully');
        res.sendStatus(200);
      } catch (error) {
        console.error('Error updating score:', error.message);
        res.sendStatus(500);
      }
    });


    // Execute the command asynchronously
    try {
      await executeCommand();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Send a response back to the client with the feedback array
  res.json({ success: true, message: 'Comparison results received successfully!', feedbackArray });
});
app.post('/generateQuestions', async (req, res) => {
  const { totalQuestions, passcode } = req.body;

  let tableName;

  // Determine the table name based on the passcode
  switch (passcode) {
    case '123':
      tableName = 'cpp_questions';
      break;
    case '456':
      tableName = 'dsa_questions';
      break;
    case '789':
      tableName = 'javascript_questions';
      break;
    case '901':
      tableName = 'oops_questions';
      break;
    case '902':
      tableName = 'sql_questions';
      break;
    default:
      return res.status(400).json({ error: 'Invalid passcode' });
  }

  // Adjusting the command to include the count of questions and the table name
  const command = `python main.py --techStack=${tableName} --totalQuestions=${totalQuestions}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }

    const questions = JSON.parse(stdout);

    // Ensure that only the specified number of questions is sent in the response
    res.json({ questions: questions.slice(0, totalQuestions) });
  });
});


app.get('/getTableNames', (req, res) => {
  const command = 'python main.py --getTableNames';

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    const tableNames = JSON.parse(stdout).tableNames;
    res.json({ tableNames });
  });
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'; 


const QuesList = () => {
  const [tableNames, setTableNames] = useState([]);
  const [techStack, setTechStack] = useState('');
  const [numQuestions, setNumQuestions] = useState(0);
  const bodyLanguageFeedback = [
    "You should maintain better eye contact with the interviewer.",
    "Try to appear more confident and relaxed during the interview.",
    "Work on controlling any nervous habits or expressions.",
    "Ensure your facial expressions match the tone of your responses.",
    "Practice maintaining a neutral facial expression to appear composed.",
    "Make sure to smile naturally and appropriately during the interview.",
    "Avoid excessive blinking or fidgeting with your hands or face.",
    "Maintain a steady gaze to convey attentiveness and engagement.",
    "Work on projecting enthusiasm and energy through your facial expressions.",
    "Practice mirroring the interviewer's body language to build rapport.",
    "Focus on maintaining a calm and collected demeanor throughout the interview.",
    "Remember to breathe deeply and evenly to reduce nervousness."
  ];
  
  const [questions, setQuestions] = useState([]);
  const [userResponses, setUserResponses] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [finalResultsMap, setFinalResultsMap] = useState({});
  const [feedbackArray, setFeedbackArray] = useState([]);
  const [isResultsSubmitted, setIsResultsSubmitted] = useState(false);
  const [comparisonResults, setComparisonResults] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [formData, setFormData] = useState({
    passcode: ''
  });

  const spokenTextsRef = useRef([]);

  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  useEffect(() => {
    spokenTextsRef.current = [];
  }, [questions]); // Reset spokenTextsRef when questions change

  useEffect(() => {
    if (feedbackArray.length > 0) {
        handleSpeak("Feedback Results are available. You Can Check Your Score Right On Your Screen , Your Scores are as per your responses.");

        // Select a random feedback message for improving body language
        const randomIndex = Math.floor(Math.random() * bodyLanguageFeedback.length);
        const randomBodyLanguageFeedback = bodyLanguageFeedback[randomIndex];

        // Append randomBodyLanguageFeedback to feedbackArray without using setFeedbackArray
        feedbackArray.push(randomBodyLanguageFeedback);

        handleSpeak(randomBodyLanguageFeedback);
        
        // Calculate total score out of 30
        let score = 0;
        feedbackArray.forEach(feedback => {
            if (feedback.feedback) {
                const scoreMatch = feedback.feedback.match(/score: (\d+)/);
                if (scoreMatch && scoreMatch.length > 1) {
                    const feedbackScore = parseInt(scoreMatch[1]);
                    score += feedbackScore;
                }
            }
        });
        setTotalScore(score);
    }
}, [feedbackArray]);


  

  //transcribe and listen iteratively
  useEffect(() => {
    if (transcript && !listening) {
      const updatedResponses = [...userResponses, transcript];
      setUserResponses(updatedResponses);
      resetTranscript();

      setCurrentQuestionIndex((prevIndex) => {
        const newIndex = prevIndex + 1;

        if (newIndex < questions.length) {
          const currentQuestion = questions[newIndex];
          if (!spokenTextsRef.current.includes(currentQuestion.question_text)) {
            handleSpeak(currentQuestion.question_text);
            spokenTextsRef.current.push(currentQuestion.question_text);
          }
        } else if (newIndex === questions.length) {
          if (!spokenTextsRef.current.includes("Thank you for answering the questions! Your responses are:")) {
            handleSpeak("Thank you for answering the questions! Your responses are: " + updatedResponses.join(', '));
            spokenTextsRef.current.push("Thank you for answering the questions! Your responses are:");
          }

          const updatedResultsMap = {};
          questions.forEach((q, index) => {
            updatedResultsMap[q.question_id] = {
              question_id: q.question_id,
              question_text: q.question_text,
              answer_text: q.answer_text,
              user_response: updatedResponses[index] || "No response",
              difficulty_level: q.difficulty_level,
            };
          });
          setFinalResultsMap(updatedResultsMap);
        }

        return newIndex < questions.length ? newIndex : prevIndex;
      });

      setIsAudioPlaying(true);
    }
  }, [transcript, listening, questions, resetTranscript, currentQuestionIndex, userResponses]);

  useEffect(() => {
    if (!listening) {
      setIsAudioPlaying(false);
    }
  }, [listening]);

  useEffect(() => {
    const video = document.querySelector('.videoTag');
    if (video) {
      if (!isAudioPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  }, [isAudioPlaying]);

  const handleSpeak = (text) => {
    const chunkSize = 150;
    const chunks = [];

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    const playChunk = (index) => {         //speaking questions
      if (index < chunks.length) {
        const utterance = new SpeechSynthesisUtterance(chunks[index]);

        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find((voice) => voice.name.toLowerCase().includes('female'));

        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        utterance.onstart = () => setIsAudioPlaying(true);
        utterance.onend = () => {
          setIsAudioPlaying(false);
          playChunk(index + 1);
        };

        window.speechSynthesis.speak(utterance);
      }
    };

    playChunk(0);
  };

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening();
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/generateQuestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({totalQuestions:3, passcode: formData.passcode }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setUserResponses([]);
      setCurrentQuestionIndex(0);
      handleSpeak(data.questions[0].question_text);
    } catch (error) {
      console.error('Error fetching questions:', error.message);
    }
  };

  const fetchTableNames = async () => {
    try {
      const response = await fetch('http://localhost:5000/getTableNames');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTableNames(data.tableNames);
    } catch (error) {
      console.error('Error fetching table names:', error.message);
    }
  };

  useEffect(() => {
    fetchTableNames();
  }, []);
  const submitResultsToServer = async () => {
    try {
      if (finalResultsMap && questions.length > 0 && !isResultsSubmitted) {
        const resultsArray = Object.values(finalResultsMap).map((result) => ({
          question_id: result.question_id,
          question_text: result.question_text,
          answer_text: result.answer_text,
          difficulty_level: result.difficulty_level,
          user_response: result.user_response,
        }));
  
        const response = await fetch('http://localhost:5000/submitResults', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resultsArray }),
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const feedbackData = await response.json();
  
        console.log('Results submitted successfully!');
  
        setFeedbackArray(feedbackData.feedbackArray);
  
        for (const feedback of feedbackData.feedbackArray) {
          console.log(`Feedback for ${feedback.question_text}: ${feedback.feedback}`);
        }
  
        // Calculate total score out of 30
        let totalScore = 0;
        feedbackData.feedbackArray.forEach(feedback => {
          if (feedback.feedback) {
            const scoreMatch = feedback.feedback.match(/score: (\d+)/);
            if (scoreMatch && scoreMatch.length > 1) {
              const score = parseInt(scoreMatch[1]);
              totalScore += score;
            }
          }
        });
  
        // Update the server with the total score
        const updateScoreResponse = await fetch('http://localhost:5000/updateScore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: formData.name, email: formData.email, totalScore }),
        });
  
        if (!updateScoreResponse.ok) {
          throw new Error('Error updating total score');
        }
  
        console.log('Total score updated successfully!');
      } else {
        console.error("No results to submit. Fetch and answer questions first.");
      }
    } catch (error) {
      console.error('Error submitting results to server:', error.message);
    }
  };
  

 

  const submitResultsManually = () => {
    if (finalResultsMap && questions.length > 0 && !isResultsSubmitted) {
      submitResultsToServer(finalResultsMap, questions);
    } else {
      console.error('No results to submit. Fetch and answer questions first.');
    }
  };
  const handlePasscodeSubmit = async () => {
    try {
      await fetchQuestions();
    } catch (error) {
      console.error('Error submitting passcode:', error.message);
    }
  };

  return (
    <div className='container'>
      
    <h1>Interview Started</h1>
    <label>
        Enter Passcode:
        <input
          type="text"
          value={formData.passcode}
          name="passcode"
          onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
        />
      </label>
      <button onClick={handlePasscodeSubmit}>Submit Passcode</button>
  
      <ul>
        {questions.map((question, index) => (
          <li key={index}>
            <strong>Question Text:</strong> {question.question_text}
          </li>
        ))}
      </ul>
      <div>
        <p>User's Response:</p>
        <ul>
          {userResponses.map((response, index) => (
            <li key={index}>{response}</li>
          ))}
        </ul>
      </div>
      {currentQuestionIndex !== questions.length && (
        <button
          onClick={startListening}
          disabled={!SpeechRecognition.browserSupportsSpeechRecognition() || currentQuestionIndex === questions.length}
        >
          Answer Now
        </button>
      )}
      <br/>
      <br/>
      {finalResultsMap && !isResultsSubmitted && (
        
        <button onClick={submitResultsToServer}>Submit Results to Server</button>
      )}

      {feedbackArray.length > 0 && (
        <div>
          <h2>Feedback Results</h2>
          <p>Total Score out of 30: {totalScore}</p>
        </div>
      )}

      {Object.values(comparisonResults).length > 0 && (
        <div>
          <h2>Comparison Results</h2>
          <ul>
            {Object.values(comparisonResults).map((result, index) => (
              <li key={index}>
                <strong>Question ID:</strong> {result.questionId}
                <br />
                <strong>Comparison Result:</strong> {result.comparisonResult}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuesList;
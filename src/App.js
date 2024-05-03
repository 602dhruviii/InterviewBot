import React, { useState, useRef } from 'react';
import "./App.css";
import QuesList from "./QuesList";
import Form from './Form';
import video1 from "./1.mp4";
import video2 from "./fe.mp4";
import video3 from "./3.mp4";
import interviewImage1 from "./interviewer/interview1.png";
import interviewImage3 from "./interviewer/interview2.png";
import interviewImage2 from "./interviewer/interview3.png";
import logo from "./interviewer/logo.png";
import ld from "./interviewer/PROFILIFY.png"

function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [optionSelected, setOptionSelected] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showCameraFeed, setShowCameraFeed] = useState(false);
  const videoRef = useRef(null);

  const options = [
    { value: video1, label: 'Interviewer 1', image: interviewImage1 },
    { value: video2, label: 'Interviewer 2', image: interviewImage2 },
    { value: video3, label: 'Interviewer 3', image: interviewImage3 }
  ];

  const handleVideoChange = (selectedOption) => {
    setSelectedVideo(selectedOption.value);
    setOptionSelected(true);
  };

  const handleGetStarted = () => {
    setShowLandingPage(false);
  };

  const handleMediaStream = (start) => {
    if (start) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }).catch((error) => {
        console.error('Error accessing camera:', error);
      });
    } else {
      const stream = videoRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  };

  const handleCameraToggle = () => {
    setShowCameraFeed(prevShowCameraFeed => {
      const newShowCameraFeed = !prevShowCameraFeed;
      handleMediaStream(newShowCameraFeed);
      return newShowCameraFeed;
    });
  };

  const handleFormSubmit = () => {
    // Handle form submission logic here
    handleGetStarted(); // Call the function to start after form submission
  };

  return (
    <div className="App">
      {showLandingPage && (
        <>
        <div className='he'>
        <img src={logo} style={{borderRadius:"50%",width:"50px",margin:"10px"}}/>
        <h2>PROFILIFY</h2>
        </div>
        <div className='f'>
          <div className='r'>
            <img src={ld} style={{width:"170vh"}}/>
          </div>
        <div className="landing-page" >
          <Form onFormSubmit={handleFormSubmit} />
        </div>
        </div>
        
        </>
      )}

      {!optionSelected && !showLandingPage && (
        <>
        <div className='he'>
        <img src={logo} style={{borderRadius:"50%",width:"50px",margin:"10px"}}/>
        <h2>PROFILIFY</h2>
        </div>
        <h2 style={{textAlign:"center",fontFamily:"Franklin Gothic Medium"}}>Choose AI Interviewer</h2>
        <div className='avatar-options'>
          {options.map(option => (
            <div key={option.value} className="avatar-option" onClick={() => handleVideoChange(option)}>
              <img src={option.image} alt={option.label} className="avatar-image" />
            </div>
          ))}
        </div>
        </>
      )}

      {selectedVideo && (
        <>
        <div className='b'>
          <video ref={videoRef} className="videoTag" autoPlay loop muted>
            <source src={selectedVideo} type="video/mp4" />
          </video>
         
            <QuesList />
        </div>
          <div className="camera-feed" style={{ display: showCameraFeed ? 'block' : 'none'}}>
            <button onClick={handleCameraToggle}>Close Camera</button>
            <video className="videoPreview" autoPlay playsInline ref={videoRef}></video>
          </div>
          {!showCameraFeed && (
            <button onClick={handleCameraToggle} className="camera-button">Turn On Camera</button>
          )}
        </>
      )}
    </div>
  );
}

export default App;

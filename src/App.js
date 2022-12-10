
import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js'
import './App.css';
//import { TinyFaceDetector, TinyFaceDetectorOptions } from 'face-api.js';

function App() {

  const videoHeight = 480;
  const videoWidth = 640;
  const [initializing, setInitializing] = useState(false);

  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      const MODUL_URL = process.env.PUBLIC_URL + '/models';
      setInitializing(true);


      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODUL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODUL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODUL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODUL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODUL_URL),
      ]).then(startVideo)
    }
    loadModels();
  }, [])

  const startVideo = () => {
    navigator.getUserMedia({
      video: {}
    }, stream => videoRef.current.srcObject = stream,
      err => console.error(err)
    )
  }

  const handleVideoOnPlay = () => {
    setInterval(async() => {
      if(initializing){
        setInitializing(false);
      }
      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
      const displaySize = {
        width:videoWidth,
        height:videoHeight
      }
      faceapi.matchDimensions(canvasRef.current, displaySize);
      const detections = await faceapi.detectAllFaces(videoRef.current,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections,displaySize);
      canvasRef.current.getContext('2d').clearRect(0,0,videoWidth,videoHeight);
      faceapi.draw.drawDetections(canvasRef.current,resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current,resizedDetections);
      faceapi.draw.drawFaceExpressions(canvasRef.current,resizedDetections);
      console.log(detections);
  },100)
  }

  return (
    <div className="App">
      <span>{initializing ? 'initializing' : 'Ready'}</span>
      <div className="display-flex justify-content-center">
        <video ref={videoRef} autoPlay muted height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} />
        <canvas ref={canvasRef} className="position-absolute" />
      </div>
    </div>
  );
}

export default App;

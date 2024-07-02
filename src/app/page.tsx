'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import WebCam from 'react-webcam';

const HomePage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment'
  );
  const [capturing, setCapturing] = useState(false);
  const mediaRecorRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const handelDevices = useCallback((mediaDevices) => {
    setDevices(mediaDevices.filter(({ kind }) => kind === 'videoinput'));
  }, []);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handelDevices);
  }, []);

  function capture() {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
  }

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    mediaRecorRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    });
    mediaRecorRef.current.addEventListener(
      'dataavailable',
      handleDataAvailable
    );

    mediaRecorRef.current.start();
  }, [webcamRef]);

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorRef.current.stop();
    setCapturing(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.download = 'react-webcam-stream-capture.webm';
      a.click();

      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  return (
    <div className='flex h-screen flex-col md:flex-row p-10 md:p-0 gap-y-2 items-center justify-center w-full'>
      <div>
        <WebCam
          audio={false}
          height={360}
          width={720}
          screenshotFormat='image/png'
          ref={webcamRef}
          videoConstraints={{
            height: 1080,
            width: 1920,
            facingMode: facingMode,
            deviceId: selectedDevice,
          }}
        />
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-4'
          onClick={capture}
        >
          Capture photo
        </button>
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-4'
          onClick={() => {
            setFacingMode(facingMode === 'user' ? 'environment' : 'user');
          }}
        >
          Change Camera
        </button>

        {capturing ? (
          <button
            onClick={handleStopCaptureClick}
            className='bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-4'
          >
            Stop capturing
          </button>
        ) : (
          <button
            onClick={handleStartCaptureClick}
            className='bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-4'
          >
            Start capturing
          </button>
        )}

        {devices.length > 0 && (
          <select
            onChange={(e) => selectedDevice(e.target.value)}
            className='bg-white text-black font-bold py-2 px-4 rounded0full mt-4'
          >
            {devices.map((device, index) => (
              <option key={index} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
        )}
      </div>
      <div>
        {imageSrc && (
          <img
            src={imageSrc}
            className='w-1/2 h-1/2 object-cover rounded-lg shadow-lg'
          />
        )}
        {recordedChunks.length > 0 && (
          <video
            controls
            className='w-1/2 h-1/2 object-cover rounded-lg shadow-lg'
          >
            <source
              src={URL.createObjectURL(
                new Blob(recordedChunks, { type: 'video/webm' })
              )}
            />
          </video>
        )}

        {recordedChunks.length > 0 && (
          <button
            onClick={handleDownload}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-4'
          >
            Download
          </button>
        )}

        {recordedChunks.length > 0 && (
          <button
            onClick={() => setRecordedChunks([])}
            className='bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-4'
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePage;

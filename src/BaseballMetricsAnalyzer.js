import React, { useState, useRef, useEffect } from 'react';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlayCircle, PauseCircle, Upload } from 'lucide-react';

const BaseballMetricsAnalyzer = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [metrics, setMetrics] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setMetrics([]);
      setCurrentTime(0);
    }
  };


    // Parse the CSV data
    const csvString = `play_id,title,ExitVelocity,HitDistance,LaunchAngle,video
  5b254850-9e14-48d2-8baf-c3e12ecbe68d,John Jaso homers (6) on a fly ball to center field.,102.9,412,25,https://sporty-clips.mlb.com/YjlLTlpfWGw0TUFRPT1fQTFOVFVWQU1Vd0lBQVFjRFVnQUFDVkpVQUZsWEFnY0FVVlpRQVFGUVVsRUFCZ29D.mp4
  0110e760-5d49-4c53-ad29-e74c787c038d,Evan Longoria homers (34) on a fly ball to left center field.   Kevin Kiermaier scores.,103.1,423,31,https://sporty-clips.mlb.com/OHcxUXlfWGw0TUFRPT1fQmdCUVZBRURVQUlBRFFZR1h3QUFVZ05WQUFCUlVWZ0FWMUlCVXdRTkJsQlZBd29D.mp4
  3b9ecf94-e3fe-4d79-8b33-efe174dfa53e,Marwin Gonzalez homers (13) on a line drive to right field.,106.6,390,22,https://sporty-clips.mlb.com/Mk9vbFBfWGw0TUFRPT1fQlZOWUFRZFNYd1lBWFZGVUF3QUFWUUZmQUZsWFVGSUFWd05RQVFRQlZWVUVCUUVE.mp4
  bda1cb83-dca9-46b2-aaad-6c1f009cd51c,Eddie Rosario homers (10) on a fly ball to right field.,98.5,368,30,https://sporty-clips.mlb.com/ajlhWFpfWGw0TUFRPT1fVkZVQVZRZFdYZ0VBWEFGVFh3QUFCMVJVQUFCVUFnVUFCQVlFVmdNRkNGQUJCUU1G.mp4
  9f87e907-3c4f-4187-8fb0-d6784b3b1f1a,Marcus Semien homers (26) on a fly ball to left field.   Ryon Healy scores.    Yonder Alonso scores.,106,435,32,https://sporty-clips.mlb.com/bGUyNEdfWGw0TUFRPT1fRDFkWlV3RU5WZ1VBQ3dFR0FBQUFBQTVSQUZsVEFWRUFWbE1DQ0FkWEFsRlVWZ01I.mp4
0208ab5b-2ff5-4bc0-9a73-2a6a7b45dcae,Ryan Zimmerman homers (15) on a line drive to left center field.   Anthony Rendon scores.    Stephen Drew scores.,101.5,384,24,https://sporty-clips.mlb.com/MzR3Wk5fWGw0TUFRPT1fQmdOUlhBVldVMUFBQ2dSVVV3QUFVMVZXQUZoVVZGSUFBQVFEVVFSWEJRWUJVMU1E.mp4
8305de36-508a-4d5a-acd1-661fa32061d2,Ehire Adrianza homers (2) on a fly ball to right field.,95,0,38,https://sporty-clips.mlb.com/d1c2Uk5fWGw0TUFRPT1fRGdKUlVRQlJWUVFBRFZJS0J3QUFWUU1IQUFCV0IxQUFCRk1FVmxJR0F3TlRBVlpV.mp4
d46efa1e-5489-46bb-a2ec-953258b12bdc,Jose Reyes homers (8) on a line drive to right center field.    Brandon Nimmo scores.,103.2,397,23,https://sporty-clips.mlb.com/S2xQbzJfWGw0TUFRPT1fVWdWWEFRSlZWMWNBRFZZS1h3QUFCMVFFQUFBSEJnSUFDMUFHQWdZTlV3SlhVbFlG.mp4
fcfc3d82-32dc-40c6-b023-d7ea86633537,Nomar Mazara homers (18) on a fly ball to right center field.    Jurickson Profar scores.,104.4,398,37,https://sporty-clips.mlb.com/TjlXdjZfWGw0TUFRPT1fVUZJSEIxZFFYZ0FBQzFCV0JRQUFBVlZRQUFNRlVWSUFWbEpRVVFzREJ3QldCUUZS.mp4`;
  
    // Parse CSV into array of objects
    const [header, ...rows] = csvString.split('\n');
    const headers = header.split(',');
    const data = rows.map(row => {
      const values = row.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });

    const [selectedVideo, setSelectedVideo] = useState('');

    const handleSelectChange = (event) => {
      const file = event.target.value;
      setSelectedVideo(file);
      // const url = `"'" + {value} + "'"`;
      console.log(file);
      setVideoUrl(file);
      setMetrics([]);
      setCurrentTime(0);
    };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const processFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Simulate metric extraction (in real app, would use computer vision here)
      const time = videoRef.current.currentTime;
      const randomVelocity = 85 + Math.random() * 10; // Simulated velocity between 85-95 mph
      
      if(time > 12){
        return;
      }
      setMetrics(prev => [...prev, {
        time: time.toFixed(1),
        velocity: randomVelocity
      }]);
      // console.log(metrics[metrics.length - 1]);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(videoRef.current.currentTime);
        processFrame();
      });
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', () => {});
      }
    };
  }, [videoUrl]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* <Card className="p-6"> */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => document.getElementById('videoInput').click()}
              className="flex items-center gap-2 button button2"
            >
              <Upload size={20} />
              Upload Video
            </button>
            <input
              id="videoInput"
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {videoUrl && (
              <button 
                onClick={togglePlay}
                variant="outline"
                className="flex items-center gap-2 button button2"
              >
                {isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            )}
          </div>
         
          <select
                  value={selectedVideo}
                  onChange={handleSelectChange}
                  className="w-full p-2 border rounded-md"
                >
                  {data.map((row) => (
                    <option key={row.play_id} value={row.video}>
                      {row.title}
                    </option>
                  ))}
                </select> 
                 {selectedVideo && (
        <div className="mt-4">
                 </div>
      )}
       <br/> <br/> <br/>
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src= {videoUrl}
                  className="w-half h-full"
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  hidden={true}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
              Select or  Upload a baseball video to analyze
              </div>
            )}
          </div>
          {/* {selectedVideo && (
        <div className="mt-4">
          <video 
            src={selectedVideo}
            type="video/mp4"
            controls
            className="w-full max-w-2xl rounded-lg shadow-lg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )} */}

          {metrics.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Velocity Analysis</h3>
              <div className="w-full h-96">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={metrics}
                    margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
                  >
                    <Line 
                      type="monotone" 
                      dataKey="velocity" 
                      stroke="#2563eb" 
                      strokeWidth={2} 
                    />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis 
                      dataKey="time" 
                      label={{ value: 'Time (s)', position: 'insideBottom', offset: -10 }} 
                    />
                    <YAxis 
                      label={{ 
                        value: 'Velocity (mph)', 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: 10
                      }} 
                    />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="text-sm text-gray-600">
                Current velocity: {metrics[metrics.length - 1].velocity.toFixed(1)} mph
              </div>
              <input type="range" min="0" max="150" value={metrics[metrics.length - 1].velocity.toFixed(1)}  style={{ width: "200px", marginTop: "20px" }} /> 
            </div>
          )}
        </div>
        
      {/* </Card> */}
    </div>
  );
};

export default BaseballMetricsAnalyzer;
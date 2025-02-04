# backend/app.py
from flask import Flask, request, jsonify
import cv2
import numpy as np
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

class BallTracker:
    def __init__(self):
        self.previous_position = None
        self.frame_count = 0
        self.pixels_per_foot = 50  # This needs calibration for your camera setup
        
    def detect_ball(self, frame):
        # Convert to HSV for better color segmentation
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Define baseball color range (white/off-white)
        lower_white = np.array([0, 0, 200])
        upper_white = np.array([180, 30, 255])
        
        # Create mask
        mask = cv2.inRange(hsv, lower_white, upper_white)
        
        # Apply morphological operations to remove noise
        kernel = np.ones((3,3), np.uint8)
        mask = cv2.erode(mask, kernel, iterations=1)
        mask = cv2.dilate(mask, kernel, iterations=2)
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        ball_position = None
        for contour in contours:
            area = cv2.contourArea(contour)
            if 50 < area < 300:  # Adjust based on your video
                perimeter = cv2.arcLength(contour, True)
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                
                if circularity > 0.7:  # Check if the contour is roughly circular
                    M = cv2.moments(contour)
                    if M["m00"] != 0:
                        cx = int(M["m10"] / M["m00"])
                        cy = int(M["m01"] / M["m00"])
                        ball_position = (cx, cy)
                        break
        
        return ball_position
    
    def calculate_velocity(self, current_position, fps):
        if self.previous_position is None or current_position is None:
            self.previous_position = current_position
            return None
        
        # Calculate displacement in pixels
        dx = current_position[0] - self.previous_position[0]
        dy = current_position[1] - self.previous_position[1]
        displacement_pixels = np.sqrt(dx**2 + dy**2)
        
        # Convert to feet
        displacement_feet = displacement_pixels / self.pixels_per_foot
        
        # Calculate time between frames
        time_elapsed = 1.0 / fps
        
        # Calculate velocity in feet per second
        velocity_fps = displacement_feet / time_elapsed
        
        # Convert to mph
        velocity_mph = velocity_fps * 0.681818
        
        self.previous_position = current_position
        return velocity_mph

@app.route('/process-frame', methods=['POST'])
def process_frame():
    try:
        # Get the frame data from the request
        data = request.json
        frame_data = data['frame']
        fps = data['fps']
        
        # Decode base64 image
        encoded_data = frame_data.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Process the frame
        tracker = BallTracker()
        ball_position = tracker.detect_ball(frame)
        
        if ball_position:
            velocity = tracker.calculate_velocity(ball_position, fps)
            return jsonify({
                'position': ball_position,
                'velocity': velocity
            })
        
        return jsonify({
            'position': None,
            'velocity': None
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
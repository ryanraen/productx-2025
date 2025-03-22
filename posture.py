import cv2
import mediapipe as mp
import numpy as np
import time

# Initial Calibration
initialHeadTiltAngle = None
initialShoulderTilt = None
initialEyeDist = None
initialHeadY = None

# Initialize Mediapipe Pose
mpPose = mp.solutions.pose
pose = mpPose.Pose()

# Initialize Mediapipe Face mesh
mpFaceMesh = mp.solutions.face_mesh
faceMesh = mpFaceMesh.FaceMesh()

# Mediapipe drawing
mpDrawing = mp.solutions.drawing_utils
mpDrawingStyles = mp.solutions.drawing_styles

# Constant Thresholds
headTiltAngleChangeThreshold = 5
shoulderTiltChangeThreshold = 0.04
eyeDistChangeThreshold = 1.5
headSinkChangeFactorThreshold = 1.2

def calculate_angle(a, b, c):
    """Calculate the angle between three points"""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(cosine_angle)
    
    return np.degrees(angle)


print("📷 Position yourself at a comfortable distance with good posture. Calibration starts in 3 seconds...")
time.sleep(3)  # Give user time to position themselves

# Webcam video capture
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Cannot open camera")
    exit()

while True:
    
    # Capture frame-by-frame
    ret, frame = cap.read()
    
    # if frame is read correctly ret is True
    if not ret:
        print("Can't receive frame (stream end?). Exiting ...")
        break
    # operations on frame
    frame = cv2.flip(frame, 1)
    
    poseResults = pose.process(frame)
    faceResults = faceMesh.process(frame)

    ### POSE DETECTION ###
    if poseResults.pose_landmarks:
        landmarks = poseResults.pose_landmarks.landmark

        # Extract upper body landmarks
        leftShoulder = [landmarks[mpPose.PoseLandmark.LEFT_SHOULDER].x, 
                         landmarks[mpPose.PoseLandmark.LEFT_SHOULDER].y]
        rightShoulder = [landmarks[mpPose.PoseLandmark.RIGHT_SHOULDER].x, 
                          landmarks[mpPose.PoseLandmark.RIGHT_SHOULDER].y]
        leftEar = [landmarks[mpPose.PoseLandmark.LEFT_EAR].x, 
                    landmarks[mpPose.PoseLandmark.LEFT_EAR].y]
        rightEar = [landmarks[mpPose.PoseLandmark.RIGHT_EAR].x, 
                    landmarks[mpPose.PoseLandmark.RIGHT_EAR].y]
        nose = [landmarks[mpPose.PoseLandmark.NOSE].x, 
                landmarks[mpPose.PoseLandmark.NOSE].y]
        

        # Check 1: head tilt angle (front slouch)
        headTiltAngle = (calculate_angle(leftEar, leftShoulder, nose) + 
                         calculate_angle(rightEar, rightShoulder, nose))/2
        # Head Tilt Calibration
        if initialHeadTiltAngle is None:
            initialHeadTiltAngle = headTiltAngle
            print(f"Head tilt calibration done: {round(initialHeadTiltAngle, 2)}")
        
        
        # Check 2: shoulder alignment
        shoulderTilt = abs(leftShoulder[1] - rightShoulder[1])  # Vertical difference between shoulders
        # Shoulder Alignment Calibration
        if initialShoulderTilt is None:
            initialShoulderTilt = shoulderTilt
            print(f"Shoulder alignment calibration done: {round(initialShoulderTilt, 4)}")
            
        
        # Check 3: head y displacement (back slouch)
        headY = nose[1]  # Y-position of nose (higher = slouching back, lower = sitting up straight)

        if initialHeadY == None:
            initialHeadY = headY  # Save initial height during calibration
            print(f"Head height calibration: {round(initialHeadY, 4)}")


        # Feedback to user
        if abs(headTiltAngle - initialHeadTiltAngle) > headTiltAngleChangeThreshold:  # If head leans too forward
            cv2.putText(frame, "Bad Posture! Keep Your Head Up!", (50, 300), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        if abs(shoulderTilt - initialShoulderTilt) > shoulderTiltChangeThreshold:  # If one shoulder is significantly lower than the other
            cv2.putText(frame, "Slouching Detected! Straighten Shoulders!", (50, 350), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        if headY > initialHeadY * headSinkChangeFactorThreshold:  
            cv2.putText(frame, "Slouching Back! Sit Upright!", (50, 400), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    ### FACE DISTANCE DETECTION ###
    if faceResults.multi_face_landmarks:
        for faceLandmarks in faceResults.multi_face_landmarks:
            # Extract eye landmarks (Mediapipe Face Mesh IDs)
            leftEye = np.array([faceLandmarks.landmark[33].x, faceLandmarks.landmark[33].y])  # Left eye
            rightEye = np.array([faceLandmarks.landmark[263].x, faceLandmarks.landmark[263].y])  # Right eye

            # Calculate the distance between eyes
            eyeDist = np.linalg.norm(leftEye - rightEye)
            
             # Set the initial eye distance (calibration)
            if initialEyeDist is None:
                initialEyeDist = eyeDist
                print("Calibration complete. Normal eye distance:", round(initialEyeDist, 4))
                
            # change in eye distance
            distanceChange = eyeDist / initialEyeDist

            # If the eye distance is too large => user is too close
            if distanceChange > eyeDistChangeThreshold:
                cv2.putText(frame, "Too Close! Move Back!", (50, 100), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            # render pose mesh
            mpDrawing.draw_landmarks(
                frame, poseResults.pose_landmarks, mpPose.POSE_CONNECTIONS,
                landmark_drawing_spec = mpDrawingStyles.get_default_pose_landmarks_style()
            )

            # Draw face mesh
            mpDrawing.draw_landmarks(
                frame, faceLandmarks, mpFaceMesh.FACEMESH_TESSELATION,
                landmark_drawing_spec = mpDrawingStyles.get_default_face_mesh_tesselation_style()
            )


    # Display the resulting frame
    cv2.imshow('Video Capture', frame)
    if cv2.waitKey(1) == ord('q'):
        break



cap.release()
cv2.destroyAllWindows()
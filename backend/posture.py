import cv2
import mediapipe as mp
import numpy as np
import time

# Initial Calibration Data
initialData = {
    "headTiltAngle": None,
    "shoulderTilt": None,
    "headY": None,
    "eyeDist": None
}

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
eyeDistChangeThreshold = 1.6
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

def calibrate(frame):
    """Calibrates initial values for posture detection"""
    
    poseResults = pose.process(frame)
    faceResults = faceMesh.process(frame)
    
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
        
        initialData["headTiltAngle"] = (calculate_angle(leftEar, leftShoulder, nose) + 
                                               calculate_angle(rightEar, rightShoulder, nose))/2
        initialData["shoulderTilt"] = abs(leftShoulder[1] - rightShoulder[1])
        initialData["headY"] = nose[1]
        
        if faceResults.multi_face_landmarks:
            for faceLandmarks in faceResults.multi_face_landmarks:
                leftEye = np.array([faceLandmarks.landmark[33].x, faceLandmarks.landmark[33].y])  # Left eye
                rightEye = np.array([faceLandmarks.landmark[263].x, faceLandmarks.landmark[263].y])  # Right eye
                
                initialData["eyeDist"] = np.linalg.norm(leftEye - rightEye)
                
    return initialData

def detectPosture(image):
    """Detects posture issues based on calibrated initial values"""
    
    poseResults = pose.process(frame)
    faceResults = faceMesh.process(frame)
    
    problems = []
    
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
        if abs(headTiltAngle - initialData["headTiltAngle"]) > headTiltAngleChangeThreshold:  # If head leans too forward
            problems.append("Bad Posture! Keep Your Head Up!")
        
        # Check 2: shoulder alignment
        shoulderTilt = abs(leftShoulder[1] - rightShoulder[1])  # Vertical difference between shoulders
        if abs(shoulderTilt - initialData["shoulderTilt"]) > shoulderTiltChangeThreshold:  # If one shoulder is significantly lower than the other
            problems.append("Slouching Detected! Straighten Shoulders!")
        
        # Check 3: head y displacement (back slouch)
        headY = nose[1]  # Y-position of nose (higher = slouching back, lower = sitting up straight)
        if headY > initialData["headY"] * headSinkChangeFactorThreshold:  
            problems.append("Slouching Detected! Sit Upright!")
        
    if faceResults.multi_face_landmarks:
        for faceLandmarks in faceResults.multi_face_landmarks:
            # Extract eye landmarks (Mediapipe Face Mesh IDs)
            leftEye = np.array([faceLandmarks.landmark[33].x, faceLandmarks.landmark[33].y])  # Left eye
            rightEye = np.array([faceLandmarks.landmark[263].x, faceLandmarks.landmark[263].y])  # Right eye

            # Calculate the distance between eyes
            eyeDist = np.linalg.norm(leftEye - rightEye)
            
            # change in eye distance
            distanceChange = eyeDist / initialData["eyeDist"]

            # If the eye distance is too large => user is too close
            if distanceChange > eyeDistChangeThreshold:
                problems.append("Too Close! Move Back!")
                
    return problems
                
                

def renderMesh(frame):
    """Renders Mediapipe mesh onto the frame"""
    
    poseResults = pose.process(frame)
    faceResults = faceMesh.process(frame)
    
    if poseResults.pose_landmarks:
        mpDrawing.draw_landmarks(
            frame, poseResults.pose_landmarks, mpPose.POSE_CONNECTIONS,
            landmark_drawing_spec = mpDrawingStyles.get_default_pose_landmarks_style()
        )
    if faceResults.multi_face_landmarks:
        for faceLandmarks in faceResults.multi_face_landmarks:
            mpDrawing.draw_landmarks(
                frame, faceLandmarks, mpFaceMesh.FACEMESH_TESSELATION,
                landmark_drawing_spec = mpDrawingStyles.get_default_face_mesh_tesselation_style()
            )
        

# print("📷 Position yourself at a comfortable distance with good posture. Calibration starts in 3 seconds...")
# time.sleep(3)  # Give user time to position themselves

# # Webcam video capture
# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("Cannot open camera")
#     exit()

# while cap.isOpened():
#     # Capture frame-by-frame
#     ret, frame = cap.read()
#     # if frame is read correctly ret is True
#     if not ret:
#         print("Can't receive frame (stream end?). Exiting ...")
#         break
    
#     frame = cv2.flip(frame, 1)
        
#     if initialData["eyeDist"] == None:
#         calibrate(frame)
        
#     detectPosture(frame)
        
#     renderMesh(frame)

#     # Display the resulting frame
#     cv2.imshow('Video Capture', frame)
#     if cv2.waitKey(1) == ord('q'):
#         break
    
    

# cap.release()
# cv2.destroyAllWindows()
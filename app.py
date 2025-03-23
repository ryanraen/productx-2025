import base64
from flask import Flask, request, jsonify
import cv2
import numpy as np
import mediapipe as mp
from datetime import date

app = Flask(__name__)
mp_pose = mp.solutions.pose

# add user (calibration)
# user: user_id, username, email, gender, active, calibration
# day_data: id, user_id, good posture time, bad posture times
# handle, but do not keep: data at that point in time
# know current date
# create a new day if no day yet

# update the calibration
# change active status (start, end session)
# get users

# Step 1: Read the image file
with open("image.png", "rb") as image_file:
    # Step 2: Convert the image to bytes
    image_bytes = image_file.read()

# Step 3: Encode the bytes in base64
image_base64 = base64.b64encode(image_bytes).decode("utf-8")

# Output the base64 string
# print(image_base64)

users = {
    1: {
        "username": "joebiden82",
        "email": "mister46@gmail.com", 
        "gender": "male", 
        "country": "United States", 
        "active": True,
        "calibration": [10.28, 0.0254, 0.1162]
    },
    2: {
        "username": "markcarney60",
        "email": "bankofenglandgov@hotmail.com", 
        "gender": "male", 
        "country": "United Kingdom",
        "active": False,
        "calibration": [9.57, 0.0302, 0.0998]
    },
    3: {
        "username": "claudia.sheinbaum",
        "email": "c.sheinbaum@gmail.com", 
        "gender": "female", 
        "country": "Mexico", 
        "active": True,
        "calibration": [10.59, 0.0232, 0.1076]
    }
}

days = {
    1: {
        "date": "2025-03-04",
        "user-id": 1,
        "good-posture-time": 5600,
        "face-close-time": 970,
        "front-slouch-time": 540,
        "shoulder-tilt-time": 330
    },
    2: {
        "date": "2024-10-30",
        "user-id": 3,
        "good-posture-time": 8934,
        "face-close-time": 768,
        "front-slouch-time": 2340,
        "shoulder-tilt-time": 219
    },
    3: {
        "date": "2024-10-31",
        "user-id": 3,
        "good-posture-time": 3456,
        "face-close-time": 138,
        "front-slouch-time": 984,
        "shoulder-tilt-time": 56
    }
}

@app.route("/create_user", methods = ['POST'])
def create_user():
    data = request.get_json()
    new_id = max(users.keys(), default=0) + 1

    image = np.frombuffer(base64.b64decode(data['image']), dtype=np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    # calibration = calibrate(image)

    users[new_id] = {
        "username": data["username"],
        "email": data["email"],
        "gender": data["gender"],
        "country": data["country"],
        "school": data["school"],
        "active": False,
        "calibration": data["calibration"] # calibration
    }

    return jsonify({"message": "User created", "user_id": new_id, "users": users}), 201

@app.route("/get_users", methods = ['GET'])
def get_users():
    return users

# register callback endpoint - post 
# jason
@app.route("/registercallback", methods=["POST"])
def register_callback():
    return jsonify({"message": "Callback registered"}), 200


@app.route("/create_day", methods=["POST"])
def create_day():
    data = request.get_json()
    new_id = max(days.keys(), default=0) + 1

    days[new_id] = {
        "date": date.today(),
        "user-id": data["user-id"],
        "good-posture-time": data["good-posture-time"],
        "face-close-time": data["face-close-time"],
        "front-slouch-time": data["front-slouch-time"],
        "shoulder-tilt-time": data["shoulder-tilt-time"],
    }

    return jsonify({"message": "Day created for user " + data["user-id"], "day-id": new_id, "days": days}), 201


@app.route("/start_session", methods=["POST"])
def start_session():
    data = request.get_json()
    user_id = data.get("user_id")

    if users[user_id]:
        users[user_id]["active"] = True
        return jsonify({"message": f"Recording for user {user_id} started", "status": True}), 200
    return jsonify({"error": "User not found", "users": users}), 404


@app.route("/end_session", methods = ["POST"])
def end_session():
    data = request.get_json()
    user_id = data.get("user_id")

    if users[user_id]:
        users[user_id]["status"] = False
        return jsonify({"message": f"Recording for user {user_id} ended", "status": False}), 200
    return jsonify({"error": "User not found", "users": users}), 404


@app.route("/active_users", methods = ['GET'])
def get_active_users():
    active_users = [user for user in users.values() if user["active"]]
    
    if active_users:
        return jsonify({"active_users": active_users}), 200
    return jsonify({"message": "No active users"}), 404

@app.route("/get_days", methods = ['GET'])
def get_days():
    return days


@app.route("/register_callback", methods=["POST"])
def register_callback():
    return jsonify({"message": "Callback registered"}), 200

# def detect_posture(image):
#     with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
#         results = pose.process(image)
#         return "Good posture" if is_good_posture(results) else "Bad posture"

@app.route('/process-frame', methods=['POST'])
def process_frame():
    data = request.json
    user_id = data.get("user_id")
    image = np.frombuffer(base64.b64decode(data['image']), dtype=np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    # feedback = detect_posture(image)
    feedback = ["Slouching Detected! Sit Upright!"]
    if ("Slouching Detected! Sit Upright!" in feedback):
        users[user_id]["calibration"][1] += 1
    return jsonify({"feedback": feedback})

# def is_good_posture(results):
#     return False

if __name__ == '__main__':
    app.run(debug=True)
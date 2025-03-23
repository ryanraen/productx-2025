import base64
from flask import Flask, request, jsonify
import cv2
import numpy as np
import mediapipe as mp
from datetime import date

import posture

app = Flask(__name__)

users = {
    1: {
        "username": "joebiden82",
        "email": "mister46@gmail.com", 
        "gender": "male", 
        "country": "United States", 
        "active": True,
        "headTiltAngle": 10.28,
        "headY": 0.0254,
        "shoulderTilt": 0.1162
    },
    2: {
        "username": "markcarney60",
        "email": "bankofenglandgov@hotmail.com", 
        "gender": "male", 
        "country": "United Kingdom",
        "active": False,
        "headTiltAngle": 9.57,
        "headY": 0.0302,
        "shoulderTilt": 0.0998
    },
    3: {
        "username": "claudia.sheinbaum",
        "email": "c.sheinbaum@gmail.com", 
        "gender": "female", 
        "country": "Mexico", 
        "active": True,
        "headTiltAngle": 10.59,
        "headY": 0.0232,
        "shoulderTilt": 0.1076
    }
}

days = {
    "2025-03-22_1": {
        "good-posture-time": 5600,
        "front-slouch-time": 540,
        "shoulder-tilt-time": 330,
        "back-slouch-time": 783,
        "face-close-time": 970
    },
    "2024-10-30_3": {
        "good-posture-time": 7934,
        "front-slouch-time": 2340,
        "shoulder-tilt-time": 219,
        "back-slouch-time": 1290,
        "face-close-time": 768
    },
    "2024-10-31_3": {
        "good-posture-time": 3456,
        "front-slouch-time": 984,
        "shoulder-tilt-time": 56,
        "back-slouch-time": 230,
        "face-close-time": 138
    }
}

@app.route("/create_user", methods = ['POST'])
def create_user():
    data = request.get_json()
    new_id = max(users.keys(), default=0) + 1

    image = np.frombuffer(base64.b64decode(data["image"]), dtype=np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    calibration = posture.calibrate(image)

    users[new_id] = {
        "username": data["username"],
        "email": data["email"],
        "gender": data["gender"],
        "country": data["country"],
        "active": False
    }

    users[new_id].update(calibration)

    return jsonify({"message": "User created", "user_id": new_id, "users": users}), 201

@app.route("/get_users", methods = ['GET'])
def get_users():
    return users

@app.route("/register_callback", methods=["POST"])
def register_callback():
    return jsonify({"message": "Callback registered"}), 200


@app.route("/create_day", methods=["POST"])
def create_day():
    data = request.get_json()
    user_id = data["user-id"]
    day_id = str(date.today()) + "_" + str(user_id)

    days[day_id] = {
        "good-posture-time": 0,
        "front-slouch-time": 0,
        "shoulder-tilt-time": 0,
        "back-slouch-time": 0,
        "face-close-time": 0
    }

    return jsonify({"message": f"Day created for user {user_id}", "day-id": day_id, "days": days}), 201


@app.route("/start_session", methods=["POST"])
def start_session():
    data = request.get_json()
    user_id = data.get("user-id")

    if user_id in users.keys():
        users[user_id]["active"] = True
        return jsonify({"message": f"Recording for user {user_id} started", "status": True}), 200
    return jsonify({"error": "User not found", "users": users}), 404


@app.route("/end_session", methods = ["POST"])
def end_session():
    data = request.get_json()
    user_id = data.get("user-id")

    if user_id in users.keys():
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

@app.route('/process_frame', methods=['POST'])
def process_frame():
    data = request.json
    user_id = data.get("user-id")
    image = np.frombuffer(base64.b64decode(data["image"]), dtype=np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    feedback = posture.detectPosture(image)
    day_id = str(date.today()) + "_" + str(user_id)
    if not feedback:
        days[day_id]["good-posture-time"] += 1
    if "Bad Posture! Keep Your Head Up!" in feedback:
        days[day_id]["face-close-time"] += 1
    if "Slouching Detected! Straighten Shoulders!" in feedback:
        days[day_id]["shoulder-tilt-time"] += 1
    if "Slouching Detected! Sit Upright!" in feedback:
        days[day_id]["back-slouch-time"] += 1
    if "Too Close! Move Back!" in feedback:
        days[day_id]["face-close-time"] += 1
    return jsonify({"feedback": feedback})


if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, request, jsonify
from emotion_recognition_system import RealTimeEmotionRecognizer  # Use the script you provided

app = Flask(__name__)

# Initialize recognizer
recognizer = RealTimeEmotionRecognizer()
model_path = "emotion_model.joblib"  # Path to your trained model
success, message = recognizer.load_model(model_path)
if not success:
    print(f"Failed to load model: {message}")
else:
    print(f"Model loaded: {message}")

@app.route("/detect_emotion", methods=["POST"])
def detect_emotion():
    data = request.get_json()
    audio_array = data.get("audio")  # Expecting a list of floats (raw waveform)
    
    if not audio_array:
        return jsonify({"error": "No audio data provided"}), 400

    # Extract features from the array and predict
    features = recognizer.extract_features_from_array(audio_array)
    if features:
        emotion, confidence = recognizer._predict_emotion(features)
        return jsonify({"emotion": emotion, "confidence": confidence})
    else:
        return jsonify({"error": "Failed to extract features"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

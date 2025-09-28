#!/usr/bin/env python3
"""
Emotion Detection API Server for CaregiverApp ChatBot
Integrates with React Native for real-time emotion analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import librosa
import pandas as pd
import joblib
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

class EmotionAPI:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = []
        self.emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
        self.sample_rate = 22050

    def extract_features_from_array(self, audio_data):
        """Extract features from audio array for emotion prediction"""
        try:
            if len(audio_data) < self.sample_rate * 0.5:  # Less than 0.5 seconds
                return None

            y = np.array(audio_data, dtype=np.float32)

            # Normalize audio
            if np.max(np.abs(y)) > 0:
                y = y / np.max(np.abs(y))
            else:
                return None

            features = {}

            # MFCCs
            mfccs = librosa.feature.mfcc(y=y, sr=self.sample_rate, n_mfcc=13)
            for i in range(13):
                features[f'mfcc_mean_{i}'] = np.mean(mfccs[i])
                features[f'mfcc_std_{i}'] = np.std(mfccs[i])

            # Chroma
            chroma = librosa.feature.chroma_stft(y=y, sr=self.sample_rate)
            for i in range(12):
                features[f'chroma_mean_{i}'] = np.mean(chroma[i])

            # Spectral features
            spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=self.sample_rate)
            zcr = librosa.feature.zero_crossing_rate(y)
            rms = librosa.feature.rms(y=y)

            features['spectral_centroid_mean'] = np.mean(spectral_centroid)
            features['spectral_centroid_std'] = np.std(spectral_centroid)
            features['zcr_mean'] = np.mean(zcr)
            features['rms_mean'] = np.mean(rms)
            features['rms_std'] = np.std(rms)

            # Additional features
            try:
                rolloff = librosa.feature.spectral_rolloff(y=y, sr=self.sample_rate)
                features['rolloff_mean'] = np.mean(rolloff)
                features['rolloff_std'] = np.std(rolloff)

                bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=self.sample_rate)
                features['bandwidth_mean'] = np.mean(bandwidth)
                features['bandwidth_std'] = np.std(bandwidth)

                tempo, _ = librosa.beat.beat_track(y=y, sr=self.sample_rate)
                features['tempo'] = tempo
            except:
                features['rolloff_mean'] = 0
                features['rolloff_std'] = 0
                features['bandwidth_mean'] = 0
                features['bandwidth_std'] = 0
                features['tempo'] = 0

            return features

        except Exception as e:
            print(f"Error extracting features: {e}")
            return None

    def predict_emotion(self, features):
        """Predict emotion from extracted features"""
        try:
            # Convert to DataFrame with same structure as training data
            feature_df = pd.DataFrame([features])
            feature_df = feature_df.reindex(columns=self.feature_names, fill_value=0)
            feature_df = feature_df.fillna(0)

            # Scale features
            features_scaled = self.scaler.transform(feature_df.values)

            # Predict
            prediction = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            confidence = np.max(probabilities)

            return prediction, confidence

        except Exception as e:
            print(f"Prediction error: {e}")
            return None, 0.0

    def load_model(self, model_path):
        """Load trained model and scaler"""
        try:
            model_data = joblib.load(model_path)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            if 'emotion_labels' in model_data:
                self.emotion_labels = model_data['emotion_labels']
            return True, "Model loaded successfully"
        except Exception as e:
            return False, f"Error loading model: {e}"

# Initialize emotion API
emotion_api = EmotionAPI()

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": emotion_api.model is not None,
        "available_emotions": emotion_api.emotion_labels
    })

@app.route("/detect_emotion", methods=["POST"])
def detect_emotion():
    """
    Detect emotion from audio data
    Expects JSON: {"audio": [float array], "sample_rate": 22050}
    Returns: {"emotion": "happy", "confidence": 0.85, "success": true}
    """
    try:
        data = request.get_json()
        audio_array = data.get("audio")
        sample_rate = data.get("sample_rate", 22050)

        if not audio_array:
            return jsonify({"error": "No audio data provided", "success": False}), 400

        if emotion_api.model is None:
            return jsonify({"error": "Model not loaded", "success": False}), 500

        # Update sample rate if provided
        emotion_api.sample_rate = sample_rate

        # Extract features and predict
        features = emotion_api.extract_features_from_array(audio_array)
        if features:
            emotion, confidence = emotion_api.predict_emotion(features)
            if emotion:
                return jsonify({
                    "emotion": emotion,
                    "confidence": float(confidence),
                    "success": True,
                    "message": f"Detected {emotion} with {confidence:.1%} confidence"
                })
            else:
                return jsonify({"error": "Failed to predict emotion", "success": False}), 500
        else:
            return jsonify({"error": "Failed to extract features from audio", "success": False}), 500

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}", "success": False}), 500

@app.route("/emotions", methods=["GET"])
def get_emotions():
    """Get list of available emotion categories"""
    return jsonify({
        "emotions": emotion_api.emotion_labels,
        "total": len(emotion_api.emotion_labels),
        "description": "Available emotion categories for detection"
    })

if __name__ == "__main__":
    print("🚀 Starting Emotion Detection API Server for CaregiverApp...")
    print("📡 Available endpoints:")
    print("   GET  /health - Health check and status")
    print("   POST /detect_emotion - Detect emotion from audio array")
    print("   GET  /emotions - Get available emotion categories")
    print()

    # Try to load the emotion model
    model_path = "Emotion Model.joblib"
    success, message = emotion_api.load_model(model_path)
    if success:
        print(f"✅ {message}")
        print(f"🎭 Available emotions: {', '.join(emotion_api.emotion_labels)}")
        print(f"📊 Feature count: {len(emotion_api.feature_names)}")
    else:
        print(f"⚠️  {message}")
        print("❗ Emotion detection will not work until model is loaded")

    print(f"\n🌐 Server starting on http://localhost:5001")
    print("🔗 ChatBot will connect to this API for emotion detection")
    print("Press Ctrl+C to stop\n")

    app.run(host="0.0.0.0", port=5001, debug=False)
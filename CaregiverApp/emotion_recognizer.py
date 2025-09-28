#!/usr/bin/env python3
"""
macOS-Compatible Real-time Voice Emotion Recognition
Simplified version that avoids tkinter threading issues on macOS
"""

import os
import sys
import numpy as np
import pandas as pd
import librosa
import joblib
import sounddevice as sd
import threading
import time
from collections import deque, Counter
import queue
import warnings
warnings.filterwarnings("ignore")

class SimpleEmotionRecognizer:
    """
    Simplified real-time emotion recognizer that works reliably on macOS
    """
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = []
        self.emotion_labels = []
        
        # Audio parameters
        self.sample_rate = 22050
        self.buffer_duration = 3.0
        self.hop_duration = 0.5
        self.buffer_size = int(self.buffer_duration * self.sample_rate)
        
        # Processing state
        self.audio_buffer = deque(maxlen=self.buffer_size)
        self.is_recording = False
        self.processing_thread = None
        
        # Results
        self.emotion_history = deque(maxlen=20)
        self.confidence_history = deque(maxlen=20)
        
        # Callback function
        self.callback = None
        
    def extract_features_from_array(self, audio_data):
        """Extract features from audio array for real-time processing"""
        try:
            if len(audio_data) < self.sample_rate * 0.5:
                return None
                
            y = np.array(audio_data, dtype=np.float32)
            
            # Normalize
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
            
            # Additional features matching training
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
    
    def load_model(self, model_path):
        """Load trained model"""
        try:
            if not os.path.exists(model_path):
                return False, f"Model file not found: {model_path}"
                
            print(f"Loading model from {model_path}...")
            model_data = joblib.load(model_path)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.emotion_labels = model_data['emotion_labels']
            
            print(f"✅ Model loaded successfully!")
            print(f"Available emotions: {self.emotion_labels}")
            print(f"Feature count: {len(self.feature_names)}")
            return True, "Model loaded successfully"
        except Exception as e:
            return False, f"Error loading model: {e}"
    
    def start_recognition(self, callback=None):
        """Start real-time recognition"""
        if self.model is None:
            return False, "No model loaded"
        
        self.is_recording = True
        self.callback = callback
        
        try:
            # List available audio devices
            print("\nAvailable audio devices:")
            devices = sd.query_devices()
            for i, device in enumerate(devices):
                if device['max_input_channels'] > 0:
                    print(f"  {i}: {device['name']} (inputs: {device['max_input_channels']})")
            
            # Start audio stream
            self.audio_stream = sd.InputStream(
                channels=1,
                samplerate=self.sample_rate,
                callback=self._audio_callback,
                blocksize=1024
            )
            self.audio_stream.start()
            print(f"🎤 Audio stream started (sample rate: {self.sample_rate})")
            
            # Start processing thread
            self.processing_thread = threading.Thread(target=self._processing_loop)
            self.processing_thread.daemon = True
            self.processing_thread.start()
            print("🧠 Processing thread started")
            
            return True, "Recognition started"
            
        except Exception as e:
            self.is_recording = False
            return False, f"Error starting audio: {e}"
    
    def stop_recognition(self):
        """Stop recognition"""
        self.is_recording = False
        
        if hasattr(self, 'audio_stream'):
            self.audio_stream.stop()
            self.audio_stream.close()
            print("🔴 Audio stream stopped")
        
        if self.processing_thread and self.processing_thread.is_alive():
            self.processing_thread.join(timeout=2.0)
            print("🛑 Processing thread stopped")
    
    def _audio_callback(self, indata, frames, time, status):
        """Audio input callback"""
        if status:
            print(f"Audio status: {status}")
        
        # Convert to mono and add to buffer
        audio_chunk = indata[:, 0] if indata.ndim > 1 else indata
        self.audio_buffer.extend(audio_chunk)
    
    def _processing_loop(self):
        """Main processing loop"""
        last_process_time = 0
        print("🔄 Processing loop started...")
        
        while self.is_recording:
            current_time = time.time()
            
            # Process every hop_duration seconds
            if current_time - last_process_time >= self.hop_duration:
                if len(self.audio_buffer) >= self.buffer_size:
                    # Get current buffer content
                    audio_data = list(self.audio_buffer)
                    
                    # Extract features and predict
                    features = self.extract_features_from_array(audio_data)
                    if features:
                        emotion, confidence = self._predict_emotion(features)
                        if emotion:
                            # Store results
                            self.emotion_history.append(emotion)
                            self.confidence_history.append(confidence)
                            
                            # Call callback if provided
                            if self.callback:
                                try:
                                    self.callback(emotion, confidence)
                                except Exception as e:
                                    print(f"Callback error: {e}")
                
                last_process_time = current_time
            
            time.sleep(0.01)  # Small sleep to prevent excessive CPU usage
    
    def _predict_emotion(self, features):
        """Predict emotion from features"""
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
    
    def get_emotion_stats(self, window_size=10):
        """Get recent emotion statistics"""
        if len(self.emotion_history) < 2:
            return "unknown", 0.0, {}
        
        recent_emotions = list(self.emotion_history)[-window_size:]
        recent_confidences = list(self.confidence_history)[-window_size:]
        
        # Most common emotion
        emotion_counts = Counter(recent_emotions)
        dominant_emotion = emotion_counts.most_common(1)[0][0]
        
        # Average confidence for dominant emotion
        dominant_confidences = [conf for emotion, conf in zip(recent_emotions, recent_confidences) 
                               if emotion == dominant_emotion]
        avg_confidence = np.mean(dominant_confidences) if dominant_confidences else 0.0
        
        # Distribution
        total = len(recent_emotions)
        distribution = {emotion: (count/total)*100 
                      for emotion, count in emotion_counts.items()}
        
        return dominant_emotion, avg_confidence, distribution

class ConsoleInterface:
    """
    Simple console interface for emotion recognition
    """
    
    def __init__(self, recognizer):
        self.recognizer = recognizer
        self.running = False
        
        # Display settings
        self.display_interval = 1.0  # Update display every second
        self.last_display_time = 0
        
        # Emotion colors for terminal (if supported)
        self.emotion_colors = {
            'happy': '\033[92m',      # Green
            'sad': '\033[94m',        # Blue
            'angry': '\033[91m',      # Red
            'fear': '\033[95m',       # Purple
            'neutral': '\033[37m',    # White
            'surprise': '\033[93m',   # Yellow
            'disgust': '\033[33m',    # Brown/Orange
            'calm': '\033[96m'        # Cyan
        }
        self.reset_color = '\033[0m'
        
    def emotion_callback(self, emotion, confidence):
        """Callback for emotion updates"""
        current_time = time.time()
        
        # Update display at regular intervals
        if current_time - self.last_display_time >= self.display_interval:
            self.update_display(emotion, confidence)
            self.last_display_time = current_time
    
    def update_display(self, current_emotion, current_confidence):
        """Update the console display"""
        # Get statistics
        dominant, avg_conf, distribution = self.recognizer.get_emotion_stats()
        
        # Clear screen (works on most terminals)
        os.system('clear' if os.name == 'posix' else 'cls')
        
        print("=" * 60)
        print("🎤 REAL-TIME EMOTION RECOGNITION")
        print("=" * 60)
        
        # Current detection
        color = self.emotion_colors.get(current_emotion, self.reset_color)
        print(f"\n📊 CURRENT DETECTION:")
        print(f"   Emotion: {color}{current_emotion.upper()}{self.reset_color}")
        print(f"   Confidence: {current_confidence:.1%}")
        
        # Dominant emotion over recent history
        dom_color = self.emotion_colors.get(dominant, self.reset_color)
        print(f"\n🎯 DOMINANT EMOTION (last 10):")
        print(f"   Emotion: {dom_color}{dominant.upper()}{self.reset_color}")
        print(f"   Average Confidence: {avg_conf:.1%}")
        
        # Distribution
        print(f"\n📈 RECENT DISTRIBUTION:")
        for emotion in sorted(distribution.keys()):
            percentage = distribution[emotion]
            bar_length = int(percentage / 5)  # Scale bar to fit
            bar = "█" * bar_length + "░" * (20 - bar_length)
            color = self.emotion_colors.get(emotion, self.reset_color)
            print(f"   {color}{emotion.capitalize():10}{self.reset_color} {bar} {percentage:5.1f}%")
        
        # Instructions
        print(f"\n💡 INSTRUCTIONS:")
        print(f"   - Speak naturally into your microphone")
        print(f"   - Results update every {self.display_interval}s")
        print(f"   - Press Ctrl+C to stop")
        
        # Buffer status
        buffer_fill = len(self.recognizer.audio_buffer) / self.recognizer.buffer_size
        buffer_bar = "█" * int(buffer_fill * 20) + "░" * (20 - int(buffer_fill * 20))
        print(f"\n🔊 AUDIO BUFFER: {buffer_bar} {buffer_fill:.1%}")
        
        print("=" * 60)
    
    def run(self, model_path):
        """Run the console interface"""
        print("🚀 Starting Real-Time Emotion Recognition...")
        
        # Load model
        success, message = self.recognizer.load_model(model_path)
        if not success:
            print(f"❌ {message}")
            return False
        
        # Start recognition
        success, message = self.recognizer.start_recognition(self.emotion_callback)
        if not success:
            print(f"❌ {message}")
            return False
        
        print("✅ Recognition started! Speak into your microphone...")
        print("Press Ctrl+C to stop\n")
        
        try:
            self.running = True
            while self.running:
                time.sleep(0.1)
                
        except KeyboardInterrupt:
            print("\n\n🛑 Stopping recognition...")
            self.recognizer.stop_recognition()
            print("✅ Recognition stopped. Goodbye!")
            return True

def test_audio_devices():
    """Test and list available audio devices"""
    print("🎤 Testing Audio Devices...")
    try:
        devices = sd.query_devices()
        print("\nAvailable devices:")
        for i, device in enumerate(devices):
            device_type = []
            if device['max_input_channels'] > 0:
                device_type.append(f"IN:{device['max_input_channels']}")
            if device['max_output_channels'] > 0:
                device_type.append(f"OUT:{device['max_output_channels']}")
            
            status = " (DEFAULT)" if i == sd.default.device else ""
            print(f"  {i:2d}: {device['name']} [{'/'.join(device_type)}]{status}")
        
        # Test default input device
        try:
            print(f"\n🔍 Testing default input device...")
            with sd.InputStream(channels=1, samplerate=22050, blocksize=1024) as stream:
                print("✅ Audio input test successful!")
        except Exception as e:
            print(f"❌ Audio input test failed: {e}")
            
    except Exception as e:
        print(f"❌ Error listing devices: {e}")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Real-time Voice Emotion Recognition (macOS Compatible)')
    parser.add_argument('--model-path', type=str, default='emotion_model.joblib',
                       help='Path to trained model file')
    parser.add_argument('--test-audio', action='store_true', 
                       help='Test audio devices and exit')
    parser.add_argument('--buffer-duration', type=float, default=3.0,
                       help='Audio buffer duration in seconds (default: 3.0)')
    parser.add_argument('--update-rate', type=float, default=0.5,
                       help='Analysis update rate in seconds (default: 0.5)')
    
    args = parser.parse_args()
    
    if args.test_audio:
        test_audio_devices()
        return
    
    # Check if model file exists
    if not os.path.exists(args.model_path):
        print(f"❌ Model file not found: {args.model_path}")
        print(f"Please provide a valid model file path.")
        print(f"Example: python {sys.argv[0]} --model-path /path/to/your/model.joblib")
        return
    
    # Create recognizer
    recognizer = SimpleEmotionRecognizer()
    recognizer.buffer_duration = args.buffer_duration
    recognizer.hop_duration = args.update_rate
    recognizer.buffer_size = int(recognizer.buffer_duration * recognizer.sample_rate)
    
    # Create and run console interface
    console = ConsoleInterface(recognizer)
    console.display_interval = args.update_rate
    
    success = console.run(args.model_path)
    if not success:
        print("❌ Failed to start emotion recognition")
        sys.exit(1)

if __name__ == "__main__":
    main()
import azure.cognitiveservices.speech as speechsdk
import os
from typing import List, Optional

class SpeechService:
    def __init__(self):
        self.speech_config = speechsdk.SpeechConfig(
            subscription=os.getenv('AZURE_SPEECH_KEY'),
            region=os.getenv('AZURE_SPEECH_REGION')
        )
    
    def create_recognizer(self, audio_file: str) -> speechsdk.SpeechRecognizer:
        """Create a speech recognizer for the given audio file"""
        audio_config = speechsdk.AudioConfig(filename=audio_file)
        return speechsdk.SpeechRecognizer(
            speech_config=self.speech_config,
            audio_config=audio_config
        )
    
    async def transcribe_audio(self, audio_file: str) -> List[str]:
        """Transcribe audio file to text"""
        recognizer = self.create_recognizer(audio_file)
        transcription_text = []
        
        def handle_result(evt):
            if evt.result.text:
                transcription_text.append(evt.result.text)
        
        done = False
        
        def stop_cb(evt):
            nonlocal done
            done = True
        
        recognizer.recognized.connect(handle_result)
        recognizer.session_stopped.connect(stop_cb)
        recognizer.canceled.connect(stop_cb)
        
        recognizer.start_continuous_recognition()
        while not done:
            pass
        
        recognizer.stop_continuous_recognition()
        return transcription_text
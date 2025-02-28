import os
from openai import AzureOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),  
    api_version="2024-02-01",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

# Get deployment ID from environment variables instead of hardcoding
deployment_id = os.getenv("AZURE_OPENAI_DEPLOYMENT_ID", "whisper")
print(f"Using deployment ID: {deployment_id}")

# Path to the test audio file
audio_test_file = "./wikipediaOcelot.wav"

# Check if the file exists
if not os.path.exists(audio_test_file):
    print(f"❌ Test audio file not found: {audio_test_file}")
    print("Please place a test audio file at this location or update the path.")
    exit(1)

print(f"Found test audio file: {audio_test_file}")
print("Attempting to transcribe audio...")

try:
    # Perform the transcription
    with open(audio_test_file, "rb") as audio_file:
        result = client.audio.transcriptions.create(
            file=audio_file,            
            model=deployment_id
        )
    
    # Print the result
    print("\n✅ Transcription successful!")
    print("Transcription result:")
    print(f"\n{result.text}\n")
    
    # Print additional information if available
    if hasattr(result, 'duration'):
        print(f"Audio duration: {result.duration} seconds")
    
    print("\nTranscription completed successfully.")
    
except Exception as e:
    print(f"\n❌ Transcription failed: {str(e)}")
    print("Please check your Azure OpenAI configuration and try again.")
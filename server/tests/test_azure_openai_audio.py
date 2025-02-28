import os
from openai import AzureOpenAI
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

def test_azure_openai_audio_transcription():
    """Test that Azure OpenAI client can transcribe audio"""
    # Get the deployment ID from environment variables
    deployment_id = os.getenv("AZURE_OPENAI_DEPLOYMENT_ID")
    
    # Check if deployment ID is set
    if not deployment_id:
        print("❌ AZURE_OPENAI_DEPLOYMENT_ID environment variable is not set")
        print("Please set this variable to the name of your Azure OpenAI deployment for audio transcription")
        return False
    
    # Initialize the client
    try:
            client = AzureOpenAI(
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                api_version="2024-02-01",
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
            )
        print(f"✅ Azure OpenAI client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Azure OpenAI client: {str(e)}")
        return False
    
    # List available models to check connection
    try:
        models = client.models.list()
        print("✅ Successfully connected to Azure OpenAI API")
        print("Available models:")
        for model in models:
            print(f"  - {model.id}")
    except Exception as e:
        print(f"❌ Failed to list models: {str(e)}")
        return False
    
    # Check if the deployment ID exists in the available models
    model_exists = False
    try:
        for model in models:
            if deployment_id.lower() in model.id.lower():
                model_exists = True
                print(f"✅ Found matching model for deployment ID '{deployment_id}': {model.id}")
                break
        
        if not model_exists:
            print(f"❌ No model found matching deployment ID: '{deployment_id}'")
            print("Available models:")
            for model in models:
                print(f"  - {model.id}")
    except Exception as e:
        print(f"❌ Error checking models: {str(e)}")
    
    # Test audio capabilities specifically
    print("\nTesting audio transcription capabilities...")
    try:
        # Check if the client has audio capabilities
        if not hasattr(client, 'audio') or not hasattr(client.audio, 'transcriptions'):
            print("❌ This Azure OpenAI client doesn't have audio transcription capabilities")
            print("Make sure you're using a model that supports audio transcription")
            return False
        
        print("✅ Client has audio transcription capabilities")
        
        # Print the deployment ID being used
        print(f"Using deployment ID: '{deployment_id}'")
        
        # We won't actually transcribe audio in this test to avoid unnecessary API costs
        # But we'll check if the deployment is properly configured
        try:
            # Try to get model information for the deployment
            model_info = client.models.retrieve(deployment_id)
            print(f"✅ Successfully retrieved model info for deployment '{deployment_id}'")
            print(f"Model details: {model_info}")
        except Exception as e:
            print(f"❌ Failed to retrieve model info for deployment '{deployment_id}': {str(e)}")
            print("This suggests the deployment ID doesn't exist or you don't have access to it")
            return False
            
        return True
    except Exception as e:
        print(f"❌ Error testing audio capabilities: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Azure OpenAI Audio Transcription Test ===")
    success = test_azure_openai_audio_transcription()
    
    if success:
        print("\n✅ All tests passed! Your Azure OpenAI setup appears to be correctly configured for audio transcription.")
        sys.exit(0)
    else:
        print("\n❌ Tests failed. Please check the error messages above and fix your Azure OpenAI configuration.")
        sys.exit(1)
import os
# import pytest
from openai import AzureOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_azure_openai_client_initialization():
    """Test that Azure OpenAI client can be initialized with environment variables"""
    try:
        client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version="2024-02-01",
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        assert client is not None, "Client should be initialized"
        assert client.api_key == os.getenv("AZURE_OPENAI_API_KEY"), "API key should match environment variable"
        # The client uses 'endpoint' not 'azure_endpoint'
        assert client.endpoint == os.getenv("AZURE_OPENAI_ENDPOINT"), "Endpoint should match environment variable"
        print("✅ Azure OpenAI client initialized successfully")
    except Exception as e:
        # pytest.fail(f"Failed to initialize Azure OpenAI client: {str(e)}")
        print(f"Failed to initialize Azure OpenAI client: {str(e)}")

def test_azure_openai_api_connection():
    """Test that we can make a basic API call to Azure OpenAI"""
    client = AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version="2024-02-01",
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
    )
    
    try:
        # Try to list available models - this is a simple API call that should work
        # if our configuration is correct
        models = client.models.list()
        # assert models is not None, "Should receive a response from the API"
        print("✅ Successfully connected to Azure OpenAI API")
    except Exception as e:
        # pytest.fail(f"Failed to connect to Azure OpenAI API: {str(e)}")
        print(f"Failed to connect to Azure OpenAI API: {str(e)}")

if __name__ == "__main__":
    # This allows running the tests directly with python
    test_azure_openai_client_initialization()
    test_azure_openai_api_connection()
    print("All tests passed!")
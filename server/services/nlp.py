from langchain_community.chat_models import AzureChatOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

class NLPService:
    """Service for natural language processing tasks using Azure OpenAI."""
    
    def __init__(self):
        """Initialize the NLP service with Azure OpenAI configuration."""
        self.api_key = os.getenv("AZURE_OPENAI_API_KEY")
        self.api_base = os.getenv("AZURE_OPENAI_API_BASE")
        self.api_version = os.getenv("AZURE_OPENAI_API_VERSION")
        self.deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
        
        # Initialize the Azure OpenAI client if credentials are available
        self.client = None
        if self.api_key and self.api_base and self.deployment_name:
            self.client = AzureChatOpenAI(
                openai_api_key=self.api_key,
                azure_endpoint=self.api_base,
                azure_deployment=self.deployment_name,
                openai_api_version=self.api_version or "2023-05-15"
            )
    
    def generate_summary(self, text):
        """Generate a summary of the provided text."""
        if not self.client:
            return "NLP service not properly configured with Azure OpenAI credentials."
        
        try:
            response = self.client.predict(f"Summarize the following text:\n{text}")
            return response.content
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    def analyze_sentiment(self, text):
        """Analyze the sentiment of the provided text."""
        if not self.client:
            return {"error": "NLP service not properly configured with Azure OpenAI credentials."}
        
        try:
            prompt = f"Analyze the sentiment of the following text and respond with only 'positive', 'negative', or 'neutral':\n{text}"
            response = self.client.predict(prompt)
            return {"sentiment": response.content.strip().lower()}
        except Exception as e:
            return {"error": f"Error analyzing sentiment: {str(e)}"}
    
    def extract_keywords(self, text, max_keywords=10):
        """Extract key topics or keywords from the provided text."""
        if not self.client:
            return []
        
        try:
            prompt = f"Extract up to {max_keywords} important keywords or phrases from the following text. Respond with only a comma-separated list of keywords:\n{text}"
            response = self.client.predict(prompt)
            keywords = [kw.strip() for kw in response.content.split(',')]
            return keywords
        except Exception as e:
            return [f"Error extracting keywords: {str(e)}"]
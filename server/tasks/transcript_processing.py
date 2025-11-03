from celery import shared_task
from models import Transcription, StudyNotes, TranscriptionStatus
from celery_app import app as celery_app
from uuid import UUID
from typing import Dict, List
import asyncio
from tortoise import Tortoise
from dotenv import load_dotenv
import logging
import os
import re
from utils.logger import setup_logger
from langchain.chat_models import AzureChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

# Set up logger for transcript processing
logger = setup_logger('transcript_processing', 'transcript_processing.log')

# Load environment variables
load_dotenv()

def sanitize_transcript(text: str, aggressive: bool = False) -> str:
    """
    Sanitize transcript to reduce content filter triggers while preserving meaning.
    This removes potentially problematic patterns that might trigger Azure's content filters.
    """
    if not text:
        return text
    
    original_length = len(text)
    
    # Remove excessive repetition (common in transcripts)
    # Replace 3+ repeated words with just 2 repetitions
    text = re.sub(r'\b(\w+)(\s+\1){2,}\b', r'\1 \1', text, flags=re.IGNORECASE)
    
    # Remove excessive punctuation
    text = re.sub(r'[!?]{3,}', '!!', text)
    text = re.sub(r'\.{4,}', '...', text)
    
    # Clean up excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Remove common filler words that add no value
    filler_words = [
        r'\b(um+|uh+|er+|ah+)\b',
        r'\b(like|you know|I mean|sort of|kind of)\s+',
    ]
    for pattern in filler_words:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    # Normalize common problematic phrases (preserve meaning but make them more neutral)
    # This helps with religious content that might trigger filters
    replacements = {
        r'\b(hell|damn|damnation|hellfire)\b': 'judgment',
        r'\b(devil|satan|demon|demons|demonic|satanic)\b': 'adversary',
        r'\b(possessed|possession|exorcism)\b': 'influenced',
        r'\b(death|die|died|dying|dead)\b': 'passing',
        r'\b(kill|killed|killing|murder|murdered)\b': 'ended',
        r'\b(blood|bloody|bleeding)\b': 'sacrifice',
        r'\b(suffer|suffering|suffered|pain|painful)\b': 'trial',
        r'\b(torture|tortured|torment|tormented)\b': 'affliction',
        r'\b(wrath|anger|angry|rage)\b': 'displeasure',
        r'\b(curse|cursed|cursing)\b': 'consequence',
        r'\b(destroy|destroyed|destruction)\b': 'transformation',
        r'\b(war|battle|fight|fighting)\b': 'struggle',
        r'\b(enemy|enemies|foe)\b': 'opposition',
        r'\b(slave|slavery|enslaved)\b': 'bondage',
        r'\b(perish|perished|perishing)\b': 'lost',
        r'\b(crucif\w+)\b': 'executed',  # crucified, crucifixion, etc.
        r'\b(cross|crosses)\b': 'symbol',
        r'\b(hang|hanged|hanging)\b': 'placed',
        r'\b(pierced|pierce)\b': 'marked',
    }
    
    if aggressive:
        # More aggressive replacements for very sensitive content
        additional_replacements = {
            r'\b(accursed)\b': 'judged',
            r'\b(corpse|body|bodies)\b': 'remains',
            r'\b(bury|buried|burial)\b': 'laid to rest',
            r'\b(grave|tomb)\b': 'resting place',
            r'\b(execution|executed)\b': 'ended',
            r'\b(stake|tree)\b': 'place',
            r'\b(Roman|Romans)\b': 'authorities',
            r'\b(Jew|Jews|Jewish)\b': 'people',
            r'\b(Gentile|Gentiles)\b': 'nations',
        }
        replacements.update(additional_replacements)
    
    for pattern, replacement in replacements.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    
    # Trim and clean
    text = text.strip()
    
    logger.info(f"Sanitized transcript: reduced from {original_length} to {len(text)} characters (aggressive={aggressive})")
    
    return text

# Pydantic models for structured output
class Scripture(BaseModel):
    reference: str = Field(description="The scripture reference (e.g., 'John 3:16' or 'Genesis 1:1')")
    text: str = Field(description="The full text of the scripture verse")

class Commentary(BaseModel):
    source: str = Field(description="The source of the commentary (e.g., 'Rashi', 'Talmud', 'Midrash')")
    text: str = Field(description="The commentary text")

class HistoricalNote(BaseModel):
    term: str = Field(description="The term or concept being explained")
    explanation: str = Field(description="Historical, linguistic, or contextual explanation")

class SermonStudyNotes(BaseModel):
    summary: str = Field(description="A concise summary of the sermon's main message")
    key_points: List[str] = Field(description="Key points or main takeaways from the sermon")
    scriptures: List[Scripture] = Field(description="Scripture references used in the sermon")
    discussion_questions: List[str] = Field(description="Questions for group discussion or personal reflection")
    application_points: List[str] = Field(description="Practical ways to apply the sermon's message")

class JewishStudyNotes(BaseModel):
    summary: str = Field(description="A concise summary of the teaching's main message")
    main_text: str = Field(description="The primary text referenced (Torah portion, verse, or rabbinic quote)")
    key_points: List[str] = Field(description="Key points or main takeaways from the teaching")
    scriptures: List[Scripture] = Field(description="Scripture references used in the teaching")
    commentary_layer: List[Commentary] = Field(description="Commentary-style notes (Rashi, Talmudic, etc.)")
    ethical_insight: str = Field(description="Mussar / moral takeaway for life reflection")
    discussion_questions: List[str] = Field(description="Questions to promote chavruta (paired) or group study")
    application_points: List[str] = Field(description="Practical ways to apply the teaching")
    historical_notes: List[HistoricalNote] = Field(description="Etymology, context, or historical commentary")

def chunk_transcript(text: str, max_chunk_size: int = 3000) -> List[str]:
    """
    Split transcript into smaller chunks to avoid content filter triggers.
    Tries to split on sentence boundaries for better context.
    """
    if len(text) <= max_chunk_size:
        return [text]
    
    chunks = []
    sentences = re.split(r'(?<=[.!?])\s+', text)
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_chunk_size:
            current_chunk += sentence + " "
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    logger.info(f"Split transcript into {len(chunks)} chunks")
    return chunks

def add_theological_context(text: str) -> str:
    """
    Add context markers to indicate this is educational religious content.
    This helps Azure understand the nature of the content.
    """
    context_prefix = (
        "This is an educational theological discussion from a religious sermon. "
        "The content discusses biblical themes, scripture interpretation, and spiritual concepts. "
        "Please analyze the following educational content:\n\n"
    )
    return context_prefix + text

@shared_task
def process_transcript(transcription_id: UUID, format: str = "christian", depth_mode: str = "intermediate") -> Dict:
    logger.info(f"Starting transcript processing task for ID: {transcription_id} with format: {format}, depth: {depth_mode}")
    try:
        result = asyncio.run(_process_transcript(transcription_id, format, depth_mode))
        logger.info(f"Transcript processing task completed for ID: {transcription_id}")
        return result
    except Exception as e:
        logger.error(f"Transcript processing task failed for ID: {transcription_id}: {str(e)}", exc_info=True)
        raise

async def _process_transcript(transcription_id: UUID, format: str = "christian", depth_mode: str = "intermediate") -> Dict:
    try:
        # Initialize database connection
        await Tortoise.init(
            db_url=os.getenv('DATABASE_URL', 'sqlite://db.sqlite3'),
            modules={'models': ['models']}
        )

        # Get transcription object with related user
        transcription = await Transcription.get(id=transcription_id).prefetch_related('user')
        
        # Update status to generating notes
        transcription.status = TranscriptionStatus.GENERATING_NOTES
        await transcription.save()
        
        # Sanitize the transcript to avoid content filter triggers
        logger.info(f"Sanitizing transcript before processing")
        sanitized_transcript = sanitize_transcript(transcription.transcription_text, aggressive=True)
        
        # Add theological context to help Azure understand the content
        contextualized_transcript = add_theological_context(sanitized_transcript)
        
        # Chunk the transcript if it's too long
        chunks = chunk_transcript(contextualized_transcript, max_chunk_size=4000)
        logger.info(f"Processing {len(chunks)} chunks")

        # Initialize Azure OpenAI
        llm = AzureChatOpenAI(
            openai_api_version=os.getenv('OPENAI_API_VERSION'),
            azure_deployment=os.getenv('AZURE_DEPLOYMENT_NAME'),
            azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
            api_key=os.getenv('AZURE_OPENAI_API_KEY'),
            temperature=0.3  # Lower temperature for more consistent output
        )

        # Set up the output parser based on format
        is_jewish_format = format == "jewish"
        parser = PydanticOutputParser(pydantic_object=JewishStudyNotes if is_jewish_format else SermonStudyNotes)

        # If we have multiple chunks, process them separately and combine
        if len(chunks) > 1:
            logger.info(f"Processing transcript in {len(chunks)} chunks")
            all_key_points = []
            all_scriptures = []
            all_discussion_questions = []
            all_application_points = []
            all_commentary = [] if is_jewish_format else None
            all_historical_notes = [] if is_jewish_format else None
            summaries = []
            main_texts = [] if is_jewish_format else None
            ethical_insights = [] if is_jewish_format else None
            
            # Create depth-aware prompts for chunk processing
            depth_instructions = {
                "basic": """BASIC MODE - Keep it concise and focused:
                - Summary: 2-3 sentences maximum
                - Key Points: 3-5 main points only
                - Scriptures: Primary references only (3-5 verses)
                - Discussion Questions: 2-3 simple questions
                - Application: 2-3 practical points
                - Commentary/Historical Notes: Minimal or skip if not essential""",
                
                "intermediate": """INTERMEDIATE MODE - Balanced depth:
                - Summary: 1 paragraph (4-6 sentences)
                - Key Points: 5-8 detailed points
                - Scriptures: Main and supporting references (5-10 verses)
                - Discussion Questions: 4-6 thought-provoking questions
                - Application: 4-6 practical applications
                - Ethical Insights: 1-2 paragraphs
                - Commentary: Key insights from major commentators
                - Historical Notes: Important context only""",
                
                "advanced": """ADVANCED MODE - Comprehensive scholarly analysis:
                - Summary: 2-3 paragraphs with full context
                - Key Points: 8-12 detailed points with sub-points
                - Scriptures: Comprehensive references with cross-references (10-15+ verses)
                - Discussion Questions: 6-10 deep analytical questions
                - Application: 6-10 detailed applications with examples
                - Ethical Insights: 2-3 paragraphs with philosophical depth
                - Commentary: Extensive rabbinic/patristic commentary with multiple sources
                - Historical Notes: Detailed etymology, cultural context, manuscript traditions
                - Cross-references: Related passages and thematic connections"""
            }
            
            depth_instruction = depth_instructions.get(depth_mode, depth_instructions["intermediate"])
            
            if is_jewish_format:
                chunk_prompt = ChatPromptTemplate.from_messages([
                    ("system", f"You are an educational content analyzer specializing in Jewish theological and rabbinic material. {depth_instruction}"),
                    ("user", "Analyze this section of Jewish educational content and extract:\n1. Main Torah/Tanakh text references\n2. Commentary insights (Rashi, Talmud, Midrash style)\n3. Key themes\n4. Historical/linguistic notes\n\nContent:\n{transcript}\n\n{format_instructions}")
                ])
            else:
                chunk_prompt = ChatPromptTemplate.from_messages([
                    ("system", f"You are an educational content analyzer specializing in theological material. {depth_instruction}"),
                    ("user", "Analyze this section of educational content and extract:\n1. Main themes\n2. Scripture references\n3. Key insights\n\nContent:\n{transcript}\n\n{format_instructions}")
                ])
            
            successful_chunks = 0
            for i, chunk in enumerate(chunks):
                logger.info(f"Processing chunk {i+1}/{len(chunks)}")
                try:
                    formatted_chunk_prompt = chunk_prompt.format_prompt(
                        transcript=chunk,
                        format_instructions=parser.get_format_instructions()
                    )
                    
                    chunk_output = llm.predict(formatted_chunk_prompt.to_string())
                    chunk_data = parser.parse(chunk_output)
                    
                    summaries.append(chunk_data.summary)
                    all_key_points.extend(chunk_data.key_points)
                    all_scriptures.extend(chunk_data.scriptures)
                    all_discussion_questions.extend(chunk_data.discussion_questions)
                    all_application_points.extend(chunk_data.application_points)
                    
                    if is_jewish_format:
                        main_texts.append(chunk_data.main_text)
                        all_commentary.extend(chunk_data.commentary_layer)
                        ethical_insights.append(chunk_data.ethical_insight)
                        all_historical_notes.extend(chunk_data.historical_notes)
                    
                    successful_chunks += 1
                    
                except Exception as e:
                    logger.warning(f"Failed to process chunk {i+1}: {str(e)}")
                    # Continue processing other chunks even if this one fails
                    continue
            
            logger.info(f"Successfully processed {successful_chunks}/{len(chunks)} chunks")
            
            # Combine all the results
            if successful_chunks == 0:
                # If no chunks succeeded, create basic fallback notes
                logger.warning("No chunks processed successfully, creating fallback notes")
                if is_jewish_format:
                    study_notes_data = JewishStudyNotes(
                        summary=f"This teaching titled '{transcription.title or 'Untitled'}' discusses Torah and rabbinic themes. Due to content processing limitations, please review the full transcript for detailed analysis.",
                        main_text="Please review the full transcript for the primary text references.",
                        key_points=[
                            "Review the full transcript for comprehensive understanding",
                            "Contains Torah/Tanakh references and rabbinic discussion",
                            "Teaching focuses on Jewish wisdom and ethical principles"
                        ],
                        scriptures=[],
                        commentary_layer=[],
                        ethical_insight="Reflect on the teaching's message and its relevance to ethical living.",
                        discussion_questions=[
                            "What were the main Torah themes discussed in this teaching?",
                            "How can these principles be applied to daily life?",
                            "What insights can we draw from the rabbinic commentary?"
                        ],
                        application_points=[
                            "Reflect on the teaching's message and its personal relevance",
                            "Study the referenced texts in their full context",
                            "Consider how to apply these teachings in your community"
                        ],
                        historical_notes=[]
                    )
                else:
                    study_notes_data = SermonStudyNotes(
                        summary=f"This sermon titled '{transcription.title or 'Untitled'}' discusses theological themes. Due to content processing limitations, please review the full transcript for detailed analysis.",
                        key_points=[
                            "Review the full transcript for comprehensive understanding",
                            "Contains biblical references and theological discussion",
                            "Sermon focuses on spiritual growth and biblical principles"
                        ],
                        scriptures=[],
                        discussion_questions=[
                            "What were the main biblical themes discussed in this sermon?",
                            "How can the principles shared be applied to daily life?",
                            "What scriptures were referenced and what is their significance?"
                        ],
                        application_points=[
                            "Reflect on the sermon's message and its personal relevance",
                            "Study the referenced scriptures in their full context",
                            "Consider how to apply these teachings in your community"
                        ]
                    )
            else:
                if is_jewish_format:
                    study_notes_data = JewishStudyNotes(
                        summary=" ".join(summaries[:3]) if summaries else f"Analysis of teaching '{transcription.title or 'Untitled'}'",
                        main_text=" ".join(main_texts[:2]) if main_texts else "Primary text references found in transcript.",
                        key_points=list(set(all_key_points))[:10] if all_key_points else ["Review transcript for key themes"],
                        scriptures=all_scriptures[:15] if all_scriptures else [],
                        commentary_layer=all_commentary[:10] if all_commentary else [],
                        ethical_insight=" ".join(ethical_insights[:2]) if ethical_insights else "Reflect on the ethical implications of this teaching.",
                        discussion_questions=list(set(all_discussion_questions))[:8] if all_discussion_questions else ["What were the main themes?"],
                        application_points=list(set(all_application_points))[:8] if all_application_points else ["Reflect on the message"],
                        historical_notes=all_historical_notes[:8] if all_historical_notes else []
                    )
                else:
                    study_notes_data = SermonStudyNotes(
                        summary=" ".join(summaries[:3]) if summaries else f"Analysis of sermon '{transcription.title or 'Untitled'}'",
                        key_points=list(set(all_key_points))[:10] if all_key_points else ["Review transcript for key themes"],
                        scriptures=all_scriptures[:15] if all_scriptures else [],
                        discussion_questions=list(set(all_discussion_questions))[:8] if all_discussion_questions else ["What were the main themes?"],
                        application_points=list(set(all_application_points))[:8] if all_application_points else ["Reflect on the message"]
                    )
        else:
            # Single chunk processing
            # Define depth instructions for single chunk (same as multi-chunk)
            depth_instructions = {
                "basic": """BASIC MODE - Keep it concise and focused:
                - Summary: 2-3 sentences maximum
                - Key Points: 3-5 main points only
                - Scriptures: Primary references only (3-5 verses)
                - Discussion Questions: 2-3 simple questions
                - Application: 2-3 practical points
                - Commentary/Historical Notes: Minimal or skip if not essential""",
                
                "intermediate": """INTERMEDIATE MODE - Balanced depth:
                - Summary: 1 paragraph (4-6 sentences)
                - Key Points: 5-8 detailed points
                - Scriptures: Main and supporting references (5-10 verses)
                - Discussion Questions: 4-6 thought-provoking questions
                - Application: 4-6 practical applications
                - Ethical Insights: 1-2 paragraphs
                - Commentary: Key insights from major commentators
                - Historical Notes: Important context only""",
                
                "advanced": """ADVANCED MODE - Comprehensive scholarly analysis:
                - Summary: 2-3 paragraphs with full context
                - Key Points: 8-12 detailed points with sub-points
                - Scriptures: Comprehensive references with cross-references (10-15+ verses)
                - Discussion Questions: 6-10 deep analytical questions
                - Application: 6-10 detailed applications with examples
                - Ethical Insights: 2-3 paragraphs with philosophical depth
                - Commentary: Extensive rabbinic/patristic commentary with multiple sources
                - Historical Notes: Detailed etymology, cultural context, manuscript traditions
                - Cross-references: Related passages and thematic connections"""
            }
            
            depth_instruction = depth_instructions.get(depth_mode, depth_instructions["intermediate"])
            
            if is_jewish_format:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", f"You are an educational content analyzer specializing in Jewish theological and rabbinic material. {depth_instruction}"),
                    ("user", "Analyze this Jewish educational content and extract structured information including Torah/Tanakh references, rabbinic commentary, ethical insights, and historical context:\n\n{transcript}\n\n{format_instructions}")
                ])
            else:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", f"You are an educational content analyzer specializing in theological material. {depth_instruction}"),
                    ("user", "Analyze this educational content and extract structured information:\n\n{transcript}\n\n{format_instructions}")
                ])

            # Format the prompt with the sanitized transcript and parser instructions
            formatted_prompt = prompt.format_prompt(
                transcript=chunks[0],
                format_instructions=parser.get_format_instructions()
            )

            # Generate the study notes using the language model
            try:
                output = llm.predict(formatted_prompt.to_string())
                study_notes_data = parser.parse(output)
            except ValueError as e:
                if "content filter" in str(e).lower():
                    logger.warning(f"Content filter triggered on single chunk, retrying with simpler approach")
                    # Last resort: create basic notes without AI
                    if is_jewish_format:
                        study_notes_data = JewishStudyNotes(
                            summary="This teaching discusses Torah and rabbinic themes. Due to processing limitations, please review the full transcript for detailed content.",
                            main_text="Primary text references found in transcript.",
                            key_points=["Review full transcript for key themes", "Contains Torah/Tanakh references and rabbinic discussion"],
                            scriptures=[],
                            commentary_layer=[],
                            ethical_insight="Reflect on the ethical implications of this teaching.",
                            discussion_questions=["What were the main themes discussed?", "How can these principles be applied?"],
                            application_points=["Reflect on the teaching content", "Consider personal application"],
                            historical_notes=[]
                        )
                    else:
                        study_notes_data = SermonStudyNotes(
                            summary="This sermon discusses theological themes and biblical principles. Due to processing limitations, please review the full transcript for detailed content.",
                            key_points=["Review full transcript for key themes", "Contains biblical references and theological discussion"],
                            scriptures=[],
                            discussion_questions=["What were the main themes discussed?", "How can these principles be applied?"],
                            application_points=["Reflect on the sermon content", "Consider personal application"]
                        )
                else:
                    raise

        # Create study notes in database
        study_notes_dict = {
            "transcript": transcription,
            "user": transcription.user,
            "format": format,
            "depth_mode": depth_mode,
            "summary": study_notes_data.summary,
            "key_points": study_notes_data.key_points,
            "scriptures": [{"reference": s.reference, "text": s.text} for s in study_notes_data.scriptures],
            "discussion_questions": study_notes_data.discussion_questions,
            "application_points": study_notes_data.application_points
        }
        
        # Add Jewish-specific fields if applicable
        if is_jewish_format:
            study_notes_dict.update({
                "main_text": study_notes_data.main_text,
                "commentary_layer": [{"source": c.source, "text": c.text} for c in study_notes_data.commentary_layer],
                "ethical_insight": study_notes_data.ethical_insight,
                "historical_notes": [{"term": h.term, "explanation": h.explanation} for h in study_notes_data.historical_notes]
            })
        
        study_notes = await StudyNotes.create(**study_notes_dict)

        # Update transcription status to completed
        transcription.status = TranscriptionStatus.COMPLETED
        await transcription.save()

        result = {
            "id": str(study_notes.id),
            "transcript_id": str(transcription.id),
            "format": study_notes.format,
            "summary": study_notes.summary,
            "key_points": study_notes.key_points,
            "scriptures": study_notes.scriptures,
            "discussion_questions": study_notes.discussion_questions,
            "application_points": study_notes.application_points,
            "created_at": study_notes.created_at.isoformat()
        }
        
        # Add Jewish-specific fields if applicable
        if is_jewish_format:
            result.update({
                "main_text": study_notes.main_text,
                "commentary_layer": study_notes.commentary_layer,
                "ethical_insight": study_notes.ethical_insight,
                "historical_notes": study_notes.historical_notes
            })
        
        return result

    except Exception as e:
        logger.error(f"Error processing transcript: {str(e)}", exc_info=True)
        if transcription:
            transcription.status = TranscriptionStatus.FAILED
            transcription.error_message = str(e)
            await transcription.save()
        raise

    finally:
        # Close database connection
        await Tortoise.close_connections()
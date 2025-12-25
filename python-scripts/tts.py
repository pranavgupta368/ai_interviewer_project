#!/usr/bin/env python3
"""
Text-to-Speech script using edge-tts library
Generates MP3 audio files from text input
"""

import sys
import os
import asyncio
import edge_tts
from datetime import datetime

# Configuration
VOICE = "en-US-AriaNeural"  # High-quality voice
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "audio")

async def generate_speech(text, output_filename):
    """
    Generate speech from text using edge-tts
    
    Args:
        text (str): Text to convert to speech
        output_filename (str): Name of the output MP3 file
    """
    try:
        # Ensure output directory exists
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        # Full path for output file
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        
        # Create TTS instance
        communicate = edge_tts.Communicate(text, VOICE)
        
        # Save audio file
        await communicate.save(output_path)
        
        print(f"SUCCESS:{output_filename}")
        return output_path
        
    except Exception as e:
        print(f"ERROR:{str(e)}", file=sys.stderr)
        sys.exit(1)

def main():
    """Main function to handle command-line arguments"""
    if len(sys.argv) < 2:
        print("ERROR:No text provided", file=sys.stderr)
        sys.exit(1)
    
    # Get text from command-line argument
    text = sys.argv[1]
    
    # Generate unique filename based on timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    output_filename = f"speech_{timestamp}.mp3"
    
    # Run async function
    asyncio.run(generate_speech(text, output_filename))

if __name__ == "__main__":
    main()

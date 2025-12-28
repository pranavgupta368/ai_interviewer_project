import sys
import os
import asyncio
import edge_tts
from datetime import datetime

VOICE = "en-US-AriaNeural" 
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "audio")

async def generate_speech(text, output_filename):
    """
    Generate speech from text using edge-tts
    
    Args:
        text (str): Text to convert to speech
        output_filename (str): Name of the output MP3 file
    """
    try:
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        
        communicate = edge_tts.Communicate(text, VOICE)
        
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
    
    text = sys.argv[1]
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    output_filename = f"speech_{timestamp}.mp3"
    
    asyncio.run(generate_speech(text, output_filename))

if __name__ == "__main__":
    main()

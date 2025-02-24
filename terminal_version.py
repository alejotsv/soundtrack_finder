import os
import time
import hmac
import hashlib
import base64
import requests
import sounddevice as sd
import numpy as np
import wavio
import noisereduce as nr
import librosa
from pydub import AudioSegment
from pydub.utils import which
from dotenv import load_dotenv
import openai
from googleapiclient.discovery import build

# Load environment variables from .env
load_dotenv()
ACR_CLOUD_ACCESS_KEY = os.getenv("ACR_CLOUD_ACCESS_KEY")
ACR_CLOUD_ACCESS_SECRET = os.getenv("ACR_CLOUD_ACCESS_SECRET")
ACR_CLOUD_HOST = os.getenv("ACR_CLOUD_HOST")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_CSE_API_KEY = os.getenv("GOOGLE_CSE_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")

# Explicitly set FFmpeg path for pydub
AudioSegment.converter = which("ffmpeg")

# Audio settings
DURATION = 10  # Recording time in seconds
SAMPLE_RATE = 44100  # CD-quality
CHANNELS = 1  # Mono improves noise reduction
AUDIO_FILE = "recorded_audio.wav"

def record_audio():
    """Records audio with a countdown, applies noise reduction, and saves it."""
    print("🎤 Ready to record. You will have 10 seconds...")
    input("Press Enter to start recording...")
    print("\n⏳ Recording in progress...")
    audio_data = np.zeros((int(DURATION * SAMPLE_RATE), CHANNELS), dtype=np.float32)
    stream = sd.InputStream(samplerate=SAMPLE_RATE, channels=CHANNELS, dtype=np.float32)
    stream.start()
    for i in range(DURATION, 0, -1):
        print(f"\r⏳ Time left: {i} seconds", end='', flush=True)
        audio_data[int((DURATION - i) * SAMPLE_RATE):int((DURATION - i + 1) * SAMPLE_RATE)] = stream.read(SAMPLE_RATE)[0]
        time.sleep(1)
    stream.stop()
    stream.close()
    print("\n✅ Recording complete. Saving raw file...")
    wavio.write(AUDIO_FILE, audio_data, SAMPLE_RATE, sampwidth=3)
    print("🔧 Applying noise reduction...")
    raw_audio, sr = librosa.load(AUDIO_FILE, sr=SAMPLE_RATE)
    reduced_noise_audio = nr.reduce_noise(y=raw_audio, sr=sr, prop_decrease=0.8)
    reduced_noise_audio = librosa.util.normalize(reduced_noise_audio)
    reduced_noise_audio = np.int16(reduced_noise_audio * 32767)
    wavio.write(AUDIO_FILE, reduced_noise_audio, SAMPLE_RATE, sampwidth=2)
    print(f"🎵 Audio saved as {AUDIO_FILE} (Noise reduced and normalized)")

def recognize_song(file_path):
    """Recognizes a song using ACRCloud API."""
    print("🔎 Sending audio to ACRCloud for recognition...")
    if not os.path.exists(file_path):
        print("❌ Error: Audio file not found!")
        return None, None
    url = f"https://{ACR_CLOUD_HOST}/v1/identify"
    http_method = "POST"
    http_uri = "/v1/identify"
    data_type = "audio"
    signature_version = "1"
    timestamp = str(int(time.time()))
    string_to_sign = "\n".join([
        http_method,
        http_uri,
        ACR_CLOUD_ACCESS_KEY,
        data_type,
        signature_version,
        timestamp
    ])
    signature = base64.b64encode(hmac.new(
        ACR_CLOUD_ACCESS_SECRET.encode('utf-8'),
        string_to_sign.encode('utf-8'),
        hashlib.sha1
    ).digest()).decode('utf-8')
    with open(file_path, "rb") as f:
        sample = f.read()
    data = {
        'access_key': ACR_CLOUD_ACCESS_KEY,
        'data_type': data_type,
        'signature_version': signature_version,
        'signature': signature,
        'sample_bytes': str(len(sample)),
        'timestamp': timestamp
    }
    files = {'sample': (file_path, sample, "audio/wav")}
    response = requests.post(url, data=data, files=files)
    result = response.json()
    print("🔎 API Response:", result)
    if response.status_code == 200 and 'metadata' in result:
        song = result['metadata']['music'][0]
        title = song.get('title', 'Unknown Title')
        artist = song.get('artists', [{}])[0].get('name', 'Unknown Artist')
        print(f"🎵 Recognized: {title} by {artist}")
        return title, artist
    print("❌ No song recognized.")
    return None, None


def google_search(query):
    """Uses Google Custom Search Engine (CSE) to find relevant links."""
    service = build("customsearch", "v1", developerKey=GOOGLE_CSE_API_KEY)
    res = service.cse().list(q=query, cx=GOOGLE_CSE_ID, num=10).execute()
    return [item["snippet"] + " " + item["link"] for item in res.get("items", [])]


def ai_find_song_usage(song_title, artist):
    """Uses AI first, then integrates results from Google Search to enhance accuracy and completeness."""
    print(f"🤖 Searching for movies and TV shows featuring '{song_title}' by {artist}...")

    # Step 1: AI-only search
    ai_prompt = (
        f"List all movies and TV shows where the song '{song_title}' by {artist} was used in the soundtrack. "
        "For movies, return the title and release year. "
        "For TV shows, return the title, season, and episode number (if available), along with the release year. "
        "Ensure that only verified sources are used, and do not include unreliable results. "
        "Format the output strictly as follows:\n"
        "Movies:\nTitle (Year)\n"
        "TV Shows:\nTitle, SXXEXX (Year)"
    )
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    ai_response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "system", "content": ai_prompt}],
        temperature=0.5
    )
    ai_results = ai_response.choices[0].message.content if ai_response else ""

    # Step 2: Perform Google Search
    search_query = f"Where was the song '{song_title}' by {artist} used in movies and TV shows?"
    search_results = google_search(search_query)

    # Step 3: Merge AI and Google Search Data
    merge_prompt = (
        f"Here are AI-generated results listing movies and TV shows where the song '{song_title}' by {artist} was used: \n"
        f"{ai_results}\n"
        "Below are additional search results from Google. Merge these with the AI-generated results, ensuring no duplicates. "
        "If the same title appears in both, keep the one with the most details. "
        "Ensure that all titles match actual soundtrack placements and are formatted consistently as follows:\n"
        "Movies:\nTitle (Year)\n"
        "TV Shows:\nTitle, SXXEXX (Year)\n"
        f"Google search results:\n{search_results}"
    )
    merge_response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "system", "content": merge_prompt}],
        temperature=0.5
    )

    # Step 4: Return Merged AI Results
    final_results = merge_response.choices[0].message.content if merge_response else "❌ AI request failed."
    print("📄 AI + Google Search Combined Results:\n", final_results)


if __name__ == "__main__":
    record_audio()
    song_title, artist = recognize_song(AUDIO_FILE)
    if song_title and artist:
        print(f"✅ Song Recognized: {song_title} by {artist}")
        ai_find_song_usage(song_title, artist)
    else:
        print("❌ No song recognized. Please try again.")


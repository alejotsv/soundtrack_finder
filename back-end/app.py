import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import openai
from googleapiclient.discovery import build

# Load environment variables from .env
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_CSE_API_KEY = os.getenv("GOOGLE_CSE_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:5173/"}})

def google_search(query):
    """Uses Google Custom Search Engine (CSE) to find relevant links."""
    try:
        service = build("customsearch", "v1", developerKey=GOOGLE_CSE_API_KEY)
        res = service.cse().list(q=query, cx=GOOGLE_CSE_ID, num=10).execute()
        return [item["snippet"] + " " + item["link"] for item in res.get("items", [])]
    except Exception as e:
        print(f"Google Search Error: {e}")
        return []


def ai_find_song_usage(song_title, artist):
    """Uses AI first, then integrates results from Google Search."""
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

    return final_results


@app.route('/identify', methods=['POST'])
def identify_song():
    """API endpoint to receive song title & artist and find soundtrack appearances."""
    try:
        data = request.get_json()
        song_title = data.get("song_title")
        artist = data.get("artist")

        if not song_title or not artist:
            return jsonify({"status": "error", "message": "Missing song_title or artist in request body"}), 400

        print(f"✅ Received song: {song_title} by {artist}")
        soundtrack_info = ai_find_song_usage(song_title, artist)

        return jsonify({
            "status": "success",
            "song": song_title,
            "artist": artist,
            "soundtrack": soundtrack_info
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

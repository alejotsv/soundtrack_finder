export async function findSoundtrack(songData: { song_title: string; artist: string }) {
  const API_URL = import.meta.env.VITE_API_URL || "https://soundtrack-finder.onrender.com";

  try {
    const response = await fetch(`${API_URL}/find-that-soundtrack`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(songData),
    });

    const result = await response.json();   

    return result;
  } catch (error) {    
    return null;
  }
}

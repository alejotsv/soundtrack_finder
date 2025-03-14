export async function findSoundtrack(songData: { song_title: string; artist: string }) {
  const API_URL = import.meta.env.VITE_API_URL || "https://soundtrack-finder.onrender.com";

  try {
    const response = await fetch(`${API_URL}/identify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(songData),
    });

    const result = await response.json();
    console.log("🎬 Soundtrack API Response:", result);

    return result;
  } catch (error) {
    console.error("❌ Error sending data to Soundtrack API:", error);
    return null;
  }
}

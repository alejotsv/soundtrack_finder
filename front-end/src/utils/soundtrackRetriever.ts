export async function findSoundtrack(songData: { song_title: string; artist: string }) {
  const apiUrl = "https://soundtrack-finder.onrender.com/identify";

  try {
    const response = await fetch(apiUrl, {
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

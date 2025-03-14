import { useState } from "react";
import { Button, Center, Text, Stack } from "@mantine/core";
import { AudioRecorder } from "../utils/audioRecorder";
import { recognizeSong } from "../utils/songRecognizer";
import { findSoundtrack } from "../utils/soundtrackRetriever";

const SoundTracker = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Find out which movies and TV shows feature a song in their soundtracks!");
  const [songData, setSongData] = useState<{ song_title: string; artist: string } | null>(null);
  const [soundtrack, setSoundtrack] = useState<{ movies: string[]; tvShows: string[] } | null>(null);

  const handleClick = async () => {
    // Reset previous results when clicking again
    setSongData(null);
    setSoundtrack(null);
    setLoading(true);
    setMessage("🎤 Listening... Identifying song...");
    const recorder = new AudioRecorder(10);

    try {
      const audioBlob = await recorder.startRecording();
      const identifiedSong = await recognizeSong(audioBlob);

      if (!identifiedSong) {
        setMessage("❌ Could not identify the song.");
        setLoading(false);
        return;
      }

      setSongData(identifiedSong);
      setMessage(`🎵 Song identified: ${identifiedSong.song_title} by ${identifiedSong.artist}. Searching soundtrack...`);

      const timeout = setTimeout(() => {
        setMessage("⏳ Sit tight, almost there...");
      }, 5000);

      const soundtrackResult = await findSoundtrack(identifiedSong);
      clearTimeout(timeout);

      if (!soundtrackResult || soundtrackResult.status !== "success") {
        setMessage("❌ Could not find any matches.");
      } else {
        setSoundtrack(parseSoundtrack(soundtrackResult.soundtrack));
        setMessage(""); // Clear message to display results
      }
    } catch (error) {      
      setMessage("❌ Could not find any matches.");
    } finally {
      setLoading(false);
    }
  };

  // Function to parse API response into Movies & TV Shows
  const parseSoundtrack = (soundtrackText: string) => {    
    const sections = soundtrackText.includes("\n\n")
      ? soundtrackText.split("\n\n")
      : [soundtrackText];
  
    let movies: string[] = [];
    let tvShows: string[] = [];
  
    // Check which category exists and extract values safely
    sections.forEach((section) => {
      if (section.startsWith("Movies:")) {
        movies = section.split("\n").slice(1).map((m) => m.trim());
      } else if (section.startsWith("TV Shows:")) {
        tvShows = section.split("\n").slice(1).map((t) => t.trim());
      }
    });
  
    return { movies, tvShows };
  };
  

  return (
    <Center
      style={{
        minHeight: "100vh",
        textAlign: "center",
        backgroundColor: "#f5f5f5",
        padding: "20px",
        overflow: "hidden",
      }}
    >
      <Stack gap={20} align="center" style={{ width: "100%", maxWidth: "800px" }}>
        {/* Display Soundtrack Results */}
        {soundtrack && (
          <div
            style={{
              maxHeight: "50vh",
              overflowY: "auto",
              width: "100%",
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              textAlign: "left",
            }}
          >
            <Text size="lg" fw={600} style={{ textAlign: "center" }}>
              🎶 The song <strong><em>{songData?.song_title}</em></strong> by <strong>{songData?.artist}</strong> is featured on:
            </Text>

            {/* Movies List */}
            <Text size="lg" style={{ color: "#1565C0", fontWeight: 700, marginTop: "10px" }}>
              🎬 Movies:
            </Text>
            <div style={{ textAlign: "left", fontSize: "1.1rem", fontWeight: 500 }}>
              {soundtrack.movies.map((movie, index) => (
                <p key={index} style={{ margin: "4px 0", paddingLeft: "10px" }}>{movie}</p>
              ))}
            </div>

            {/* TV Shows List */}
            <Text size="lg" style={{ color: "#00BCD4", fontWeight: 700, marginTop: "10px" }}>
              📺 TV Shows:
            </Text>
            <div style={{ textAlign: "left", fontSize: "1.1rem", fontWeight: 500 }}>
              {soundtrack.tvShows.map((show, index) => (
                <p key={index} style={{ margin: "4px 0", paddingLeft: "10px" }}>{show}</p>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Status Message */}
        <Text
          size="xl"
          fw={600}
          style={{
            fontFamily: "'Poppins', sans-serif",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.5",
          }}
        >
          {message}
        </Text>

        {/* Listening Button */}
        <Button
          color="blue"
          size="xl"
          radius="xl"
          variant="gradient"
          gradient={{ from: "blue", to: "cyan", deg: 90 }}
          style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "20px" }}
          loading={loading}
          loaderProps={{ type: "dots" }}
          onClick={handleClick}
        >
          🎧 Click to Listen
        </Button>
      </Stack>
    </Center>
  );
};

export default SoundTracker;

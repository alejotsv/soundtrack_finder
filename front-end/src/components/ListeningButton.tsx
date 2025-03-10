import { useState } from "react";
import { Button, Center, Text, Stack } from "@mantine/core";
import { AudioRecorder } from "../utils/audioRecorder"; // Import the recorder class

const ListeningButton = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const recorder = new AudioRecorder(10); // Create a new recorder instance

    try {
      const audioBlob = await recorder.startRecording();
      console.log("🎤 Recorded Audio Blob:", audioBlob);
    } catch (error) {
      console.error("❌ Recording failed:", error);
    }

    setLoading(false);
  };

  return (
    <Center
      style={{
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f5f5f5",
        padding: "0 20px",
      }}
    >
      <Stack gap={20} align="center">
        {/* Explanation Text */}
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
          Find out which{" "}
          <span style={{ color: "#1565C0", fontWeight: 700 }}>movies</span> and{" "}
          <span style={{ color: "#00BCD4", fontWeight: 700 }}>TV shows</span>{" "}
          feature a song in their soundtracks!
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

export default ListeningButton;

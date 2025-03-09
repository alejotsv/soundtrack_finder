import { useState } from "react";
import { Button, Center, Text, Stack } from "@mantine/core";

const ListeningButton = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulate a 2-second API call
  };

  return (
    <Center
      style={{
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f5f5f5", // Light background for contrast
        padding: "0 20px", // Prevents text from touching edges on small screens
      }}
    >
      <Stack gap={20} align="center">
        {/* Explanation Text */}
        <Text
          size="xl"
          fw={600} // ✅ Changed from 'weight' to 'fw' for correct Mantine usage
          style={{
            fontFamily: "'Poppins', sans-serif", // Modern, clean font
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

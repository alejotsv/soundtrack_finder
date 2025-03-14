const ACR_CLOUD_ACCESS_KEY = import.meta.env.VITE_ACR_CLOUD_ACCESS_KEY;
const ACR_CLOUD_ACCESS_SECRET = import.meta.env.VITE_ACR_CLOUD_ACCESS_SECRET;
const ACR_CLOUD_HOST = import.meta.env.VITE_ACR_CLOUD_HOST;

async function generateHmacSha1(message: string, secret: string): Promise<string> {
  // Convert secret to Uint8Array
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);

  // Import key for HMAC-SHA1 signing
  const key = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: { name: "SHA-1" } },
    false,
    ["sign"]
  );

  // Convert message to Uint8Array and sign
  const signatureBuffer = await window.crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const signatureBase64 = arrayBufferToBase64(signatureBuffer);
  
  return signatureBase64;
}

// Converts ArrayBuffer (Web Crypto) to Base64, ensuring correct encoding
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const binary = Array.from(new Uint8Array(buffer))
    .map((byte) => String.fromCharCode(byte))
    .join("");
  return btoa(binary);
}

export async function recognizeSong(audioBlob: Blob) {
  const url = `https://${ACR_CLOUD_HOST}/v1/identify`;
  const httpMethod = "POST";
  const httpUri = "/v1/identify";
  const dataType = "audio";
  const signatureVersion = "1";
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Create the string to sign
  const stringToSign = `${httpMethod}\n${httpUri}\n${ACR_CLOUD_ACCESS_KEY}\n${dataType}\n${signatureVersion}\n${timestamp}`;

  // Generate the signature
  const signature = await generateHmacSha1(stringToSign, ACR_CLOUD_ACCESS_SECRET);

  // Ensure the file is correctly formatted
  const audioFile = new Blob([audioBlob], { type: "audio/wav" });

  // Prepare FormData
  const formData = new FormData();
  formData.append("access_key", ACR_CLOUD_ACCESS_KEY);
  formData.append("data_type", dataType);
  formData.append("signature_version", signatureVersion);
  formData.append("signature", signature);
  formData.append("sample_bytes", audioBlob.size.toString());
  formData.append("timestamp", timestamp);
  formData.append("sample", audioFile, "audio.wav");

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();    

    // Extract song details
    if (result?.metadata?.music?.length > 0) {
      const firstMatch = result.metadata.music[0];
      const cleanedTitle = firstMatch.title.replace(/"/g, "");
      return {
        song_title: cleanedTitle || "Unknown Title",
        artist: firstMatch.artists?.[0]?.name || "Unknown Artist",
      };
    }

    return null;
  } catch (error) {    
    return null;
  }
}

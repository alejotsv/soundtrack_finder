export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private duration: number;

  constructor(duration = 10) {
    this.duration = duration;
  }

  async startRecording(): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
          resolve(audioBlob);
        };

        this.mediaRecorder.start();

        console.log(`🎤 Recording started... (${this.duration} seconds)`);

        // Stop recording after the specified duration
        setTimeout(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
            this.mediaRecorder.stop();
            console.log("⏹️ Recording stopped.");
          }
        }, this.duration * 1000);
      } catch (error) {
        reject(`❌ Error accessing microphone: ${error}`);
      }
    });
  }
}

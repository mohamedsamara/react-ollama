import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const port = 3000;

interface Conversation {
  role: string;
  content: string;
}

const conversation: Conversation[] = [];

const allowedOrigins = ["http://localhost:5173", "http://localhost:4173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Cache-Control"],
  })
);

app.use(express.json());

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Service is healthy and running.",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/conversation", (req: Request, res: Response) => {
  const { message } = req.body;
  if (message) {
    conversation.push({ role: "user", content: message });
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Message is required" });
  }
});

app.get("/api/conversation", async (req: Request, res: Response) => {
  try {
    // Set response headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // Flush headers to ensure that the response stream starts immediately
    res.flushHeaders();

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      body: JSON.stringify({
        model: "llama3.2",
        messages: conversation,
      }),
      headers: { "Content-Type": "application/json" },
    });

    let content = ""; // Buffer to accumulate the full response content
    const decoder = new TextDecoder();

    if (!response.body) {
      throw new Error("No response body returned from the chat API.");
    }

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read(); // Read a chunk of the response

      if (done) break; // End of the stream

      // Decode the chunk into a string
      const decodedChunk = decoder.decode(value, { stream: true });
      const parsed = JSON.parse(decodedChunk); // Assuming the chunk is JSON

      if (parsed.done) break; // If the parsed message indicates that the stream is done, break out of the loop

      // Accumulate the content from each chunk
      content += parsed.message.content;

      // Send an SSE event with the partial content
      const result = { message: parsed.message.content, complete: false };
      res.write(`data: ${JSON.stringify(result)}\n\n`);
    }

    // After finishing the stream, update the conversation
    conversation.push({ role: "assistant", content });

    // Send a final SSE message indicating completion
    const result = { message: content, complete: true };
    res.write(`data: ${JSON.stringify(result)}\n\n`);
    res.write("event: close\n");
    res.write("data: {}\n\n");
    res.end();

    // Clean up when the connection is closed
    req.on("close", () => {
      console.log("Connection is closed.");
      res.end();
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).send("<h1>Not Found</h1>");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

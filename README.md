# React Ollama Chat

This project enables real-time conversations with an AI powered by the Ollama language model. The server handles message exchanges through a simple Express API, using Server-Sent Events (SSE) to stream responses from Ollama.

## Setup Instructions

1. Start the Container Containing the LLM

   To run the Ollama container, use the following Docker command:

   ```bash
   docker run --rm -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
   ```

   This will start the Ollama container and expose the necessary port (11434).

2. Pull the LLM Model (Big, 2GB)

   Once the container is running, you'll need to pull the language model (e.g., llama3.2). Run the following command:

   ```bash
   docker exec -it ollama ollama pull llama3.2
   ```

3. Start the Backend Server and Frontend

   To start the server and frontend together, use the following steps:

   1. Install dependencies: First, navigate to your project directory and install the required dependencies for both the client and server.

      ```bash
      yarn install
      ```

   2. Start both server and frontend: To start both the backend and frontend at the same time, run the dev script from your root project directory. This will run the server (Express API) and the frontend (React app) concurrently.

      ```bash
      yarn dev
      ```

4. Build the Application for Production

   To create a production build of the app (both frontend and backend), run:

   ```bash
   yarn build
   ```

   After building the app, you can start both the server and frontend in production mode using:

   ```bash
   yarn start
   ```

# Base image with llama.cpp server
FROM ghcr.io/ggml-org/llama.cpp:server

WORKDIR /app

EXPOSE 8080

# Download and start the Gemma 3.4B model from Hugging Face
CMD ["-hf", "ggml-org/gemma-3-4b-it-GGUF", "--host", "0.0.0.0", "--port", "8080"]

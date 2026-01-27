# Base image with llama.cpp server
FROM ghcr.io/ggml-org/llama.cpp:server

WORKDIR /app

# Install curl if not already present
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create models folder
RUN mkdir -p /app/models

# Download the public model from Hugging Face
RUN curl -L -o /app/models/qwen2.5-3b-instruct-q4_k_m.gguf "https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf?download=true"

EXPOSE 8080

# Start llama.cpp server with the model
CMD ["-m", "/app/models/qwen2.5-3b-instruct-q4_k_m.gguf", "--host", "0.0.0.0", "--port", "8080"]

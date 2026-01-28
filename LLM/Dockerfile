# Base image with llama.cpp server
FROM ghcr.io/ggml-org/llama.cpp:server

WORKDIR /app

EXPOSE 8080

# Download and start the Quantized Qwen2.5-VL-3B-Instruct model from Hugging Face
CMD [ "-hf", "ggml-org/Qwen2.5-VL-3B-Instruct-GGUF:q4_k_m", "--host", "0.0.0.0", "--port", "8080" ]

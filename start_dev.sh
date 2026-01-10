#!/bin/bash
echo "🚀 Starting MedX Development Environment..."

# Function to kill processes on exit
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. Please create it first."
    exit 1
fi

# Start Backend
echo "Starting Backend (Port 8000)..."
python3 -m uvicorn api.index:app --reload --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo "Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both
wait $BACKEND_PID $FRONTEND_PID

# 👋 Welcome to MedX

**MedX** is a next-generation healthcare platform that bridges the gap between patients and clinicians using the power of AI. It simplifies medication management, unlocks insights from clinical notes, and provides intelligent health coaching—all in one secure, interoperable system.

---

## ✨ Key Features

### For Clinicians 👩‍⚕️
*   **AI Clinical Note Analysis**: Automatically extracts conditions and medications from unstructured clinical notes.
*   **FHIR Interoperability**: Converts clinical data into standard FHIR bundles for easy integration with EMR systems.
*   **Intelligent Insights**: Uses Google's Gemini models to de-identify patient data and provide smart summaries.

### For Patients 👨‍👩‍👧‍👦
*   **Smart Medication Tracking**: Keep track of your prescriptions and adherence with ease.
*   **Drug Interaction Checker**: Instantly check if your medications overlap or conflict with one another.
*   **Prescription Scanning**: Just snap a photo of your prescription to digitize it instantly involving Vision OCR.
*   **Personalized Coaching**: Receive AI-generated health tips and coaching based on your specific health context.

---

## 🏗️ Architecture & Services

The platform is built as a set of robust microservices to ensure scalability and separation of concerns:

1.  **Frontend (React + Vite)**: A modern, responsive dashboard for patients and doctors.
2.  **Patient Service (FastAPI)**: Manages medication schedules, adherence logs, and user data (using Firestore/SQLite).
3.  **Clinical Service (FastAPI)**: Handles the processing of clinical notes and transformation to FHIR standards.
4.  **MedX AI (FastAPI + Gemini)**: The "brain" of the operation. Handles NLP, image recognition (prescriptions), and generative AI tasks.
5.  **Analytics Pipeline**: Ingests events to track system usage and health trends.

---

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, TailwindCSS
*   **Backend**: Python, FastAPI, Uvicorn
*   **AI & ML**: Google Gemini (Generative AI), Computer Vision
*   **Database**: SQLite, Firestore
*   **DevOps**: Docker, Docker Compose

---

## 🚀 Getting Started

Getting the entire system up and running is easy with Docker.

### Prerequisites
*   Docker & Docker Compose
*   A Google Cloud Project (for some advanced features) with Gemini API access.

### Quick Start
1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd MedX
    ```

2.  **Set up Environment Variables**:
    Create a `.env` file in the root directory (you can copy `.env.example` if it exists) and add your keys:
    ```env
    GOOGLE_API_KEY=your_gemini_api_key
    # Add other keys as required
    ```

3.  **Run with Docker Compose**:
    ```bash
    docker-compose up --build
    ```

4.  **Access the App**:
    *   frontend: `http://localhost:3000`
    *   Patient API: `http://localhost:8080`
    *   Clinical API: `http://localhost:8081`
    *   AI Service: `http://localhost:8082`

---

## 🔮 Future Roadmap
*   Mobile App (React Native) implementation.
*   Deep integration with wearable devices.
*   Advanced population health analytics dashboard.

---

## 🤝 Contributing
We love contributions! Please read our `CONTRIBUTING.md` (coming soon) for details on our code of conduct, and the process for submitting pull requests.

---

*Built with ❤️ during the TechSprint to make healthcare better for everyone.*

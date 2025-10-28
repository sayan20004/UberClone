# AI Quiz Generator 🧠💡

Transform your PDF notes into interactive quizzes! This full-stack MERN application leverages the Google Gemini API to automatically generate multiple-choice quizzes based on uploaded documents. Users can register, log in, create quizzes with custom settings, take them, and review their performance with AI-generated explanations.

## Key Features ✨

* **User Management:** Secure registration with email OTP verification and password-based login. Authentication is handled via JWT.
* **PDF-to-Quiz:** Upload PDF files. Text is extracted using `pdfjs-dist`.
* **AI-Powered Generation:** Utilizes the Google Gemini API (`gemini-pro` model) to create questions, multiple-choice options (with one correct answer), and explanations based on the extracted PDF text.
* **Customization:** Users can define the quiz topic, set the difficulty (easy, medium, hard), and choose the number of questions.
* **Interactive Quiz Interface:** A clean interface for taking the quiz, navigating between questions, and selecting answers.
* **Detailed Results:** After submission, view the score, review answers, see correct options highlighted, and access AI-generated explanations for each question.
* **Modern Tech Stack:** Built with React, Node.js, Express, MongoDB, and styled with Tailwind CSS.

## Technology Stack 🛠️

* **Frontend:** Vite, React, React Router, Tailwind CSS, Axios, React Hot Toast
* **Backend:** Node.js, Express.js, Mongoose (MongoDB ODM)
* **Database:** MongoDB
* **AI Model:** Google Gemini API (`@google/generative-ai`)
* **Authentication:** JSON Web Tokens (JWT), bcryptjs
* **File Handling:** Multer (Upload), pdfjs-dist (Text Extraction)
* **Email Verification:** Nodemailer

## Getting Started 🚀

Follow these instructions to get a copy of the project up and running on your local machine.

**Prerequisites:**

* Node.js (v18 or higher recommended)
* npm (usually comes with Node.js)
* MongoDB (set up locally or use a cloud service like MongoDB Atlas)
* Google AI Studio API Key (from [aistudio.google.com](https://aistudio.google.com/))
* Gmail Account with 2-Step Verification and an App Password configured

**Backend Installation:**

1.  Clone the repository (if you haven't already).
2.  Navigate to the `Backend` directory: `cd Backend`
3.  Install dependencies: `npm install`
4.  Create a `.env` file in the `Backend` root.
5.  Populate `.env` with your credentials:
    ```env
    MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
    PORT=4000
    JWT_SECRET=YOUR_CHOSEN_JWT_SECRET
    EMAIL_USER=YOUR_GMAIL_ADDRESS
    EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD
    GEMINI_API_KEY=YOUR_GOOGLE_AI_STUDIO_API_KEY
    ```
6.  Run the development server: `npm run dev`

**Frontend Installation:**

1.  Navigate to the `Frontend` directory: `cd ../Frontend`
2.  Install dependencies: `npm install`
3.  Verify the `proxy` setting in `vite.config.js` matches your backend `PORT` (e.g., `target: 'http://localhost:4000'`).
4.  Run the development server: `npm run dev`
5.  Access the application in your browser at the specified local URL (e.g., `http://localhost:5173`).

## How to Use 📖

1.  Visit the app in your browser.
2.  Click **Register**, fill in your details, and submit.
3.  Check your email for the OTP, enter it in the verification form.
4.  Once verified, you'll be logged in and redirected to the Dashboard. (Alternatively, use the **Login** button if already registered).
5.  On the **Dashboard**:
    * Enter a **Topic** for your quiz.
    * Click **Choose File** and select your PDF document.
    * Select the desired **Number of Questions**.
    * Choose the **Difficulty**.
    * Click **Start AI Quiz**.
6.  Wait for the AI to process the PDF and generate the quiz.
7.  Take the quiz by selecting answers and navigating using **Next** / **Prev**.
8.  Click **Submit Quiz** on the last question.
9.  Review your **Results**, check your score, and toggle explanations for each question.
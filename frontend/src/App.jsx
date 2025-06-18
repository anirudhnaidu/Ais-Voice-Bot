import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Set up recognition
  const setupRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognitionRef.current = recognition;
  };

  const startListening = () => {
    if (!recognitionRef.current) setupRecognition();
    const recognition = recognitionRef.current;

    // Stop any current speech before asking
    stopSpeaking();

    setAnswer('');
    setListening(true);
    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);

      try {
        const response = await fetch('http://localhost:5000/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcript }),
        });

        const data = await response.json();
        setAnswer(data.reply);
        speak(data.reply);
      } catch (error) {
        setAnswer('❌ Error communicating with the bot.');
        console.error('Bot error:', error);
      }

      setListening(false);
    };
  };

  const speak = (text) => {
    stopSpeaking(); // Stop any previous voice

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current.speaking || synthRef.current.pending) {
      synthRef.current.cancel();
    }
    setSpeaking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-200 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
      <div id="mid" className="bg-white rounded-3xl shadow-2xl p-5 max-w-2xl w-full px-4 sm:px-6 md:px-8">
        {/* Header */}
        <h1 className="flex justify-center items-center">
          <img src="./logo.png" alt="AI Voice Bot Icon" className="h-40 w-40" />
        </h1>
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-2">AI's Voice Bot</h1>
        <p className="text-center text-lg text-purple-500 mb-6">How can I help you?</p>

        {/* Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={startListening}
            disabled={listening}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-xl text-lg font-semibold hover:opacity-90 transition"
          >
            {listening ? '🎧 Listening...' : '🎤 Start Talking'}
          </button>
          <button
            onClick={stopSpeaking}
            disabled={!speaking}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-xl text-lg font-semibold hover:opacity-90 transition"
          >
            ⏹️ Stop Voice
          </button>
        </div>

        {/* Display Q&A */}
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-800 mb-1">🗣️ Question or Query asked:</p>
            <div className="bg-gray-100 p-4 rounded-xl text-gray-700 min-h-[3rem]">
              {question || '...'}
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-800 mb-1">🤖 Bot's Response:</p>
            <div className="bg-green-100 p-4 rounded-xl text-gray-800 min-h-[3rem] prose max-w-none">
              <ReactMarkdown>{answer || '...'}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)  # Allow requests from frontend


# ✅ Your Gemini API Key
GENAI_API_KEY = "AIzaSyAFtgF2JqL2wdFLso--z-tUthM-8pI0DZ4"
genai.configure(api_key=GENAI_API_KEY)

# ✅ Use a model that supports generateContent
model = genai.GenerativeModel("models/gemini-1.5-pro")

PERSONALITY_PROMPT = """
You are a helpful, clear, friendly AI assistant. Answer using Markdown formatting:
- Use bullet points when listing.
- Use **bold** or *italic* for emphasis.
- Keep tone professional but warm.
- Avoid repeating the question. Jump straight into the answer.
"""

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("message", "")

    full_prompt = PERSONALITY_PROMPT.format(name="Your Name") + "\n" + question

    try:
        print(f"\n✅ PROMPT SENT TO AI:\n{full_prompt}\n")
        response = model.generate_content(full_prompt)
        reply = response.text.strip()
        print(f"✅ AI's RESPONSE:\n{reply}\n")
        return jsonify({"reply": reply})
    except Exception as e:
        print(f"❌ ERROR FROM GEMINI:\n{e}\n")
        return jsonify({"reply": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
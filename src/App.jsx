import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef();

  const SPOONECULAR_API_KEY = import.meta.env.VITE_SPOONECULAR_KEY;

const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = { text: input, sender: "user" };
  setMessages(prev => [...prev, userMessage]);
  setInput("");
  setIsTyping(true);

  try {
    // Step 1: Search recipes
    const searchRes = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
        input
      )}&number=1&apiKey=${SPOONECULAR_API_KEY}`
    );

    if (!searchRes.ok) throw new Error("Search API failed");

    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      setMessages(prev => [...prev, { text: "No recipes found 😅", sender: "bot" }]);
      return;
    }

    const firstRecipe = searchData.results[0];

    // Step 2: Fetch details of first recipe
    const detailRes = await fetch(
      `https://api.spoonacular.com/recipes/${firstRecipe.id}/information?apiKey=${SPOONECULAR_API_KEY}`
    );

    if (!detailRes.ok) throw new Error("Details API failed");

    const detailData = await detailRes.json();

    const reply = `
🍽️ ${detailData.title}

🕒 Ready in: ${detailData.readyInMinutes} minutes
👥 Servings: ${detailData.servings}

📝 Instructions:
${detailData.instructions ? detailData.instructions.replace(/<[^>]+>/g, '') : "No instructions available."}
    `;

    setMessages(prev => [...prev, { text: reply, sender: "bot" }]);

  } catch (error) {
    console.error(error);
    setMessages(prev => [
      ...prev,
      { text: "Error: Could not reach API ❌", sender: "bot" },
    ]);
  } finally {
    setIsTyping(false);
  }
};



  // Auto scroll to bottom
  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

return (
  <div className="chat-container">
    <div className="chat-header">🍳 Recipe Chatbot</div>   {/* 👈 New Heading */}

    <div className="chat-box" ref={chatBoxRef}>
      {messages.map((msg, i) => (
        <div key={i} className={`message ${msg.sender}`}>
          {msg.text}
        </div>
      ))}
      {isTyping && <div className="typing">Bot is typing...</div>}
    </div>

    <div className="input-area">
      <input
        type="text"
        value={input}
        placeholder="Ask for a recipe..."
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        disabled={isTyping}
      />
      <button onClick={sendMessage} disabled={!input || isTyping}>
        Send
      </button>
    </div>
  </div>
);

}

export default App;

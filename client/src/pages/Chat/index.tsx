import { useState, useEffect, useRef } from 'react'

const apiUrl = import.meta.env.VITE_API_URL

const Chat = () => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<
    Array<{ text: string; type: string }>
  >([]) // Array of objects for user and chatgpt messages
  const [isSending, setIsSending] = useState(false)

  return (
    <div>
      <h2>Chat Messages</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg.text}</div>
        ))}
      </div>
      <form>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button type="submit" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default Chat

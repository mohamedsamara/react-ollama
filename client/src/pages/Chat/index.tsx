import { useState, useEffect, useRef } from 'react'

const apiUrl = import.meta.env.VITE_API_URL

const Chat = () => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<
    Array<{ text: string; type: string }>
  >([]) // Array of objects for user and chatgpt messages
  const [isSending, setIsSending] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const streamChat = () => {
    if (eventSourceRef.current) eventSourceRef.current.close()

    const eventSource = new EventSource(`${apiUrl}/conversation`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('>>> Connection opened!')
    }

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.complete) {
        console.log('Stream completed')
        eventSource.close() // Close EventSource to stop reconnection attempts
        console.log('>>> Stream closed by the server')
      } else {
        // Append the incoming message part to the last bot message
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages]
          // If the last message is from the bot, append to its text
          if (
            updatedMessages.length > 0 &&
            updatedMessages[updatedMessages.length - 1].type === 'bot'
          ) {
            updatedMessages[updatedMessages.length - 1].text += data.message
          } else {
            // Otherwise, add a new bot message entry
            updatedMessages.push({ text: data.message, type: 'bot' })
          }
          return updatedMessages
        })
      }
    }

    eventSource.onerror = (e) => {
      console.log('ERROR!', e)
    }
  }

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close()
    }
  }, [])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    // Add user message to the messages array
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, type: 'user' }, // Add user message to state
    ])

    setIsSending(true)

    try {
      const response = await fetch(`${apiUrl}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setMessage('')
      streamChat()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div>
      <h2>Chat Messages</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg.text}</div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
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

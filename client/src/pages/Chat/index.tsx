import { useState, useEffect, useRef } from 'react'

import { ChatTypes } from '@lib/types'
import { API_URL } from '@lib/constants'
import { ChatHeader, ChatFooter, MsgList } from './components'

const Chat = () => {
  const [messages, setMessages] = useState<ChatTypes.Msg[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const streamChat = () => {
    if (eventSourceRef.current) eventSourceRef.current.close()

    const eventSource = new EventSource(`${API_URL}/conversation`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('>>> Connection opened!')
      if (!isStreaming) setIsStreaming(true)
    }

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.complete) {
        console.log('Stream completed')
        eventSource.close() // Close EventSource to stop reconnection attempts
        setIsStreaming(false)
        console.log('>>> Stream closed by the server')
      } else {
        // Append the incoming message part to the last bot message
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages]
          // If the last message is from the bot, append to its text
          if (
            updatedMessages.length > 0 &&
            updatedMessages[updatedMessages.length - 1].role === 'bot'
          ) {
            updatedMessages[updatedMessages.length - 1].text += data.message
          } else {
            // Otherwise, add a new bot message entry
            updatedMessages.push({ text: data.message, role: 'bot' })
          }
          return updatedMessages
        })
      }
    }

    eventSource.onerror = (e) => {
      console.log('ERROR!', e)
    }
  }

  const stopStreaming = () => {
    if (eventSourceRef.current) eventSourceRef.current.close()
    setIsStreaming(false)
    console.log('Close EventSource')
  }

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close()
    }
  }, [])

  const sendMessage = async (message: string) => {
    // Add user message to the messages array
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, role: 'user' },
    ])
    try {
      const response = await fetch(`${API_URL}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      streamChat()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="relative flex flex-col h-screen w-full sm:max-w-[768px] mx-auto">
      <div className="flex-shrink-0">
        <ChatHeader />
      </div>
      <div className="flex-1 space-y-4 py-6 px-4 overflow-y-auto no-scrollbar">
        <MsgList messages={messages} />
      </div>
      <div className="flex-shrink-0">
        <ChatFooter
          sendMessage={sendMessage}
          stopStreaming={stopStreaming}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  )
}

export default Chat

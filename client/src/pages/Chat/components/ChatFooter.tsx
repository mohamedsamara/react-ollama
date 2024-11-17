import { useState, useRef, useEffect } from 'react'
import { Button, Loading } from 'react-daisyui'
import { IoSend } from 'react-icons/io5'
import { FaStop } from 'react-icons/fa'

const MAX_ROWS = 20

const ChatFooter = ({
  sendMessage,
  stopStreaming,
  isStreaming,
}: {
  sendMessage: (msg: string) => void
  stopStreaming: () => void
  isStreaming: boolean
}) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isStreaming) return stopStreaming()

    if (!message.trim()) return
    sendMessage(message)

    setMessage('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  // Auto-grow the textarea as user types, with a limit on rows
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to shrink the textarea when content is removed
      textareaRef.current.style.height = 'auto'

      // Get the scrollHeight of the textarea (the full content height)
      const scrollHeight = textareaRef.current.scrollHeight

      // Set the max height based on the maximum rows
      const lineHeight = parseInt(
        window.getComputedStyle(textareaRef.current).lineHeight,
        10,
      )
      const maxHeight = lineHeight * MAX_ROWS

      // If the content exceeds the max height, set the height to maxHeight, otherwise use scrollHeight
      textareaRef.current.style.height = `${Math.min(
        scrollHeight,
        maxHeight,
      )}px`
    }
  }, [message])

  return (
    <form
      onSubmit={onSubmit}
      className="p-4 flex flex-col items-start space-y-2"
    >
      <div className="flex items-end relative w-full">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          placeholder="Type your message"
          rows={1}
          className="self-end p-3 pr-12 resize-none w-full text-slate-700 bg-slate-200 focus:outline-none placeholder:text-slate-800 rounded-md"
        />
        <div className="absolute right-3 bottom-2 flex items-center">
          {isStreaming ? (
            <Button
              type="submit"
              color="primary"
              size="sm"
              shape="circle"
              className="mt-2"
            >
              <FaStop />
            </Button>
          ) : (
            <Button
              type="submit"
              color="primary"
              size="sm"
              shape="circle"
              disabled={!message.trim()}
              className="mt-2"
            >
              <IoSend />
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

export default ChatFooter

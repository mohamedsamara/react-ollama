import { ReactNode } from 'react'
import { ChatBubble } from 'react-daisyui'
import Markdown from 'react-markdown'
import RemarkGfm from 'remark-gfm'

import { ChatTypes } from '@lib/types'

const Msg = ({ msg }: { msg: ChatTypes.Msg }) => {
  if (msg.role === 'user') {
    return (
      <ChatBubble end>
        <ChatBubble.Message color="neutral">{msg.text}</ChatBubble.Message>
      </ChatBubble>
    )
  }

  return (
    <Markdown
      remarkPlugins={[RemarkGfm]}
      components={{
        code: ({ node, className, children, ...props }) => {
          return <CustomCodeBlock {...props}>{children}</CustomCodeBlock>
        },
        a: (props) => {
          const href = props.href || ''
          if (/\.(aac|mp3|opus|wav)$/.test(href)) {
            return (
              <figure>
                <audio controls src={href}></audio>
              </figure>
            )
          }
          if (/\.(3gp|3g2|webm|ogv|mpeg|mp4|avi)$/.test(href)) {
            return (
              <video controls width="99.9%">
                <source src={href} />
              </video>
            )
          }
          const isInternal = /^\/#/i.test(href)
          const target = isInternal ? '_self' : props.target ?? '_blank'
          return <a className="text-blue-500" {...props} target={target} />
        },
      }}
    >
      {msg.text}
    </Markdown>
  )
}

export default Msg

const CustomCodeBlock = ({ children }: { children: ReactNode }) => {
  return (
    <pre
      className="bg-slate-100 p-4 rounded-md"
      //   style={{ backgroundColor: '#ccc', padding: '1em', borderRadius: '5px' }}
    >
      <code>{children}</code>
    </pre>
  )
}

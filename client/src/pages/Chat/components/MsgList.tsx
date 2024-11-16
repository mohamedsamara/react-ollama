import { ChatTypes } from '@lib/types'
import Msg from './Msg'

const MsgList = ({ messages }: { messages: ChatTypes.Msg[] }) => {
  return messages.map((msg, index) => <Msg key={index} msg={msg} />)
}

export default MsgList

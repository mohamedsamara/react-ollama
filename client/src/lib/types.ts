export namespace ChatTypes {
  export type MsgRole = 'user' | 'bot'

  export type Msg = {
    text: string
    role: MsgRole
  }
}

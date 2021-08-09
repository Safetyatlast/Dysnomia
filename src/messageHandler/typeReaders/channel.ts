import TypeReader from '../structures/TypeReader';
import Constants from '../Constants';

import type Command from '../structures/Command';
import type MessageHandler from "../structures/MessageHandler";

import type { Message } from "eris";
import {GuildChannel} from "eris";

class ChannelTypeReader extends TypeReader {
  constructor() {
    super({name: "Channel"});
  }

  async run (content: string, message: Message, options: object, command: Command, handler: MessageHandler) {
    if (!(message.channel instanceof GuildChannel)) throw new Error("channelTypeReader does only works in guild channel");
    if (content && content !== "") {
      if (!isNaN(+content)) {
        const channel = await handler.getChannel(message.channel.guild.id, content);
        if (channel) return channel
        else throw new Error("Invalid ID")
      } else {
        const match = content.match(Constants.regexes.channelMention);
        if (match) {
          const channel = await handler.getChannel(message.channel.guild.id, match[1]);
          if (channel) return channel
          else throw new Error("Invalid Mention")
        } else throw new Error("Invalid Mention")
      }
    } else throw new Error("No Input")
  }
}

export default ChannelTypeReader;
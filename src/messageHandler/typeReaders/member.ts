import TypeReader from '../structures/TypeReader';
import Constants from '../Constants';
import type {Message} from "eris";
import type Command from "../structures/Command";
import type MessageHandler from "../structures/MessageHandler";
import {GuildChannel} from "eris";

class MemberTypeReader extends TypeReader {
  constructor() {
    super({name: "Member"});
  }

  async run (content: string, message: Message, options: any, command: Command, handler: MessageHandler) {
    if (!(message.channel instanceof GuildChannel)) throw new Error("memberTypeReader does only works in guild channel");
    if (content && content !== "") {
      if (!isNaN(+content)) {
        const user = await handler.getMember(message.channel.guild.id, content);
        if (user) return user
        else throw new Error("Invalid ID")
      } else {
        const match = content.match(Constants.regexes.userMention);
        if (match) {
          const user = await handler.getMember(message.channel.guild.id, match[1]);
          if (user) return user
          else throw new Error("Invalid Mention")
        } else throw new Error("Invalid Mention")
      }
    } else throw new Error("No Input")
  }
}

export default MemberTypeReader;

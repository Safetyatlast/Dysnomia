import TypeReader from '../structures/TypeReader';
import Constants from '../Constants';
import type {Message} from "eris";
import type Command from "../structures/Command";
import type MessageHandler from "../structures/MessageHandler";
import {GuildChannel} from "eris";

class RoleTypeReader extends TypeReader {
  constructor() {
    super({name: "Role"});
  }

  async run (content: string, message: Message, options, command: Command, handler: MessageHandler) {
    if (!(message.channel instanceof GuildChannel)) throw new Error("memberTypeReader does only works in guild channel");
    if (content && content !== "") {
      if (!isNaN(+content)) {
        const role = await handler.getRole(message.channel.guild.id, content);
        if (role) return role
        else throw new Error("Invalid ID")
      } else {
        const match = content.match(Constants.regexes.roleMention);
        if (match) {
          const role = await handler.getRole(message.channel.guild.id, match[1]);
          if (role) return role
          else throw new Error("Invalid Mention");
        } else throw new Error("Invalid Mention");
      }
    } else throw new Error("No Input");
  }
}

export default RoleTypeReader;
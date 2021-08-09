import TypeReader from '../structures/TypeReader';
import Constants from '../Constants';
import type {Message} from "eris";
import type Command from "../structures/Command";
import type MessageHandler from "../structures/MessageHandler";

class UserTypeReader extends TypeReader {
  constructor() {
    super({name: "User"});
  }

  async run (content: string, message: Message, options, command: Command, handler: MessageHandler) {
    if (content && content !== "") {
      if (!isNaN(+content)) {
        const user = await handler.getUser(content);
        if (user) return user
        else throw new Error("Invalid ID")
      } else {
        const match = content.match(Constants.regexes.userMention);
        if (match) {
          const user = await handler.getUser(match[1]);
          if (user) return user
          else throw new Error("Invalid Mention");
        } else throw new Error("Invalid Mention");
      }
    } else throw new Error("No Input")
  }
}

export default UserTypeReader;
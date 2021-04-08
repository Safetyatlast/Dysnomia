const TypeReader = require('../structures/TypeReader');
const Constants = require('../Constants');

const memberTypeReader = new TypeReader({name: "Member"});

memberTypeReader.run = async (content, message, options, command, handler) => {
  if (content && content !== "") {
    const match = content.match(Constants.regexes.userMention);
    if (!isNaN(content)) {
      const user = await await handler.getMember(message.channel.guild.id, content);
      if (user) return user
      else throw new Error("Invalid ID")
    } else {
      const match = content.match(Constants.regexes.userMention);
      if (match) {
        const user = await handler.getMember(message.channel.guild.id, match[1]);
        if (user) return user
        else throw new Error("Invalid Mention")
      }
    }
    return match[1]
  } else throw new Error("No Input")
};

module.exports = memberTypeReader;
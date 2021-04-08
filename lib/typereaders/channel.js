const TypeReader = require('../structures/TypeReader');
const Constants = require('../Constants');

const channelTypeReader = new TypeReader({name: "Channel"});

channelTypeReader.run = async (content, message, options, command, handler) => {
  if (content && content !== "") {
    const match = content.match(Constants.regexes.channelMention);
    if (!isNaN(content)) {
      const channel = await handler.getChannel(message.channel.guild.id, content);
      if (channel) return channel
      else throw new Error("Invalid ID")
    } else {
      const match = content.match(Constants.regexes.channelMention);
      if (match) {
        const channel = await handler.getChannel(message.channel.guild.id, match[1]);
        if (channel) return channel
        else throw new Error("Invalid Mention")
      }
    }
    return match[1]
  } else throw new Error("No Input")
};

module.exports = channelTypeReader;
const TypeReader = require('../structures/TypeReader');
const Constants = require('../Constants');

const roleTypeReader = new TypeReader({name: "Role"});

roleTypeReader.run = async (content, message, command, handler) => {
  if (content && content !== "") {
    const match = content.match(Constants.regexes.roleMention);
    if (!isNaN(content)) {
      const role = handler.getRole(message.channel.guild.id, content);
      if (role) return role
      else throw new Error("Invalid ID")
    } else {
      const match = content.match(Constants.regexes.roleMention);
      if (match) {
        const role = await handler.getRole(message.channel.guild.id, match[1]);
        if (role) return role
        else throw new Error("Invalid Mention")
      }
    }
    return match[1]
  } else throw new Error("No Input")
};

module.exports = roleTypeReader;
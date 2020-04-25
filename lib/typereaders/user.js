const TypeReader = require('../structures/TypeReader');
const Constants = require('../Constants');

const userTypeReader = new TypeReader({name: "User"});

userTypeReader.run = async (content, message, command, handler) => {
  if (content && content !== "") {
    const match = content.match(Constants.regexes.userMention);
    if (!isNaN(content)) {
      const user = handler.getUser(content);
      if (user) return user
      else throw new Error("Invalid ID")
    } else {
      const match = content.match(Constants.regexes.userMention);
      if (match) {
        const user = await handler.getUser(match[1]);
        if (user) return user
        else throw new Error("Invalid Mention")
      }
    }
    return match[1]
  } else throw new Error("No Input")
};

module.exports = userTypeReader;
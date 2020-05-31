"use strict";

module.exports = {
  regexes: {
    argumentRegex: /\s+/g,
    userMention: /<@!?(\d+)>/,
    roleMention: /<@&(\d+)>/,
    channelMention: /<#(\d+)>/,
    customEmoji: /<a?:([a-zA-Z0-9_]+):([0-9]+)>/
  },
  typeReaders: {
    boolean: {
      true: ["true", "on", "enable", "yep", "ye", "yeah", "yes", "y", "t", "1"],
      false: ["false", "off", "disable", "nope", "na", "nah", "no", "n", "f", "0"]
    }
  }
};
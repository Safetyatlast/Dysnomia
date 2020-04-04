const TypeReader = require('../structures/TypeReader');

const stringTypeReader = new TypeReader({name: "String"});

stringTypeReader.run = async (content, message, command) => {
  if (content && content !== "") return content;
  else throw new Error("Empty String")
};

module.exports = stringTypeReader;
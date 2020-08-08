const TypeReader = require('../structures/TypeReader');
const Constants = require('../Constants');

const enumTypeReader = new TypeReader({name: "Enum"});

enumTypeReader.run = async (content, _, options) => {
  if (content && content !== "") {
    if (!options.caseSensitive) content = content.toLowerCase();
    if(options.values.includes(content)) return content;
    else throw new Error("Invalid Input");
  } else throw new Error("No Input");
};

module.exports = enumTypeReader;
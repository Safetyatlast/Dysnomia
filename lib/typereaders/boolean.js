const TypeReader = require('../structures/TypeReader');
const Constants = require('../Constants');

const booleanTypeReader = new TypeReader({name: "Boolean"});

booleanTypeReader.run = async content => {
  if (content && content !== "") {
    const lowerCase = content.toLowerCase();
    if (Constants.typeReaders.boolean.true.includes(lowerCase)) return true;
    else if (Constants.typeReaders.boolean.false.includes(lowerCase)) return false;
    throw new Error("Unknown Input");
  } else throw new Error("No Input");
};

module.exports = booleanTypeReader;
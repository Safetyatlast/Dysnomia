const TypeReader = require('../structures/TypeReader');

const numberTypeReader = new TypeReader({name: "Number"});

numberTypeReader.run = async content => {
  if (content && content !== "") {
    const number = Number(content);
    if (isNaN(number)) throw new Error("Not A Number")
    else return number;
  } else throw new Error("No Input");
};

module.exports = numberTypeReader;
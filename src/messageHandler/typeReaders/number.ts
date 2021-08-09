import TypeReader from '../structures/TypeReader';

class NumberTypeReader extends TypeReader {
  constructor() {
    super({name: "Number"});
  }

  async run (content: string) {
    if (content && content !== "") {
      const number = Number(content);
      if (isNaN(number)) throw new Error("Not A Number")
      else return number;
    } else throw new Error("No Input");
  }
}

export default NumberTypeReader;
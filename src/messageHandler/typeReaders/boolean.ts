import TypeReader from '../structures/TypeReader';
import Constants from '../Constants';

class BooleanTypeReader extends TypeReader {
  constructor() {
    super({name: "Boolean"});
  }

  async run (content: string) {
    if (content && content !== "") {
      const lowerCase = content.toLowerCase();
      if (Constants.typeReaders.boolean.true.includes(lowerCase)) return true;
      else if (Constants.typeReaders.boolean.false.includes(lowerCase)) return false;
      throw new Error("Unknown Input");
    } else throw new Error("No Input");
  }
}

export default BooleanTypeReader;

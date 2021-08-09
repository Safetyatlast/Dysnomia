import TypeReader from '../structures/TypeReader';

class StringTypeReader extends TypeReader {
  constructor() {
    super({name: "String"});
  }

  async run (content: string) {
    if (content && content !== "") return content;
    else throw new Error("Empty String")
  }
}

export default StringTypeReader;
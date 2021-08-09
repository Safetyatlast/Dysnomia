import TypeReader from '../structures/TypeReader';
import {Message} from "eris";

class EnumTypeReader extends TypeReader {
  constructor() {
    super({name: "Enum"});
  }

  async run(content: String, _: Message, options: any) {
    if (content && content !== "") {
      if (!options.caseSensitive) content = content.toLowerCase();
      if (options.values.includes(content)) return content;
      else throw new Error("Invalid Input");
    } else throw new Error("No Input");
  }
}

export default EnumTypeReader;
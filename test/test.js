const assert = require('assert');
const Handler = new (require('../lib/structures/Handler')) ({ prefix: '&' });
const Argument = require('../lib/structures/Argument');
const TypeReader = require('../lib/structures/TypeReader');
const Command = require('../lib/structures/Command');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

describe('Handler', function() {
  describe('#setGuildPrefix()', function() {
    Handler.setGuildPrefix('401134835818692608', '!');
    it('should add the prefix as a value and guildID as key to the guildPrefixes map', function() {
      assert.equal(Handler.guildPrefixes.get('401134835818692608'), '!');
    });
  });

  describe('#registerCommands()', function() {
    const Command = new (require('../lib/structures/Command')) ({names: ["prefix"]});
    Handler.registerCommands(Command);
    it('should add the command to the commands array', function() {
      assert.equal(Handler.commands.find(c => c.names.includes("prefix")), Command);
    });
  });

  describe('#registerPrecondition()', function() {
    const TestPrecondition = new (require('../lib/structures/Precondition')) ({name: 'TestPrecondition'});
    Handler.registerPreconditions([TestPrecondition]);
    it('should add the precondition to the preconditions map', function() {
      assert.deepStrictEqual(Handler.preconditions.get('TestPrecondition'), TestPrecondition);
    });
  });

  describe('#parseCommand()', function() {
    const Command = new (require('../lib/structures/Command')) ({names: ["ping pong", "ping", "pong"]});
    Handler.registerCommands(Command);
    it('should parse command with no arguments', function() {
      // Fake Message
      assert.deepStrictEqual(Handler.parseCommand({
        channel: {
          guild: {
            id: '482723843203399740'
          }
        },
        content: "&ping"
      }), { Command, Content: "" });
    });
    it('should parse command with arguments', function() {
      // Fake Message
      assert.deepStrictEqual(Handler.parseCommand({
        channel: {
          guild: {
            id: '482723843203399740'
          }
        },
        content: "&ping !"
      }), { Command, Content: "!" });
    });
    it('should parse command with second name', function() {
      // Fake Message
      assert.deepStrictEqual(Handler.parseCommand({
        channel: {
          guild: {
            id: '482723843203399740'
          }
        },
        content: "&pong !"
      }), { Command, Content: "!" });
    });
    it('should parse a command with sub command name and normal name', function() {
      // Fake Message
      assert.deepStrictEqual(Handler.parseCommand({
        channel: {
          guild: {
            id: '482723843203399740'
          }
        },
        content: "&ping pong !"
      }), { Command, Content: "!" });
    });
  });

  describe('#executePreconditions()', function() {
    const TruePrecondition = new (require('../lib/structures/Precondition')) ({name: 'TruePrecondition'});
    TruePrecondition.run = () => true;
    const FalsePrecondition = new (require('../lib/structures/Precondition')) ({name: 'FalsePrecondition'});
    FalsePrecondition.run = () => false;
    Handler.registerPreconditions([TruePrecondition, FalsePrecondition]);
    const CommandA = new (require('../lib/structures/Command')) ({names: ["a"], preconditions: ['TruePrecondition']});
    const CommandB = new (require('../lib/structures/Command')) ({names: ["b"], preconditions: ['FalsePrecondition']});
    const CommandC = new (require('../lib/structures/Command')) ({names: ["c"], preconditions: ['TruePrecondition', 'FalsePrecondition']});
    Handler.registerCommands([CommandA, CommandB, CommandC]);
    it('should return undefined when all Preconditions return true', async function() {
      assert.deepStrictEqual(await Handler.executePreconditions({}, CommandA), undefined);
    });
    it('should return the precondition error and precondition that returned false', async function() {
      assert.deepStrictEqual(await Handler.executePreconditions({}, CommandB), FalsePrecondition);
    });
    it('should return the precondition error and precondition that returned false when there are multiple preconditions', async function() {
      assert.deepStrictEqual(await Handler.executePreconditions({}, CommandB), FalsePrecondition);
    });
  });

  describe('#executeMiddleware()', function() {
    const MiddlewareA = new (require('../lib/structures/Precondition')) ({name: 'MiddlewareA'});
    MiddlewareA.run = (msg) => { msg.A = "A"; return msg };
    const MiddlewareB = new (require('../lib/structures/Precondition')) ({name: 'MiddlewareB'});
    MiddlewareB.run = (msg) => { msg.B = "B"; return msg };
    Handler.registerMiddleware([MiddlewareA, MiddlewareB]);
    const CommandD = new (require('../lib/structures/Command')) ({names: ["d"], middleware: ['MiddlewareA']});
    const CommandE = new (require('../lib/structures/Command')) ({names: ["c"], middleware: ['MiddlewareA', 'MiddlewareB']});
    Handler.registerCommands([CommandD, CommandE]);
    it('should return a modified message object', async function() {
      const fmsg = {};
      await Handler.executeMiddleware(fmsg, CommandD);
      assert.deepStrictEqual(fmsg, {A: "A"});
    });
    it('should return a message object with multiple changes when multiple middleware are present', async function() {
      const fmsg = {};
      await Handler.executeMiddleware(fmsg, CommandE);
      assert.deepStrictEqual(fmsg, { A: "A", B: "B" });
    });
  });

  describe('#parseArguments()', function() {
    const TypeReaderA = new TypeReader({ name: "string" });
    TypeReaderA.run = async (c) => {
      if (typeof c === 'string') return c;
      else throw new Error("Invalid String");
    };
    Handler.registerTypeReaders([TypeReaderA]);
    const CommandF = new Command({names: ["f"]});
    const CommandG = new Command({names: ["g"], arguments: [new Argument({ name: "argument 1", typeReader: "string" })]});
    Handler.registerCommands([CommandF, CommandG]);

    it('should return no arguments when no arguments specified', async function() {
      const fmsg = {};
      const r = await Handler.parseArguments("hi", fmsg, CommandF);
      assert.deepStrictEqual(r, {});
    });
    it('should return an object filled arguments when arguments specified', async function() {
      const fmsg = {};
      const r = await Handler.parseArguments("hi", fmsg, CommandG);
      assert.deepStrictEqual(r, {"argument 1": "hi"});
    });
  });
});

describe('Command', function() {
  const Command = new (require('../lib/structures/Command')) ({names: ["cooldown"], cooldown: 250});
  Handler.registerCommands(Command);
  describe('#updateCooldown()', function() {
    it('should add user to the cooldowns map', function() {
      Command.updateCooldown("158594933274574849");
      assert.equal(Command.cooldowns.has("158594933274574849"), true);
    });
  });
  describe('#checkCooldown()', function() {
    it('should return false when user is not on a cooldown', function() {
      assert.equal(Command.checkCooldown("279866000533618689"), false);
    });
    it('should return true when user is on a cooldown', function() {
      Command.updateCooldown("279866000533618689");
      assert.equal(Command.checkCooldown("279866000533618689"), true);
    });
    it('should remove users cooldown and return false', async function() {
      await sleep(500);
      assert.equal(Command.checkCooldown("279866000533618689"), false);
    });
  });
});
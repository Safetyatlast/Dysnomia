const assert = require('assert');
const { Precondition, TypeReader, Command, Argument, Middleware, Handler } = require('../lib/index').MessageHandler;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

describe('MessageHandler', function() {
  describe('Prefixes', function () {
    const handler = new Handler({}, {prefix: '&', cooldown: 250});
    describe('#registerGuildPrefix()', function () {
      handler.registerGuildPrefix('401134835818692608', '!');
      it('should add the prefix as a value and guildID as key to the guildPrefixes map', function () {
        assert.equal(handler.guildPrefixes.get('401134835818692608'), '!');
      });
    });

    describe('#deregisterGuildPrefix()', function () {
      handler.registerGuildPrefix('860803400421474315', '!');
      handler.deregisterGuildPrefix('860803400421474315');
      it('should remove the guild\'s prefix from the prefix map', function () {
        assert.equal(handler.guildPrefixes.has('860803400421474315'), false);
      });
    });
  });

  describe('#registerPrecondition()', function () {
    const handler = new Handler({}, {prefix: '&', cooldown: 250});
    const TestPrecondition = new Precondition({name: 'TestPrecondition'});
    handler.registerPreconditions([TestPrecondition]);
    it('should add the precondition to the preconditions map', function () {
      assert.deepStrictEqual(handler.preconditions.get('TestPrecondition'), TestPrecondition);
    });
  });

  describe('TypeReaders', function () {
    describe('#registerTypeReaders()', function () {
      const handler = new Handler({}, {prefix: '&', cooldown: 250});
      let TestTypeReader = new TypeReader({name: 'TestTypeReader'});
      it('should add the typeReader to the typeReader map', function () {
        handler.registerTypeReaders([TestTypeReader]);
        assert.deepStrictEqual(handler.typeReaders.get('TestTypeReader'), TestTypeReader);
      });
    });
  });
  describe('Commands', function() {
    describe('#registerCommands()', function() {
      it('should add the command to the commands array', function() {
        const handler = new Handler ({}, { prefix: '&', cooldown: 250 });
        const command = new Command ({names: ["prefix"]});
        handler.registerCommands(command);
        assert.equal(handler.commands.find(c => c.names.includes("prefix")), command);
      });
      it('should throw an error if command has two arguments with the same name', async function () {
        const handler = new Handler ({}, { prefix: '&', cooldown: 250 });
        await handler.loadDefaultTypeReaders();
        const command = new Command ({
          names: ["test"],
          arguments: [
            new Argument({ name: "argument1", typeReader: "String" }),
            new Argument({ name: "argument1", typeReader: "String" })
          ]
        });
        assert.throws(() => handler.registerCommands(command), Error, `Command argument1 already has a duplicate argument name`);
      });
    });

    describe('#parseCommand()', function() {
      const handler = new Handler ({}, { prefix: '&', cooldown: 250 });
      const command = new Command ({names: ["ping pong", "ping", "pong"]});
      handler.registerCommands(command);
      it('should parse command with no arguments', function() {
        // Fake Message
        assert.deepStrictEqual(handler.parseCommand({
          channel: {
            guild: {
              id: '482723843203399740'
            }
          },
          content: "&ping"
        }), { Command: command, Content: "", Prefix: "&" });
      });
      it('should parse command with arguments', function() {
        // Fake Message
        assert.deepStrictEqual(handler.parseCommand({
          channel: {
            guild: {
              id: '482723843203399740'
            }
          },
          content: "&ping !"
        }), { Command: command, Content: "!", Prefix: "&" });
      });
      it('should parse command with second name', function() {
        // Fake Message
        assert.deepStrictEqual(handler.parseCommand({
          channel: {
            guild: {
              id: '482723843203399740'
            }
          },
          content: "&pong !"
        }), { Command: command, Content: "!", Prefix: "&" });
      });
      it('should parse a command with sub command name and normal name', function() {
        // Fake Message
        assert.deepStrictEqual(handler.parseCommand({
          channel: {
            guild: {
              id: '482723843203399740'
            }
          },
          content: "&ping pong !"
        }), { Command: command, Content: "!", Prefix: "&" });
      });
    });
  });

  describe('#executePreconditions()', function() {
    const handler = new Handler ({}, { prefix: '&', cooldown: 250 });
    const TruePrecondition = new Precondition({name: 'TruePrecondition'});
    TruePrecondition.run = () => true;
    const FalsePrecondition = new Precondition({name: 'FalsePrecondition'});
    FalsePrecondition.run = () => false;
    handler.registerPreconditions([TruePrecondition, FalsePrecondition]);
    const CommandA = new Command ({names: ["a"], preconditions: ['TruePrecondition']});
    const CommandB = new Command ({names: ["b"], preconditions: ['FalsePrecondition']});
    const CommandC = new Command ({names: ["c"], preconditions: ['TruePrecondition', 'FalsePrecondition']});
    handler.registerCommands([CommandA, CommandB, CommandC]);
    it('should return undefined when all Preconditions return true', async function() {
      assert.deepStrictEqual(await handler.executePreconditions({}, CommandA), undefined);
    });
    it('should return the precondition error and precondition that returned false', async function() {
      assert.deepStrictEqual(await handler.executePreconditions({}, CommandB), FalsePrecondition);
    });
    it('should return the precondition error and precondition that returned false when there are multiple preconditions', async function() {
      assert.deepStrictEqual(await handler.executePreconditions({}, CommandB), FalsePrecondition);
    });
  });

  describe('#executeMiddleware()', function() {
    const handler = new Handler ({}, { prefix: '&', cooldown: 250 });
    const MiddlewareA = new Middleware ({name: 'MiddlewareA'});
    MiddlewareA.run = (msg) => { msg.A = "A"; return msg };
    const MiddlewareB = new Middleware ({name: 'MiddlewareB'});
    MiddlewareB.run = (msg) => { msg.B = "B"; return msg };
    handler.registerMiddleware([MiddlewareA, MiddlewareB]);
    const CommandD = new Command ({names: ["d"], middleware: ['MiddlewareA']});
    const CommandE = new Command ({names: ["e"], middleware: ['MiddlewareA', 'MiddlewareB']});
    handler.registerCommands([CommandD, CommandE]);
    it('should return a modified message object', async function() {
      const fmsg = {};
      await handler.executeMiddleware(fmsg, CommandD);
      assert.deepStrictEqual(fmsg, {A: "A"});
    });
    it('should return a message object with multiple changes when multiple middleware are present', async function() {
      const fmsg = {};
      await handler.executeMiddleware(fmsg, CommandE);
      assert.deepStrictEqual(fmsg, { A: "A", B: "B" });
    });
  });

  describe('#parseArguments()', function() {
    const handler = new Handler ({}, { prefix: '&', cooldown: 250 });
    const TypeReaderA = new TypeReader({ name: "string" });
    TypeReaderA.run = async (c) => {
      if (typeof c === 'string') return c;
      else throw new Error("Invalid String");
    };
    handler.registerTypeReaders([TypeReaderA]);
    const CommandF = new Command({names: ["f"]});
    const CommandG = new Command({names: ["g"], arguments: [new Argument({ name: "argument 1", typeReader: "string" })]});
    handler.registerCommands([CommandF, CommandG]);

    it('should return no arguments when no arguments specified', async function() {
      const fmsg = {};
      const r = await handler.parseArguments("hi", fmsg, CommandF);
      assert.deepStrictEqual(r, {});
    });
    it('should return an object filled arguments when arguments specified', async function() {
      const fmsg = {};
      const r = await handler.parseArguments("hi", fmsg, CommandG);
      assert.deepStrictEqual(r, {"argument 1": "hi"});
    });
  });

  describe('Cooldown', function () {
    const handler = new Handler ({}, { prefix: '&', cooldown: 250 });
    describe('#updateCooldown()', function() {
      it('should add user to the cooldowns map', function() {
        handler.updateCooldown("158594933274574849");
        assert.equal(handler.cooldowns.has("158594933274574849"), true);
      });
    });
    describe('#checkCooldown()', function() {
      it('should return false when user is not on a cooldown', function() {
        assert.equal(handler.checkCooldown("279866000533618689"), false);
      });
      it('should return true when user is on a cooldown', function() {
        handler.updateCooldown("279866000533618689");
        assert.equal(handler.checkCooldown("279866000533618689"), true);
      });
      it('should remove users cooldown and return false', async function() {
        await sleep(500);
        assert.equal(handler.checkCooldown("279866000533618689"), false);
      });
    });
  })
});
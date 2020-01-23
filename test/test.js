const assert = require('assert');

describe('Handler', function() {
  const Handler = new (require('../lib/structures/Handler')) ({ prefix: '&' });
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
});
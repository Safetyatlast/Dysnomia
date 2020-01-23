const assert = require('assert');
const Handler = new (require('../lib/structures/Handler')) ({ prefix: '&' });

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

describe('Command', function() {
  const Command = new (require('../lib/structures/Command')) ({names: ["cooldown"], cooldown: 10000});
  Handler.registerCommands(Command);
  describe('#updateCooldown', function() {
    it('should add user to the cooldowns map', function() {
      Command.updateCooldown("158594933274574849");
      assert.equal(Command.cooldowns.has("158594933274574849"), true);
    });
  });
  describe('#checkCooldown', function() {
    it('should return false when user is not on a cooldown', function() {
      assert.equal(Command.checkCooldown("279866000533618689"), false);
    });
    it('should return true when user is on a cooldown', function() {
      Command.updateCooldown("279866000533618689");
      assert.equal(Command.checkCooldown("279866000533618689"), true);
    });
  });
});
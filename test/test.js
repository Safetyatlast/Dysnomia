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
});
/**
 * CommandError Enum
 * @typedef {Object} CommandError
 * @property {Symbol} UnknownCommand
 * @property {Symbol} Cooldown
 * @property {Symbol} MissingPermissions
 * @property {Symbol} Precondition
 * @property {Symbol} Argument
 */
const CommandError = {
  UnknownCommand: Symbol("CommandError.UnknownCommand"),
  Cooldown: Symbol("CommandError.Cooldown"),
  MissingPermissions: Symbol("CommandError.MissingPermissions"),
  Precondition: Symbol("CommandError.Precondition"),
  Argument: Symbol("CommandError.Argument")
};

module.exports = CommandError;
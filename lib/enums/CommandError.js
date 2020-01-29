/**
 * CommandError Enum
 * @typedef {Enumerator} CommandError
 * @property {Symbol} Prefix
 * @property {Symbol} UnknownCommand
 * @property {Symbol} Cooldown
 * @property {Symbol} MissingPermissions
 * @property {Symbol} Precondition
 * @property {Symbol} Argument
 * @property {Symbol} Exception
 */
const CommandError = {
  Prefix: Symbol("CommandError.Prefix"),
  UnknownCommand: Symbol("CommandError.UnknownCommand"),
  Cooldown: Symbol("CommandError.Cooldown"),
  MissingPermissions: Symbol("CommandError.MissingPermissions"),
  Precondition: Symbol("CommandError.Precondition"),
  Argument: Symbol("CommandError.Argument"),
  Exception: Symbol("CommandError.Exception")
};

module.exports = CommandError;
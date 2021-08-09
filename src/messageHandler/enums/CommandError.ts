"use strict";
/**
 * CommandError Enum
 * @property {string} Prefix
 * @property {string} UnknownCommand
 * @property {string} Cooldown
 * @property {string} MissingPermissions
 * @property {string} Precondition
 * @property {string} Argument
 * @property {string} Exception
 */
const enum CommandError {
  Prefix ="CommandError.Prefix",
  UnknownCommand = "CommandError.UnknownCommand",
  Cooldown = "CommandError.Cooldown",
  MissingPermissions = "CommandError.MissingPermissions",
  Precondition = "CommandError.Precondition",
  Argument = "CommandError.Argument",
  Exception = "CommandError.Exception"
}

export default CommandError;
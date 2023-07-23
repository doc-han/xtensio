/**
 * ----------------------------------------------------------------------------------------
 * Below are mocks and overrides for an environment used for executing files in isolation. |
 * ----------------------------------------------------------------------------------------
 */
import { JSDOM } from "jsdom";
import React from "react";

// Mock Browser DOM
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
// @ts-ignore
global.window = dom.window;
global.document = dom.window.document;

// Mock Navigator
// @ts-ignore
global.navigator = {
  userAgent: "Chrome something"
}

// Add react to the environment
global.React = React;

// Mock Console object
global.console = {
  ...console,
  //   log() {},
  error() {},
  debug() {},
};

// Mock Imports
const originalRequire = require("module").prototype.require;
require("module").prototype.require = function (id: string) {
  // Mock css imports
  if (/\.(css|scss|sass)$/.test(id)) return {};
  return originalRequire.call(this, id);
};

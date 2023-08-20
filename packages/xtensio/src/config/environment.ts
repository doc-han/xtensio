/**
 * ----------------------------------------------------------------------------------------
 * Below are mocks and overrides for an environment used for executing files in isolation. |
 * ----------------------------------------------------------------------------------------
 */
import { JSDOM } from "jsdom"
import React from "react"
// @ts-ignore
import chrome from "sinon-chrome/extensions"

// Mock Browser DOM
const dom = new JSDOM(
  "<!DOCTYPE html><html><head></head><body></body></html>",
  { url: "http://localhost/" }
)
// @ts-ignore
global.window = dom.window
global.document = dom.window.document
global.navigator = dom.window.navigator
global.MutationObserver = dom.window.MutationObserver

// Add react to the environment
global.React = React
global.chrome = chrome

// Mock Console object
global.console = {
  ...console,
  log() {},
  error() {},
  debug() {}
}

// Mock Imports
const originalRequire = require("module").prototype.require
require("module").prototype.require = function (id: string) {
  // Mock css imports
  if (/\.(css|scss|sass)$/.test(id)) return {}
  else if (/\.(png|jpe?g|gif|svg|pdf)$/i.test(id)) return ""
  return originalRequire.call(this, id)
}

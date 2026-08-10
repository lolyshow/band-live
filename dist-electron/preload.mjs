"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  test: () => "Electron preload is working"
});

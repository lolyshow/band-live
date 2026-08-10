import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('api', {
  test: () => 'Electron preload is working',
})
import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
)

const VITE_DEV_SERVER_URL =
  process.env.VITE_DEV_SERVER_URL

const RENDERER_DIST = path.join(
  __dirname,
  '../dist'
)

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,

    webPreferences: {
      preload: path.join(
        __dirname,
        'preload.mjs'
      ),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(
      path.join(
        RENDERER_DIST,
        'index.html'
      )
    )
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
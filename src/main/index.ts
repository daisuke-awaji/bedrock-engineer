import { app, shell, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../build/icon.ico?asset'
import api from './api'
import { handleFileOpen } from '../preload/file'
import Store from 'electron-store'
import getRandomPort from '../preload/lib/random-port'
import { store } from '../preload/store'
import fs from 'fs'
Store.initRenderer()

async function createWindow(): Promise<void> {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    minWidth: 640,
    minHeight: 416,
    width: 1800,
    height: 1340,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  // コンテキストメニューの作成
  const contextMenu = new Menu()
  contextMenu.append(
    new MenuItem({
      label: 'コピー',
      role: 'copy'
    })
  )
  contextMenu.append(
    new MenuItem({
      label: 'ペースト',
      role: 'paste'
    })
  )

  // コンテキストメニューイベントの処理
  mainWindow.webContents.on('context-menu', () => {
    // メニューを表示
    contextMenu.popup()
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const port = await getRandomPort()
  store.set('apiEndpoint', `http://localhost:${port}`)

  api.listen(port, () => {
    console.log({
      API_ENDPOINT: 'http://localhost' + port
    })
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({
      mode: 'right'
    })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('open-file', () =>
    handleFileOpen({
      title: 'openFile...',
      properties: ['openFile']
    })
  )
  ipcMain.handle('open-directory', () =>
    handleFileOpen({
      title: 'openDirectory',
      properties: ['openDirectory']
    })
  )

  // ローカル画像読み込みハンドラー
  ipcMain.handle('get-local-image', async (_, path: string) => {
    try {
      const data = await fs.promises.readFile(path)
      const ext = path.split('.').pop()?.toLowerCase() || 'png'
      const base64 = data.toString('base64')
      return `data:image/${ext};base64,${base64}`
    } catch (error) {
      console.error('Failed to read image:', error)
      throw error
    }
  })

  // Tool として実行される Web fetch ハンドラー
  ipcMain.handle('fetch-website', async (_event, url: string, options?: any) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      const contentType = response.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        const json = await response.json()
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers),
          data: json
        }
      } else {
        const text = await response.text()
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers),
          data: text
        }
      }
    } catch (error) {
      console.error('Error fetching website:', error)
      throw error
    }
  })
  createWindow()

  // Electron Store save config.json in this directory
  console.log({ userDataDir: app.getPath('userData') })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
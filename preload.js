const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  loadTranslations: (lang) => ipcRenderer.invoke('load-translations', lang),
  shell: {openExternal: (url) => shell.openExternal(url)},
  onAppVersion: (callback) => {
    console.log('Callback registrado para versão do app'); // LOG de conferência
    ipcRenderer.on('app-version', (event, version) => callback(version));
},
  buscarNPCs: (filtros) => ipcRenderer.invoke('buscar-npcs', filtros),
  editarNPC: (npc) => ipcRenderer.invoke('editar-npc', npc),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('cl-window'),
  connectDB: (config) => ipcRenderer.send('connect-db', config),
  send: (channel, data) => ipcRenderer.send(channel, data),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
    // Comunicação para o Realmlist
    getRealmlist: () => ipcRenderer.invoke('get-realmlist'),  // Buscar lista
    createRealm: () => ipcRenderer.invoke('create-realm'),
    updateRealm: (realm) => ipcRenderer.invoke('update-realm', realm),  // Atualizar realm
  
    send: (channel, data) => ipcRenderer.send(channel, data),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  
    on: (channel, func) =>
      ipcRenderer.on(channel, (event, ...args) => func(...args))
});
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const http = require('https');

// Define a versão atual
const appVersion = '1.0.0';
const currentVersion = 1; // Versão para o verificador de atualização
const updateFilePath = path.join(app.getPath('userData'), 'update.txt');


// Dynamic import do 'electron-store'
let store;

(async () => {
  try {
    const module = await import('electron-store');
    const Store = module.default;
    store = new Store();
    console.log('Instância do electron-store criada com sucesso.');
  } catch (error) {
    console.error('Erro ao carregar electron-store:', error);
  }
})();

const { connectToDB, checkEntry, createNPC, searchNPCs, updateNPC, updateNPCModel } = require('./db');
let mainWindow;

//Renderiza a Janela
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden', // 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 
      enableRemoteModule: false,
      nodeIntegration: true,
      contextIsolation: true
    },
  });

  mainWindow.loadFile('index.html');

    // Enviar a versão assim que o conteúdo terminar de carregar
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('Enviando versão:', appVersion); // LOG para conferir
      mainWindow.webContents.send('app-version', appVersion);
  });
  // Função para baixar o arquivo de versão
  async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
  
      http.get(url, (response) => {
        if (response.statusCode !== 200) {
          // Se a resposta não for 200, rejeita a promise com uma mensagem clara
          reject(`Falha ao obter '${url}' (${response.statusCode})`);
          return; // Saia da função para evitar que o código abaixo execute
        }
  
        response.pipe(file);
  
        // Escuta o evento 'finish' do arquivo
        file.on('finish', () => {
          file.close(() => resolve()); // Fecha o arquivo e resolve a promise
        });
  
        // Escuta erros no fluxo de escrita
        file.on('error', (err) => {
          fs.unlink(dest, () => reject(err.message)); // Deleta o arquivo se ocorrer erro e rejeita a promise
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => reject(err.message)); // Deleta o arquivo se ocorrer erro e rejeita a promise
      });
    });
  }
// Função para comparar versões
function compareVersions(remoteVersion, localVersion) {
  return remoteVersion > localVersion;
}

// Handler para verificar a versão
ipcMain.handle('verificar-atualizacao', async () => {
  const url = 'https://raw.githubusercontent.com/AzerothLegends/AzerothForge/refs/heads/main/assets/js/update.txt'; // URL do arquivo de versão
  console.log('Buscando a versão do update.txt em:', url);

  try {
    // Faz o download do arquivo de versão
    await downloadFile(url, updateFilePath);
    const remoteVersion = fs.readFileSync(updateFilePath, 'utf-8').trim(); // Lê a versão remota

    console.log('Versão obtida do update.txt:', remoteVersion); // Log para depuração

    // Compara as versões
    if (compareVersions(remoteVersion, currentVersion)) {
      console.log('Nova atualização disponível!'); // Log se houver atualização
      return { updateAvailable: true, newVersion: remoteVersion }; // Retorna informação sobre atualização
    } else {
      console.log('Nenhuma atualização disponível.'); // Log se não houver atualização
      return { updateAvailable: false }; // Retorna informação de que não há atualização
    }
  } catch (error) {
    console.error('Erro ao verificar atualização:', error);
    throw error; // Propaga o erro para o renderizador
  }
});

    ipcMain.on('maximize-window', () => {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    });
    ipcMain.on('cl-window', () => {
      mainWindow.close();
    });
    ipcMain.on('minimize-window', () => {
      mainWindow.minimize();
    });
    // Impede redimensionamento manual
    mainWindow.on('resize', () => {
      const { x, y } = mainWindow.getBounds();
      mainWindow.setBounds({ x, y, width: 1280, height: 720 });
    });
  console.log('Janela carregada com sucesso!');
});

ipcMain.on('connect-db', async (event, config) => {
  console.log('Evento "connect-db" recebido com as credenciais:', config);

  try {
    const connected = await connectToDB(config);
    if (connected) {
      console.log('Conectado ao banco de dados com sucesso.');
      store.set('credentials', config);
      event.reply('db-connected');
    } else {
      console.error('123Erro ao conectar ao banco de dados.');
      event.reply('db-connected-false');
    }
  } catch (error) {
    console.error('Erro durante a conexão:', error);
  }
});

ipcMain.handle('get-cached-credentials', () => {
  try {
    const credentials = store.get('credentials');
    console.log('Credenciais obtidas do cache:', credentials);
    return credentials;
  } catch (error) {
    console.error('Erro ao obter credenciais cacheadas:', error);
    return null;
  }
});

ipcMain.handle('check-entry', async (event, entry) => {
  try {
    console.log('Verificando entry:', entry);
    return await checkEntry(entry);
  } catch (error) {
    console.error('Erro ao verificar entry:', error);
    return false;
  }
});

ipcMain.on('create-npc', async (event, npcData) => {
  try {
    await createNPC(npcData);
    console.log('NPC e modelo criados com sucesso!');
  } catch (error) {
    console.error('Erro ao criar NPC ou modelo:', error.message);
  }
});

ipcMain.handle('buscar-npcs', async (event, filtros) => {
  try {
    const result = await searchNPCs(filtros);
    console.log('NPCs encontrados:', result); // Para confirmar se a consulta está sendo feita
    return result;
  } catch (error) {
    console.error('Erro ao buscar NPCs:', error);
    return [];
  }
});

ipcMain.handle('editar-npc', async (event, npc) => {
  try {
    await updateNPC(npc);
    console.log('NPC atualizado:', npc);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar NPC:', error);
    return false;
  }
});

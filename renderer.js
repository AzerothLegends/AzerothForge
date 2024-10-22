const connectBtn = document.getElementById('connect-btn');
const connectionForm = document.getElementById('connection-form');
const maincontainer = document.getElementById('main-container');
const entryInput = document.getElementById('entry');
const UpdateMessage = document.getElementById('update-message')
const entryStatus = document.getElementById('entry-status');
const createNpcBtn = document.getElementById('create-npc-btn');
const buscarNpcBtn = document.getElementById('buscar-npc-btn');
const successMessage = document.getElementById('success-message');
const successEditNpcMessage = document.getElementById('success-edit-npc-message');
const dbErrorMessage = document.getElementById('db-error-message');


// Função para carregar credenciais do cache
async function carregarCredenciais() {
  console.log('Carregando credenciais do cache...');
  const cachedCredentials = await window.electron.invoke('get-cached-credentials');
  if (cachedCredentials) {
    console.log('Credenciais encontradas:', cachedCredentials);
    document.getElementById('host').value = cachedCredentials.host;
    document.getElementById('username').value = cachedCredentials.username;
    document.getElementById('password').value = cachedCredentials.password;
    document.getElementById('database').value = cachedCredentials.database;
  } else {
    console.log('Nenhuma credencial encontrada no cache.');
  }
}

// Evento onload para verificar atualizações e carregar credenciais
window.onload = async () => {
  await Promise.all([carregarCredenciais()]);
  const updateInfo = await window.electron.invoke('verificar-atualizacao');
  
  if (updateInfo.updateAvailable) {
    // Exibe a mensagem de atualização
    document.getElementById('update-message').innerText = `Nova atualização disponível`;
    UpdateMessage.classList.remove('hidden');
  }
};

// Conectar ao banco de dados
connectBtn.addEventListener('click', () => {
  const host = document.getElementById('host').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const database = document.getElementById('database').value;

  console.log('Enviando credenciais para conexão...', { host, username, password, database });
  window.electron.send('connect-db', { host, username, password, database });
});

// Exibir o formulário de NPC após conexão bem-sucedida e ocultar o formulário de conexão
window.electron.on('db-connected', () => {
  console.log('Conexão ao banco de dados bem-sucedida!');
  connectionForm.classList.add('hidden');  // Oculta os inputs de conexão
  maincontainer.classList.remove('hidden');  // Exibe os inputs de NPC
  sidebar.classList.remove('hidden');
  disconnectButton.classList.remove('hidden');
});

window.electron.on('db-connected-false', () => {
  dbErrorMessage.style.display = 'block';
  dbErrorMessage.style.opacity = '1';
  dbErrorMessage.classList.add('bg-red');

  setTimeout(() => {
    dbErrorMessage.style.opacity = '0';
    setTimeout(() => (dbErrorMessage.style.display = 'none'), 500);
  }, 3000);
});


// Verificar se o "entry" já está em uso
entryInput.addEventListener('input', async (e) => {
  const entry = e.target.value;
  console.log('Verificando se o entry já está em uso:', entry);

  const exists = await window.electron.invoke('check-entry', entry);
  if (exists) {
    entryStatus.textContent = 'Entry já em uso!';
    entryStatus.style.color = 'red';
    createNpcBtn.disabled = true;
  } else {
    entryStatus.textContent = 'Entry disponível!';
    entryStatus.style.color = 'LawnGreen';
    createNpcBtn.disabled = false;
  }
});

// Enviar dados do NPC para criação
createNpcBtn.addEventListener('click', () => {
  const npcData = {
    entry: entryInput.value,
    name: document.getElementById('name').value,
    subname: document.getElementById('subname').value,
    faction: document.getElementById('faction').value,
    minlevel: document.getElementById('minlevel').value,
    maxlevel: document.getElementById('maxlevel').value,
    npcflag: document.getElementById('npcflag').value,
    VerifiedBuild: 12340,
    modelData: {
      CreatureID: entryInput.value,
      Idx: 0,
      CreatureDisplayID: document.getElementById('creature-display-id').value,
      DisplayScale: document.getElementById('display-scale').value || 1,
      Probability: document.getElementById('probability').value || 1,
      VerifiedBuild: 12340
    }
  };

  console.log('Enviando dados do NPC para criação:', npcData);
  window.electron.send('create-npc', npcData);
  showSuccessMessage();
});

// Exibir uma mensagem de sucesso por 3 segundos
function showSuccessMessage() {
  successMessage.style.display = 'block';
  successMessage.style.opacity = '1';

  setTimeout(() => {
    successMessage.style.opacity = '0';
    setTimeout(() => (successMessage.style.display = 'none'), 500);
  }, 3000);
}
// Exibir uma mensagem de sucesso por 3 segundos
function showsuccessEditNpcMessage() {
  successEditNpcMessage.style.display = 'block';
  successEditNpcMessage.style.opacity = '1';

  setTimeout(() => {
    successEditNpcMessage.style.opacity = '0';
    setTimeout(() => (successEditNpcMessage.style.display = 'none'), 500);
  }, 3000);
}

// Menu DropDown
document.addEventListener("DOMContentLoaded", function() {
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener("click", function(e) {
      e.preventDefault(); // Impede a ação padrão do link
      this.classList.toggle("active"); // Alterna a classe 'active' no link
      const dropdown = this.nextElementSibling; // Seleciona o próximo elemento (ul.dropdown)
      if (dropdown.style.display === "block") {
        dropdown.style.display = "none"; // Esconde o dropdown
      } else {
        dropdown.style.display = "block"; // Exibe o dropdown
      }
    });
  });
});
//Busca de NPC
document.getElementById('buscar-npc-btn').addEventListener('click', async () => {
  const entry = document.getElementById('entry-input').value;
  const name = document.getElementById('name-input').value;
  const subname = document.getElementById('subname-input').value;
  try {
    const npcs = await window.electron.buscarNPCs({ entry, name, subname });
    mostrarResultados(npcs);
  } catch (error) {
    console.error('Erro ao buscar NPCs:', error);
  }
});

function mostrarResultados(npcs) {
  const resultadosDiv = document.getElementById('resultados');
  resultadosDiv.innerHTML = '';

  npcs.forEach(npc => {
    const npcDiv = document.createElement('tr');
    npcDiv.innerHTML = `<td>${npc.entry}</td><td>${npc.name}</td><td>${npc.subname}</td>`;
    npcDiv.addEventListener('click', () => abrirModal(npc));

    resultadosDiv.appendChild(npcDiv);
  });
}

function abrirModal(npc) {
  document.getElementById('npc-entry').value = npc.entry;
  document.getElementById('npc-name').value = npc.name;
  document.getElementById('npc-subname').value = npc.subname;
  document.getElementById('npc-minlevel').value = npc.minlevel;
  document.getElementById('npc-maxlevel').value = npc.maxlevel;
  document.getElementById('npc-faction').value = npc.faction;
  document.getElementById('npc-npcflag').value = npc.npcflag;

  const SearchentryInput = npc.entry;
  document.getElementById('npc-CreatureID').value = SearchentryInput;
  document.getElementById('npc-CreatureDisplayID').value = npc.CreatureDisplayID;
  document.getElementById('npc-DisplayScale').value = npc.DisplayScale;
  document.getElementById('npc-Probability').value = npc.Probability;

  const modal = document.getElementById('modal-editar');
  modal.classList.add('active');
}

document.getElementById('fechar-modal-btn').addEventListener('click', () => {
  document.getElementById('modal-editar').classList.remove('active');
});

document.getElementById('salvar-edicao-btn').addEventListener('click', async () => {
  const entry = document.getElementById('npc-entry').value;
  const name = document.getElementById('npc-name').value;
  const subname = document.getElementById('npc-subname').value;
  const minlevel = document.getElementById('npc-minlevel').value;
  const maxlevel = document.getElementById('npc-maxlevel').value;
  const faction = document.getElementById('npc-faction').value;
  const npcflag = document.getElementById('npc-npcflag').value;
  const CreatureDisplayID = document.getElementById('npc-CreatureDisplayID').value;
  const DisplayScale = document.getElementById('npc-DisplayScale').value;
  const Probability = document.getElementById('npc-Probability').value;
  const CreatureID = document.getElementById('npc-entry').value;
  try {
    await window.electron.editarNPC({ entry, name, subname, minlevel, maxlevel, faction, npcflag, CreatureDisplayID, DisplayScale, Probability, CreatureID});
    
    document.getElementById('modal-editar').classList.remove('active');
  } catch (error) {
    console.error('Erro ao editar NPC:', error);
    alert('Erro ao atualizar NPC.');
  }
});
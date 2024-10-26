// Chamados de sessões para o dropdown do sidebar

//Home
const homesessiondropdown = document.getElementById('home-session-dropdown');
const homesession = document.getElementById('home-session');
homesessiondropdown.addEventListener('click', () => {
  createnpcsession.classList.add('hidden'); 
  buscarnpcsession.classList.add('hidden');
  editarRealm.classList.add('hidden');
  homesession.classList.remove('hidden'); 
});
//RealmList
const realmlistsessiondropdown = document.getElementById('realmlist-session-dropdown');
const editarRealm = document.getElementById('editar-realm-session');
realmlistsessiondropdown.addEventListener('click', async () => {
  editarRealm.classList.remove('hidden'); // Sessão
  homesession.classList.add('hidden'); 
  createnpcsession.classList.add('hidden'); 
  buscarnpcsession.classList.add('hidden');

  const realms = await window.electron.getRealmlist();
  preencherTabela(realms);
});
//Criar NPC
const createnpcdropdown = document.getElementById('create-npc-dropdown');
const createnpcsession = document.getElementById('create-npc-session');
createnpcdropdown.addEventListener('click', () => {
    editarRealm.classList.add('hidden'); // Sessão
    homesession.classList.add('hidden'); 
    buscarnpcsession.classList.add('hidden');
    createnpcsession.classList.remove('hidden'); 
  
  });
//Buscar NPC
const buscarnpcdropdown = document.getElementById('buscar-npc-dropdown');
const buscarnpcsession = document.getElementById('buscar-npc-session');
buscarnpcdropdown.addEventListener('click', () => {
    editarRealm.classList.add('hidden'); // Sessão
    homesession.classList.add('hidden'); 
    createnpcsession.classList.add('hidden'); 
    buscarnpcsession.classList.remove('hidden');
  });
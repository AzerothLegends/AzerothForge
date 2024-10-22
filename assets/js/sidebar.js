// Chamados de sessões para o dropdown do sidebar

//Home
const homesessiondropdown = document.getElementById('home-session-dropdown');
const homesession = document.getElementById('home-session');
homesessiondropdown.addEventListener('click', () => {
  createnpcsession.classList.add('hidden'); 
  buscarnpcsession.classList.add('hidden');
  homesession.classList.remove('hidden'); 
});
//Criar NPC
const createnpcdropdown = document.getElementById('create-npc-dropdown');
const createnpcsession = document.getElementById('create-npc-session');
createnpcdropdown.addEventListener('click', () => {
    homesession.classList.add('hidden'); 
    buscarnpcsession.classList.add('hidden');
    createnpcsession.classList.remove('hidden'); 
  
  });
//Buscar NPC
const buscarnpcdropdown = document.getElementById('buscar-npc-dropdown');
const buscarnpcsession = document.getElementById('buscar-npc-session');
buscarnpcdropdown.addEventListener('click', () => {
    homesession.classList.add('hidden'); 
    createnpcsession.classList.add('hidden'); 
    buscarnpcsession.classList.remove('hidden');
  });
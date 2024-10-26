const mysql = require('mysql2/promise');
let connections;

async function connectToDB({ host, port, username, password, database1, database2 }) {
  try {
    // Conectar aos dois bancos de dados
    const [primary, secondary] = await Promise.all([
      mysql.createConnection({ host, port, user: username, password, database: database1 }),
      mysql.createConnection({ host, port, user: username, password, database: database2 }),
    ]);

    console.log('Conectado aos dois bancos de dados com sucesso!');

    // Armazenar as conexões no objeto connections
    connections = { primary, secondary };

    return connections;
  } catch (error) {
    console.error('Erro ao conectar aos bancos de dados:', error.message);
    return null;
  }
}

// Função para fechar todas as conexões
//async function closeConnections() {
//  try {
//    await Promise.all(Object.values(connections).map(conn => conn.end()));
//    console.log('Todas as conexões foram encerradas.');
//  } catch (error) {
//    console.error('Erro ao encerrar conexões:', error.message);
// }
//}

// Função para buscar dados da tabela realmlist
async function createRealm() {
  try {
    // Buscar o último ID e a última porta inseridos
    const [rows] = await connections.secondary.execute(
      'SELECT id, port FROM realmlist ORDER BY id DESC LIMIT 1'
    );

    const lastRealm = rows[0];
    const nextId = lastRealm ? lastRealm.id + 1 : 1;
    const nextPort = lastRealm ? lastRealm.port + 1 : 8085;

    // Inicializar o nome do realm e verificar a duplicidade
    let baseName = 'Novo Realm';
    let realmName = baseName;
    let realmExists = true;
    let counter = 1;

    // Verificar se o realm já existe e incrementar o nome
    while (realmExists) {
      const [existing] = await connections.secondary.execute(
        'SELECT COUNT(*) as count FROM realmlist WHERE name = ?',
        [realmName]
      );

      realmExists = existing[0].count > 0;

      if (realmExists) {
        counter++;
        realmName = `${baseName} ${counter}`;
      }
    }

    // Inserir o novo realm
    await connections.secondary.execute(
      `INSERT INTO realmlist 
      (id, name, address, localAddress, localSubnetMask, port, icon, flag, timezone, 
       allowedSecurityLevel, population, gamebuild) 
      VALUES (?, ?, '127.0.0.1', '127.0.0.1', '255.255.255.0', ?, 0, 0, 1, 1, 0, 12340)`,
      [nextId, realmName, nextPort]
    );

    console.log(`Novo realm criado com ID ${nextId} e porta ${nextPort}, nome: ${realmName}`);
    return true;
  } catch (error) {
    console.error('Erro ao criar o novo realm:', error.message);
    return false;
  }
}

async function getRealmlist() {
  try {
    const [rows] = await connections.secondary.execute('SELECT id, name, address FROM realmlist');
    return rows;
  } catch (error) {
    console.error('Erro ao buscar dados da tabela realmlist:', error.message);
    return [];
  }
}
async function updateRealm(realm) {
  try {
    await connections.secondary.execute(
      'UPDATE realmlist SET name = ?, address = ? WHERE id = ?',
      [realm.name, realm.address, realm.id]
    );
    console.log(`Realm ${realm.id} atualizado com sucesso!`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar o realm:', error.message);
    return false;
  }
}

async function checkEntry(entry) {
  try {
    const [rows] = await connections.primary.execute('SELECT 1 FROM creature_template WHERE entry = ?', [entry]);
    return rows.length > 0;
  } catch (error) {
    console.error('Erro ao verificar entry:', error.message);
    return false;
  }
}

async function createNPC(npcData) {
    try {
      const npcQuery = `
        INSERT INTO creature_template (entry, name, subname, faction, minlevel, maxlevel, npcflag, VerifiedBuild)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const npcValues = [
        npcData.entry, npcData.name, npcData.subname, npcData.faction,
        npcData.minlevel, npcData.maxlevel, npcData.npcflag, npcData.VerifiedBuild
      ];
      await connections.primary.execute(npcQuery, npcValues);
  
      const modelQuery = `
        INSERT INTO creature_template_model (CreatureID, Idx, CreatureDisplayID, DisplayScale, Probability, VerifiedBuild)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const modelValues = [
        npcData.modelData.CreatureID, npcData.modelData.Idx, 
        npcData.modelData.CreatureDisplayID, npcData.modelData.DisplayScale,
        npcData.modelData.Probability, npcData.modelData.VerifiedBuild
      ];
      await connections.primary.execute(modelQuery, modelValues);
  
      console.log('NPC e modelo inseridos com sucesso!');
    } catch (error) {
      console.error('Erro ao inserir NPC ou modelo:', error.message);
      throw error;
    }
  }
  
// Função de busca de NPCs com filtros
async function searchNPCs({ entry, name, subname }) {
  try {
   let query = `
  SELECT creature_template.entry, 
         creature_template.name, 
         creature_template.subname, 
         creature_template.minlevel, 
         creature_template.maxlevel, 
         creature_template.faction, 
         creature_template.npcflag,
         creature_template_model.CreatureDisplayID, 
         creature_template_model.DisplayScale, 
         creature_template_model.Probability, 
         creature_template_model.VerifiedBuild
  FROM creature_template
  JOIN creature_template_model ON creature_template.entry = creature_template_model.CreatureID
  WHERE 1=1
`;

    const params = [];

    if (entry) {
      query += ' AND entry = ?';
      params.push(entry);
    }
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (subname) {
      query += ' AND subname LIKE ?';
      params.push(`%${subname}%`);
    }

    console.log('Consulta SQL gerada:', query);
    console.log('Parâmetros:', params);

    const [rows] = await connections.primary.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar NPCs:', error.message);
    throw error;
  }
}

async function updateNPC({ entry, name, subname, minlevel, maxlevel, faction, npcflag, CreatureDisplayID, DisplayScale, Probability, CreatureID}) {
  try {
    const query = `
      UPDATE creature_template
      SET name = ?, subname = ?, minlevel = ?, maxlevel = ?, faction = ?, npcflag = ?
      WHERE entry = ?
    `;
    await connections.primary.execute(query, [name, subname, minlevel, maxlevel, faction, npcflag, entry]);
    console.log(`NPC ${entry} atualizado com sucesso!`);
    const modelquery = `
  UPDATE creature_template_model 
  JOIN creature_template 
    ON creature_template.entry = creature_template_model.CreatureID
  SET CreatureDisplayID = ?, DisplayScale = ?, Probability = ?
  WHERE creature_template.entry = ?
    `;
    await connections.primary.execute(modelquery, [CreatureDisplayID, DisplayScale, Probability, CreatureID]);
    console.log(`NPC atualizado com sucesso!`);
  } catch (error) {
    console.error('Erro ao atualizar NPC:', error.message);
    throw error;
  }
}

  module.exports = { connectToDB, createRealm, getRealmlist, updateRealm, checkEntry, createNPC, searchNPCs, updateNPC };
  

import db from '../lib/database.js'
import { createHash } from 'crypto'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'
import _ from 'lodash'
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let mentionedJid = [who]
  
  // Obtener datos de país
  let delirius = await axios.get(`https://deliriussapi-oficial.vercel.app/tools/country?text=${PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')}`)
  let paisdata = delirius.data.result
  let mundo = paisdata ? `${paisdata.name} ${paisdata.emoji}` : 'Desconocido'
  
  // Obtener biografía
  let bio = 0, fechaBio
  let who2 = m.isGroup ? _.get(m, 'mentionedJid[0]', m.quoted?.sender || m.sender) : m.sender
  let sinDefinir = '😿 Es privada'
  let biografia = await conn.fetchStatus(who2).catch(() => null)
  
  if (!biografia || !biografia[0] || biografia[0].status === null) {
    bio = sinDefinir
    fechaBio = 'Fecha no disponible'
  } else {
    bio = biografia[0].status || sinDefinir
    fechaBio = biografia[0].setAt ? new Date(biografia[0].setAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Fecha no disponible'
  }
  
  let perfil = await conn.profilePictureUrl(who, 'image').catch(() => 'https://qu.ax/QGAVS.jpg')
  let pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://qu.ax/QGAVS.jpg')

  if (command === 'reg') {
    let user = global.db.data.users[m.sender]
    let name2 = conn.getName(m.sender)
    if (user.registered) return m.reply(`🍭 Ya estás registrado.\n\n*¿Quiere volver a registrarse?*\n\nUse este comando para eliminar su registro.\n*${usedPrefix}unreg*`)
    if (!Reg.test(text)) return m.reply(`🌹 Formato incorrecto.\n\nUso del comamdo: *${usedPrefix + command} nombre.edad*\nEjemplo: *${usedPrefix + command} ${name2}.666*`)
    
    let [_, name, splitter, age] = text.match(Reg)
    if (!name) return m.reply('🚩 El nombre no puede estar vacío.')
    if (!age) return m.reply('🚩 La edad no puede estar vacía.')
    if (name.length >= 100) return m.reply('🚩 El nombre es demasiado largo.')
    
    age = parseInt(age)
    if (age > 100) return m.reply('👴🏻 Wow el abuelo quiere jugar al bot.')
    if (age < 5) return m.reply('🚼 hay un abuelo bebé jsjsj.')
    
    global.db.data.users[m.sender]['registered'] = true
    global.db.data.users[m.sender].name = name
    global.db.data.users[m.sender].age = age
    
    let mini = `🗃️ 𝗥 𝗘 𝗚 𝗜 𝗦 𝗧 𝗥 𝗔 𝗗 𝗢 🗃️\n`
    mini += `💭 *Nombre* » ${name}\n`
    mini += `🍁 *Edad* » ${age} años\n\n`
    mini += `🎁 𝗥𝗲𝗰𝗼𝗺𝗽𝗲𝗻𝘀𝗮𝘀:\n`
    mini += `🍫 *Chocolates* » 40\n`
    mini += `✨️ *Exp* » 300\n`
    mini += `💰 *Joincount* » 20\n`
    mini += `🪙 *Money* » 100\n\n`
    mini += `🚩 \`\`\`Para finalizar su registro escriba:\`\`\`
    ✪ *${usedPrefix}finalizar*`
    
    await m.react('🗂')
    await conn.sendMessage(m.chat, {
      text: mini,
      contextInfo: {
        externalAdReply: {
          title: '⊱『✅𝆺𝅥 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗔𝗗𝗢(𝗔) 𝆹𝅥✅』⊰',
          body: packname,
          thumbnailUrl: pp, 
          sourceUrl: redes,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: fkontak })
  }
  
  if (command === 'finalizar' || command === 'end') {
    if (global.db.data.users[m.sender]['registered']) {
      let user = global.db.data.users[m.sender]
      user.descripcion = bio 
      user.regTime = + new Date
      
      global.db.data.users[m.sender].money += 100
      global.db.data.users[m.sender].chocolates += 40
      global.db.data.users[m.sender].exp += 300
      global.db.data.users[m.sender].joincount += 20
      let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)
      m.reply(sn)

      let chtxt = `
      👤 *Usuario* » ${m.pushName || 'Anónimo'}
      🌎 *Pais* » ${mundo}
      🗃 *Verificación* » ${user.name}
      🌺 *Edad* » ${user.age} años
      👀 *Descripción* » ${user.descripcion}
      ⏳ *Modificación de descripción* » ${fechaBio}
      📆 *Fecha* » ${moment.tz('America/Bogota').format('DD/MM/YY')}
      ☁️ *Número de registro* »
      ⤷ ${sn}
      `.trim()
      
      await conn.sendMessage(global.channelid, {
        text: chtxt,
        contextInfo: {
          externalAdReply: {
            title: '【 🔔 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗖𝗜𝗢́𝗡 🔔 】',
            body: '🥳 ¡Un usuario nuevo en mi base de datos!',
            thumbnailUrl: perfil,
            sourceUrl: redes,
            mediaType: 1,
            showAdAttribution: false,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: null })
    }
  }
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['reg', 'finalizar', 'end']

export default handler
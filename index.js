const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mxmail = require('mxmail')
const mustache = require('mustache')
const { htmlToText } = require('html-to-text')
const tomarkup = require('tomarkup')({
  headerIds: false,
  video: false,
  data: false
})

function strip(str) {
  return str.split('\n').map(line => line.trim()).join('\n')
}

async function defaultLayout(mail, $, data) {
  return /* html */`
    <!doctype html>
    <html>
      <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <title>${mail.subject}</title>
      </head>
      <body>
        ${mail.content}
      </body>
    </html>
  `
}

module.exports = function(config = {}) {
  const client = mxmail(config)
  /** Possible options
   * to: 'Vidar Eldøy <vidar@eldoy.com>',
   * from: 'Vidar Eldøy <vidar@eldoy.com>',
   * cc: 'cc@eldoy.com',
   * bcc: 'bcc@eldoy.com',
   * subject: 'hello',
   * html: '<h1>Helloæøå</h1>',
   * text: 'Helloæøå',
   * replyTo: 'vidar@eldoy.com',
   * attachments: [file]
  */
  async function build(mail, $ = {}, options = {}, data = {}) {
    if (typeof mail === 'string') {
      let fn = _.get($.app.mail, mail)
      if (typeof fn !== 'function') {
        const lang = $.lang || 'en'
        const root = process.env.WAVEORB_MAILER_APP_ROOT || ''
        const dir = path.join(process.cwd(), root, 'app', 'mail', mail)
        const json = require(path.join(dir, `${mail}.${lang}.json`))
        const md = path.join(dir, `${mail}.${lang}.md`)
        if (fs.existsSync(md)) {
          json.file = md
        }
        fn = async function($, data) {
          return json
        }
      }
      mail = await fn($, data)
    }

    if (mail.file) {
      mail.base = fs.readFileSync(mail.file, 'utf8')
      if (/\.md$/.test(mail.file)) {
        mail.format = 'markdown'
      }
      mail.content = mail.base
    }

    // Mustache
    mail.content = mustache.render(strip(mail.content), { mail, ...data })

    // Format
    if (mail.format === 'markdown') {
      mail.content = tomarkup(mail.content).html
    }

    // Layout
    let layout = mail.layout || 'mail'
    if (typeof layout === 'string') {
      layout = _.get($.app.layouts, layout)
    }

    if (!layout) {
      layout = defaultLayout
    }

    if (typeof layout === 'function') {
      const content = await layout(mail, $, data)
      mail.html = mustache.render(strip(content), { mail, ...data })
    }

    // Text
    if (typeof mail.text === 'function') {
      mail.text = await mail.text($, data)
    }

    if (typeof mail.text === 'string') {
      mail.text = mustache.render(strip(mail.text), { mail, ...data })
    }

    if (!mail.text) {
      mail.text = htmlToText(mail.html)
    }

    options = { ...config.options, ...options, ...mail }
    return options
  }

  async function send(...args) {
    options = await build(...args)
    return client(options)
  }

  return { build, send, client }
}

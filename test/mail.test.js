const wmailer = require('../index.js')
const fs = require('fs')
const fspath = require('path')
const loader = require('conficurse')
const filepath = fspath.join(__dirname, 'assets', 'sirloin.png')
const file = fs.createReadStream(filepath)
const app = loader.load('test/app')
const $ = { app }

process.env.WAVEORB_MAILER_APP_ROOT = 'test'

function flatten(str) {
  return str.split('\n').map(line => line.trim()).join('')
}

const OPTIONS = {
  subject: 'Waveorb Support',
  replyTo: 'Waveorb <hello@waveorb.com>',
  from: 'Waveorb <hello@waveorb.com>',
  to: 'Waveorb <hello@waveorb.com>'
}
const credentials = {}
const config = { ...credentials, options: OPTIONS }
const mailer = wmailer(config)

describe('wmailer', () => {
  it('should build with the right options', async () => {
    const result = await mailer.build('mail1', $, OPTIONS)
    expect(result.subject).toBe('mail1')
    expect(result['replyTo']).toBe('Waveorb <hello@waveorb.com>')
    expect(result.from).toBe('Waveorb <hello@waveorb.com>')
    expect(result.to).toBe('Waveorb <hello@waveorb.com>')
  })

  it('should build a message', async () => {
    const options = {
      to: 'Vidar Eldøy <vidar@eldoy.com>',
      attachment: [file]
    }
    const data = { key: 'hello' }
    const result = await mailer.build('mail1', $, options, data)
    expect(result.to).toBe(options.to)
    expect(flatten(result.html)).toBe(`<!doctype html><html lang=\"en\"><head><meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\"><title>mail1</title><style>body { background-color: gold; }</style></head><body><div class=\"content\">mail1 html content link hello</div><div>Best regards</div></body></html>`)
    expect(flatten(result.text)).toBe(`mail1 html content link helloBest regards`)
  })

  it('should support markdown for html', async () => {
    const options = {
      to: 'Vidar Eldøy <vidar@eldoy.com>',
      attachment: [file]
    }
    const data = { key: 'hello' }
    const result = await mailer.build('mail2', $, options, data)
    expect(flatten(result.html)).toBe(`<!doctype html><html lang=\"en\"><head><meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\"><title>mail2</title><style>body { background-color: gold; }</style></head><body><div class=\"content\"><h1>mail2</h1><p>markdown content link hello</p></div><div>Best regards</div></body></html>`)
  })

  it('should support mustache', async () => {
    const options = {
      to: 'Vidar Eldøy <vidar@eldoy.com>',
      attachment: [file]
    }
    const data = { key: 'hello' }
    const result = await mailer.build('mail3', $, options, data)
    expect(flatten(result.html)).toBe(`<!doctype html><html lang=\"en\"><head><meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\"><title>mail3</title><style>body { background-color: gold; }</style></head><body><div class=\"content\">mail3 mustache content link hello</div><div>Best regards</div></body></html>`)
    expect(flatten(result.text)).toBe(`mail3 mustache content link helloBest regards`)
  })

  it('should work with mustache in layouts', async () => {
    const options = {
      to: 'Vidar Eldøy <vidar@eldoy.com>',
      attachment: [file]
    }
    const data = { key: 'hello' }
    const result = await mailer.build('mail4', $, options, data)
    expect(flatten(result.html)).toBe(`<!doctype html><html lang=\"en\"><head><meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\"><title>mail4</title><style>body { background-color: gold; }</style></head><body><div class=\"content\">mail4 mustache content link hello</div><div>Best regards</div></body></html>`)
    expect(flatten(result.text)).toBe(`mail4 mustache content link helloBest regards`)
  })

  it('should support file option for content', async () => {
    const options = {
      to: 'Vidar Eldøy <vidar@eldoy.com>',
      attachment: [file]
    }
    const data = { key: 'hello' }
    const result = await mailer.build('mail5', $, options, data)
    expect(flatten(result.base)).toBe('# HelloThis is the markdown content:[Eldoy](https://eldoy.com)This is the key: {{key}}')
    expect(result.to).toBe(options.to)
    expect(flatten(result.html)).toBe(`<!doctype html><html lang=\"en\"><head><meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\"><title>mail5</title><style>body { background-color: gold; }</style></head><body><div class=\"content\"><h1>Hello</h1><p>This is the markdown content:<a href=\"https://eldoy.com\">Eldoy</a></p><p>This is the key: hello</p></div><div>Best regards</div></body></html>`)
    expect(flatten(result.text)).toBe(`HELLOThis is the markdown content: Eldoy [https://eldoy.com]This is the key: helloBest regards`)
  })

  it('should support json, markdown and language from folder', async () => {
    const result = await mailer.build('mail6', $, {}, { hello: 'hey' })
    expect(flatten(result.text)).toBe('mail6 heyBest regards')
  })

  xit('should send a message', async () => {
    const options = {
      to: 'Vidar Eldøy <vidar@eldoy.com>',
      attachment: [file]
    }
    const data = { key: 'hello' }
    const result = await mailer.send('mail1', $, options, data)
    expect(result.delivered.length).toEqual(1)
  })
})

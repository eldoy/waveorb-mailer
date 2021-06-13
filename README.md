# Wmail
Send emails with [Mailgun.](https://mailgun.com) Boasts the following features:

* Send email with Mailgun
* Layout support
* Supports HTML, Markdown and Mustache templates
* Automatically converts HTML to use as text version

Made for the [Waveorb web app development platform.](https://waveorb.com)

### Installation
```
npm i wmail
```

### Templates
In `app/layouts` add a file called `mail.js`:
```js
module.exports = async function(mail, $, data) {
  return /* html */`
    <!doctype html>
    <html lang="en">
      <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <title>${mail.subject || 'Wmail'}</title>
        <style>
          body { background-color: gold; }
        </style>
      </head>
      <body>
        <div class="content">${mail.content}</div>
        <div>Best regards</div>
      </body>
    </html>
  `
}
```

Then in your `app/mail` directory add a file called `mail1.js` (or whatever):
```js
module.exports = async function($, data) {
  return {
    layout: 'mail',
    subject: 'mail1',
    content: `mail1 html content link ${data.key}`
  }
}
```

The email content can be written in Markdown:
```js
// ...
format: 'markdown',
content: `# Hello`
// ...
```
The layout can't do Markdown, it has to be HTML.

You can use the file option to set the content from a file:
```js
module.exports = async function($, data) {
  return {
    layout: 'mail',
    subject: 'mail1',
    file: 'data/markdown/mail.md'
  }
}
```
The markdown will be automatically transformed to HTML if it's a markdown file.

### Variables
You can pass variables through the `data` parameter:
```js
await mailer.send('mail1', $, options, data)
// ...
content: `mail1 html content link ${data.key}`
// ...
```

You can also use [Mustache](https://github.com/janl/mustache.js):
```js
// ...
content: `mail1 html content link {{data.key}}`
// ...
```
Both of these techniques work in the layout as well.

### Configuration
In `app/config` add a file called `mail.yml`:
```yaml
domain: example.com
key: mailgun-api-key
options:
  reply: mail@example.com
  from: mail@example.com
  to: mail@example.com
```

Create a plugin in `app/plugins` called `mailer.js`:
```js
const mailer = require('wmail')

module.exports = async function(app) {
  app.mailer = mailer(app.config.mail)
}
```

### Send email
Emails will automatically include the text version which is converted from the HTML in your templates.

```js
// Use mailer from plugin
const mailer = $.app.mailer

// Send email
const options = {
  to: 'Vidar Eldøy <vidar@eldoy.com>',
  attachment: [file]
}

// All possible options:
{
  to: 'vidar@eldoy.com',
  from: 'vidar@eldoy.com',
  cc: 'cc@eldoy.com',
  bcc: 'bcc@eldoy.com',
  subject: 'hello',
  html: '<h1>Hello</h1>',
  text: 'Hello',
  reply: 'vidar@eldoy.com',
  attachment: [readStream],
  inline: [readStream]
}

// Parameters: name, $, options, data
const data = { key: 'hello' }
const result = await mailer.send('mail1', $, options, data)

// On success
{
  id: '<20190910043104.1.043A7DC389CBE263@eldoy.com>',
  message: 'Queued. Thank you.'
}

// On error
{
  "id": undefined,
  "message": "'from' parameter is missing",
  "status": 400
}
```

MIT licensed. Enjoy!

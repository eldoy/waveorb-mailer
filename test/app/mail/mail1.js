module.exports = async function($, data) {
  return {
    layout: 'mail',
    subject: 'mail1',
    content: `mail1 html content link ${data.key}`
  }
}

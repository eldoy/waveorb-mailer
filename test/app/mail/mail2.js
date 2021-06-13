module.exports = async function($, data) {
  return {
    layout: 'mail',
    subject: 'mail2',
    format: 'markdown',
    content: `
      # mail2
      markdown content link ${data.key}
    `
  }
}

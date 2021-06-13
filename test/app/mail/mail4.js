module.exports = async function($, data) {
  return {
    layout: 'mustache',
    subject: 'mail4',
    content: `
      mail4 mustache content link {{key}}
    `
  }
}

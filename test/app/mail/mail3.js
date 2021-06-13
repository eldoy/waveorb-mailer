module.exports = async function($, data) {
  return {
    subject: 'mail3',
    content: `
      mail3 mustache content link {{key}}
    `
  }
}

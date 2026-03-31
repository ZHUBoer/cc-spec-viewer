function getStart(req, res) {
  return res.json({ stargazers_count: 123456 });
}

module.exports = {
  reg: /\/webapp\/projectname\/getStart/i,
  fn: getStart,
};

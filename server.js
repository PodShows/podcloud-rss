import express from 'express';

const PORT = 8881;

var app = express();

app.get('/', function (req, res) {
  res.redirect("https://podcloud.fr/")
});

app.get("/:identifier\.:ext?", function (req, res){
  const format = req.params.ext || "rss"
  const identifier = req.params.identifier
  res.send("identifier:"+identifier+"<br>format: "+format);
});

app.listen(PORT, () => console.log(
  `RSS server is now running on http://localhost:${PORT}/`
));

const http = require('node:http');
const fs = require('node:fs');
const Database = require('better-sqlite3');
const urlModule = require('url');

let a = 1;
const server = http.createServer((req, res) => {
  const { method, url } = req;
  
  console.log("\n--------------------\n");

  switch (method) {
  case "GET":
    switch (url) {
    case "/radno-vreme":
      fs.readFile("./index.html", (err, data) => {
	res.setHeader("Content-type", "text/html");
	res.end(data);
      });
      break;
    case "/radno-vreme/style.css":
      fs.readFile("./style.css", (err, data) => {
	res.setHeader("Content-type", "text/css");
	res.end(data);
      });
      break;
    case "/radno-vreme/script.js":
      fs.readFile("./script.js", (err, data) => {
	res.setHeader("Content-type", "text/javascript");
	res.end(data);
      });
      break;
    case "/radno-vreme/jquery.js":
      fs.readFile("./jquery.js", (err, data) => {
	res.setHeader("Content-type", "text/javascript");
	res.end(data);
      });
      break;
    case "/radno-vreme/tabela":
      const db = new Database('./baza/radno_vreme.db',);

      const query = 'select * from spisak';
      const stmt = db.prepare(query);
      const spisak = stmt.all();

      let spisak_json = JSON.stringify(spisak);

      res.setHeader("Content-type", "application/json");
      res.end(spisak_json);
      break;
    case "/favicon.ico":
      break;
    default:
    } 
  case "POST":
    switch (url) {
    case "/radno-vreme/dodaj-radnju":
      // skupimo request body jer je stream i prebacimo u obj
      let formDataJson = "";
      req.on("data", chunk => {
	formDataJson += chunk; //.toString();
      });
      req.on("end", () => {
	try {
	  let formDataObj = JSON.parse(formDataJson);
	  // ubaci podatke forme u bazu
	  const db = Database('./baza/radno_vreme.db');
	  let query = `INSERT INTO spisak VALUES ('${formDataObj["ime-radnje"]}', '${formDataObj["pon-pet"]}', '${formDataObj["sub"]}', '${formDataObj["ned"]}')`;
	  const stmt = db.prepare(query);
	  const info = stmt.run();
	  res.end();
	} catch (err) {
	  console.log(err);
	  res.statusCode = 500;
	  res.end();
	}
      });
      
      break;
    }
  } // switch
  
}); // server

server.listen(3201);


// mane:

// mora da postoji tabela u bazi inace daje gresku:
// Resenje: to moze sa catch da napravi tabelu ili da se pre INSERT proveri jel postoji tabela







const express = require('express');
const bodyParser = require('body-parser');
const Busboy = require('busboy');
const PORT = 5000;
const app = express();
const Team = require('./models/team');
const mongoose = require('mongoose');

var connection = mongoose.connect(
  'mongodb://localhost:27017/uefa',
  { useNewUrlParser: true}
);

app.use(express.static(__dirname+'/public')); // pour acceder à "form.html"



app.post('/team', (req, res) => {
var searchClub,searchPlayer,searchPoste,searchCountry;
var finalTab = [];

  var busboy = new Busboy({headers: req.headers});

  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      if(fieldname == "pays"){
        searchCountry = val;
      }
      if(fieldname == "club"){
        searchClub = val;
      }
      if(fieldname == "player"){
        searchPlayer = val;
      }
      if(fieldname == "poste"){
        searchPoste = val;
      }
    });
  busboy.on('finish', function(){
    Team.find({},
      {"_id":0, "__v":0})
      .then(result => {
        for(var i = 0; i<result.length; i++){ // pour chaque team

          var cond3 = !searchClub || (searchClub && result[i].nom.toLowerCase().includes(searchClub.toLowerCase())) ? true : false;
          var cond4 = !searchCountry || (searchCountry && result[i].pays.toLowerCase().includes(searchCountry.toLowerCase())) ? true : false;
          if(cond3 && cond4){ // s'il y a une recherche par club / pays


            for(var k = 0; k<result[i].joueurs.length; k++){ // pour chaque joueurs
              var player = result[i].joueurs[k];
              if(searchPoste == "all"){
                var cond1 = true; // recherche par défault --> tous
              }else {
                var cond1 = !searchPoste || (searchPoste && player.role == searchPoste) ? true : false; // s'il y a une recherche sur le poste
              }
              var cond2 = !searchPlayer || (searchPlayer && (player.name.toLowerCase().includes(searchPlayer.toLowerCase()) || player.surname.toLowerCase().includes(searchPlayer.toLowerCase()))) ? true : false; // s'il y a une recherche sur le nom ou le prénom

              if(cond1 && cond2){
                finalTab.push(player);
              }
            } // for each players


          } // filtre club / pays
        } // for each team

        // console.log(finalTab);
      res.send(finalTab);
    })
    // res.sendStatus(200);
  })

  req.pipe(busboy);
})

app.listen(PORT, () => console.log(`Server on ${PORT}...`));

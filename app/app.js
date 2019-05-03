const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const url = require('url');
const mongoose = require('mongoose');
const PORT = 3000;
const Team = require('./models/team');

var connection = mongoose.connect(
  'mongodb://localhost:27017/uefa',
  { useNewUrlParser: true}
);



const adr = "https://fr.uefa.com/uefachampionsleague/season=2019/clubs/club=1652/";
var q = url.parse(adr, true);

function getFile(){
  https.get(adr, (res) => {
    res.pipe(fs.createWriteStream('./public/dom/team.html'));
    res.on('end', () => {
      console.log('Fin récupération DOM');
      parseFile('./public/dom/team.html');

    })
  })
}


function parseFile(path){
  // on récupère l'id de la team dans l'URL afin de cibler plus facilement le logo
  var pathname = q.pathname;
  var teamId = pathname.substring(
    pathname.lastIndexOf("club=") + 5,
    pathname.lastIndexOf("/")
  );
  fs.readFile(path,  (err, file) => {

    const $ = cheerio.load(file.toString());

    // TEAM NAME
    var teamName = $('h1.team-name.desktop').text();
    // FIN TEAM NAME

    // COUNTRY
    var country = $('span.team-country-name').text();
    // FIN COUNTRY

    // LOGO
    var logoTag = $('span.club-logo.team_'+teamId)[0];
    logoBackgroundStyle = $(logoTag).css('background-image');
    var logoPath = logoBackgroundStyle.substring(
      logoBackgroundStyle.lastIndexOf("url('") + 5,
      logoBackgroundStyle.lastIndexOf("'")
    );
    https.get(logoPath, (res) => {
      res.pipe(fs.createWriteStream('./public/logos/'+teamName+'.png'));
      res.on('end', () => {
        console.log('Image enregistrée');
      })
    })
    // FIN LOGO


    // PLAYERS
    var playersList = [];
    var playersTag = $('li.squad--team-player');

    $(playersTag).each(function(){
      var playerName = $(this).find('span.squad--player-name-name').text().trim();
      var playerSurname = $(this).find('span.squad--player-name-surname').text().trim();
      var playerNumber = $(this).find('span.squad--player-num').text().trim();
      var playerRole = $(this).find('span.squad--player-role').text().trim();
      var playerInfo = {'name': playerName, 'surname': playerSurname, 'number': playerNumber, 'role': playerRole};
      playersList.push(playerInfo);
    });
    // console.log(playersList);
    // FIN PLAYERS

    // DATABASE
    var teamCompleted = {'nom': teamName, 'pays': country, 'joueurs': playersList};
    var team = new Team(teamCompleted);
    team.save().then(result => {
      console.log('Team added !');
      mongoose.connection.close()
    });
    // FIN DATABASE

  });
}


connection.then(res => {
  console.log("Mongodb connecté");

  getFile();

});

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
    nom: { type: String, required: true },
    pays: { type: String, required: true },
    joueurs: [
      {
        name: String,
        surname: String,
        number: String,
        role: String,
      }
    ]
})


const Team = mongoose.model('team', TeamSchema);


module.exports = Team;

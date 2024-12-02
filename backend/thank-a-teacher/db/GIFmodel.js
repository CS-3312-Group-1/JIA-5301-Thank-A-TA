var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var gifSchema = new Schema({
    img: { data: Buffer, contentType: String}
}, {
    timestamps: true
});
module.exports = mongoose.model('gif', gifSchema);
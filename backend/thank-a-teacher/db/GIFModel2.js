var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the schema for storing GIFs
var GIFSchema = new Schema({
    name: { type: String, required: true }, // Name of the file
    img: { 
        data: Buffer, // Binary data of the file
        contentType: String // MIME type, e.g., "image/gif"
    },
    size: { type: Number }, // File size in bytes
    uploadedBy: { type: String }, // Optional: Track who uploaded it
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('GIF2', GIFSchema);

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dxepnpgw7', // replace with your Cloudinary cloud name
  api_key: '287815833958953',       // replace with your Cloudinary API key
  api_secret: 'dQDFju6yXN5WXI1SAcyaxdd7wqw'  // replace with your Cloudinary API secret
});

module.exports = cloudinary; 
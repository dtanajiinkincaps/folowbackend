const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
aws.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey
  })
  // Set S3 endpoint to DigitalOcean Spaces
  const spacesEndpoint = new aws.Endpoint('s3.ap-south-1.amazonaws.com');
  const s3 = new aws.S3({
    endpoint: spacesEndpoint
  });
  
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'iic-folow',
      acl: 'public-read',
      key: function (request, file, cb) {
        // console.log(file);
        const filename=Date.now() + file.originalname;
        // console.log(filename)
        cb(null, filename);
      }
    })
  }).fields([{ name: "profile_image" }, { name: "background_image" }, { name: 'video' },{name : 'images'}, {name : 'media'}]);

  
  module.exports = upload;

  
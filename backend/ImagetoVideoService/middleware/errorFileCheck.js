const fs = require("fs");
const path = require("path");


const imageDirectory = path.join(__dirname, "..", "routes", "images/")
const videoDirectory = path.join(__dirname, "..", "routes", "output/")  

const deletefile = async (req, res, next)=> {

    console.log(imageDirectory);
    fs.readdir(imageDirectory, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(imageDirectory, file), (err) => {
            if (err) throw err;
          });
        }
      });

      console.log(videoDirectory);
      fs.readdir(videoDirectory, (err, files) => {
          if (err) throw err;
        
          for (const file of files) {
            fs.unlink(path.join(videoDirectory, file), (err) => {
              if (err) throw err;
            });
          }
        });
    next()
}

module.exports = { deletefile };
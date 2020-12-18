const fs = require('fs');
import dotEnv from 'dotenv'
// import fs  from 'express'
import multer from 'multer'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import express from 'express'

dotEnv.config()

// Create Express App
const app = express()

// // BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(morgan('dev'))

// Static folder
app.use(express.static('./public'))

var storage = multer.diskStorage(
  {
    destination: function (req: any, file: any, cb: any) {
      // folder structure
      // /YYYY/MM/DD/unixtimetime/file.ext
      // /2020/12/16/12348297328272833/20201203.csv
      var allDateTimeObject = new Date();
      var year = allDateTimeObject.getFullYear();

      var month = allDateTimeObject.getMonth() + 1
      var day = allDateTimeObject.getDate()
      var unixTimeStamp = allDateTimeObject.toISOString()
      var folderPathWithDateTime = `./public/uploads/${year}/${month}/${day}/${unixTimeStamp}`
      console.log("folder path ", folderPathWithDateTime)

      fs.mkdirSync(`${folderPathWithDateTime}`, { recursive: true }, (err: any) => {
        if (err) throw err;
        var unixTimeStamp = Date.now()
        console.log("timestamp is here ", unixTimeStamp)

      });
      cb(null, `./public/uploads/${year}/${month}/${day}/${unixTimeStamp}`)

    },
    filename: function (req: any, file: any, cb: any) {
      cb(null, file.originalname);
    }
  }
);

var upload = multer({ storage: storage });

// Get home route with html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

function checkAuth(req: any, res: any, next: any) {
  // Verify credentials
  if (req.headers) {
    const matches = (req.headers.authorization || '').toString().match(/^bearer (.*)$/i)
    if (!matches || matches[1] !== process.env.TOKEN) {
      return res.status(401).send('Authentication required.') // Access denied.   
    }
  } else if (req.payload) {
    if ((req.payload.bearer || '').toString() !== process.env.TOKEN) {
      return res.status(401).send('Authentication required.') // Access denied.   
    }
  } else {
    return res.status(401).send('??') // Access denied.   
  }
  next()
}

//this is a middleware to be called after file is downloaded
function uploadFile(req: any, res: any, next: any) {
  if (!req.file) {
    console.error(`No file selected`)
    return res.send({
      success: false
    })
  } else {
    console.log(`File uploaded`)
    res.send({
      success: true,
      file: req.file,
    })
  }
}


app.post('/', checkAuth, upload.single('data'), uploadFile)

// Server
app.listen(3696, () => console.log('Server started on port 3696'))

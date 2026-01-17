const cors = require('cors');

const corsConfigure = () => {

  return cors({

    origin: (origin, callback) => {

      //The url that can request fro my server
      const want = [
        "http://localhost:5173", 
        "https://mydomainname.com"
      ]

      if(!origin || want.indexOf() !== -1) {
        callback(null, true);
      } else{
        callback(new Error("Cannot send request to this server"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept-Version"
    ],
    credentials: true,
    preflightContinue: false,
    maxAge: 600
  });
}

module.exports = {corsConfigure};
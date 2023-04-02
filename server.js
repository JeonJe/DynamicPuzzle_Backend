const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3001;
const secretKey = "your_secret_key";
require("dotenv").config();
var mongoose = require("mongoose"),
  User = require("./user-model.js");

app.use(express.json());
app.use(cors());

// body-parser 미들웨어를 사용하여 요청 본문을 파싱
app.use(bodyParser.json());
const dbURL = process.env.DB_URL;

//database 연결
mongoose
  .connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`[+] mongoseDB Connection`);
  })
  .catch((err) => console.error(`[-] mongoseDB ERROR :: ${err}`));


app.post("/api/login", async (req, res) => {
  //사용자로부터 받은 정보
  const username = req.body.username;
  const password = req.body.password;

  //fetch user date from database 
  try{
      const user = await User.findOne({ username: username });

      if(!user){
        return res.status(401).json(({ error: "Invalid username or password" }));
      }

       if (bcrypt.compareSync(password, user.password)) {
         // If the user exists and the password is correct, generate a JWT
         const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
         res.status(200).json({ token });
         console.log("Login successful");
       } else {
         // If the password is incorrect, return an error
         res.status(401).json({ error: "Invalid username or password" });
       }
  }
  catch(err){
    console.log(err);
    res.status(500).json({error: err.message});
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

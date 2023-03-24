const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3001;
const mongoose = require("mongoose");
const secretKey = "your_secret_key";
require("dotenv").config();

app.use(express.json());
app.use(cors());
// body-parser 미들웨어를 사용하여 요청 본문을 파싱
app.use(bodyParser.json());

const dbURL = process.env.DB_URL;

mongoose
  .connect(dbURL)
  .then(() => {
    console.log(`[+] mongoseDB Connection`);
  })
  .catch((err) => console.error(`[-] mongoseDB ERROR :: ${err}`));

  
app.post("/api/login", (req, res) => {
  //사용자로부터 받은 정보
  const username = req.body.username;
  const password = req.body.password;
  
  //TODO: 데이터베이스로부터 가져온 사용자 정보로 교체 필요 
  const user = {
    username: "example",
    password: "password123",
  };

  const saltRounds = 1;
  bcrypt.hash(user.password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.log("해싱에 실패하였습니다");
    } else {
      console.log("hashed : ", hashedPassword);
      user.password = hashedPassword;
      console.log(password, user.password);

        if (username === user.username && bcrypt.compareSync(password, user.password)) {
            // If the user exists and the password is correct, generate a JWT
            const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
            res.status(200).json({ token });
        } else {
            // If the user does not exist or the password is incorrect, return an error
            res.status(401).json({ error: "Invalid username or password" });
        }
        return res;
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

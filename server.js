const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3001;
const router = express.Router();

require("dotenv").config();
var mongoose = require("mongoose"),
  User = require("./user-model.js");

app.use(express.json());
app.use(cors());
app.use(router);

// body-parser 미들웨어를 사용하여 요청 본문을 파싱
app.use(bodyParser.json());
const dbURL = process.env.DB_URL;
const secretKey = process.env.SECRET_KEY;

const { verifyToken } = require('./middlewares/auth/verifyToken');


//database 연결
mongoose
  .connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`[+] mongoseDB Connection`);
  })
  .catch((err) => console.error(`[-] mongoseDB ERROR :: ${err}`));

//회원가입
router.post("/api/signup", async (req, res) => {
  const { username, email, password, passwordValidity } = req.body;
  
  try{
    // Check email and password validity
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).send({ message: "이메일 형식이 올바르지 않습니다." });
    }
   if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(password)) {
     return res
       .status(400)
       .send({ message: "비밀번호는 최소 1개의 소문자, 1개의 대문자, 1개의 숫자가 포함 되어야하며 최소 8자 이상이여야 합니다." });
   }

   if (password !== passwordValidity) {
     return res.status(400).send({ message: "비밀번호가 동일하지 않습니다." });
   }

    const duplicateCheck = await User.findOne({ username });
    if (duplicateCheck) {
      return res.status(409).send({ message: "이미 존재하는 아이디입니다." });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
    res.status(201).send({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: '서버 오류가 발생했습니다.' });
  }

});

router.post("/api/login", async (req, res) => {
  //사용자로부터 받은 정보
  const { username, password } = req.body;

  //fetch user date from database
  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(401).json({ error: "잘못된 아이디 또는 비밀번호 입니다." });
    }

    if (bcrypt.compareSync(password, user.password)) {
      // If the user exists and the password is correct, generate a JWT
      const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
      res.status(200).json({ token });
      console.log("로그인에 성공하였습니다.");
    } else {
      // If the password is incorrect, return an error
      res.status(401).json({ error: "잘못된 아이디 또는 비밀번호 입니다." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", verifyToken, async(req, res, next) =>{
    try {
      // auth 미들웨어에서 생성해준 req.user를 사용하여 DB에서 user 확인
      const user = await User.findOne({username: req.username}).select("-password");
      res.json(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

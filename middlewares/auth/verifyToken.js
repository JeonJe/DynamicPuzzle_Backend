const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;
exports.verifyToken = (req, res, next) => {
  // 인증 완료
  try {
    req.decoded = jwt.verify(req.headers.authorization, secretKey);
    req.name = req.decoded.name;
    
    return next();
  } catch (error) {
    // 인증 실패
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(419).json({
        message: "토큰이 만료되었습니다.",
      });
    }
    return res.status(401).json({
      message: "유효하지 않은 토큰입니다.",
    });
  }
};

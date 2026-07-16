const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: 'Oturum bilgisi bulunamadı.',
    });
  }

  const [tokenType, token] = authorization.split(' ');

  if (tokenType !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Geçersiz oturum bilgisi.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    req.kullanici = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Oturum süresi dolmuş veya token geçersiz.',
    });
  }
};

module.exports = authMiddleware;
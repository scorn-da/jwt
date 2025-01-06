const jwt = require('jsonwebtoken');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
    return {
      accessToken,
      refreshToken,
    }
  }
  
  async saveToken(userId, refreshToken) {
    const tokenData = await prisma.token.findUnique({
      where: {
        userId,
      },
    });
    if (tokenData) {
      await prisma.token.update({
        data: {
          refreshToken,
        },
        where: {
          userId,
        },
      });
      return tokenData;
    }
    const token = await prisma.token.create({
      data: {
        userId,
        refreshToken,
      },
    });
    return token;
  }
}

module.exports = new TokenService();

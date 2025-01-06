const jwt = require('jsonwebtoken');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30s' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
    return {
      accessToken,
      refreshToken,
    }
  }
  
  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }
  
  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (e) {
      return null;
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
  
  async removeToken(refreshToken) {
    const tokenData = await prisma.token.deleteMany({
      where: {
        refreshToken,
      },
    });
    return tokenData;
  }
  
  async findToken(refreshToken) {
    const tokenData = await prisma.token.findFirst({
      where: {
        refreshToken,
      },
    });
    return tokenData;
  }
}

module.exports = new TokenService();

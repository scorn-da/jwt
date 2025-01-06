const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const prisma = new PrismaClient();
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
  async registration(email, password) {
      const candidate = await prisma.user.findUnique({
        where: {
          email,
        }
      });
      if (candidate) {
        throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует, ${new Date()}`);
      }
      const hashedPassword = await bcrypt.hash(password, 3);
      const activationLinkId = uuid.v4();
      
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          activationLink: activationLinkId,
        },
      });
      await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLinkId}`);
      
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      
      return {
        ...tokens,
        user: userDto,
      };
  }
  
  async activate(activationLink) {
    const user = await prisma.user.findFirst({
      where: {
        activationLink
      },
    });
    if (!user) {
      throw ApiError.BadRequest('Некорректная ссылка активации');
    }
    user.isActivated = true;
    await prisma.user.update({
      data: user,
      where: {
        email: user.email,
      }
    });
  }
  
  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      }
    });
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден');
    }
    const isPassEquaals = await bcrypt.compare(password, user.password);
    if (!isPassEquaals) {
      throw ApiError.BadRequest('Неверный пароль');
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    
    return {
      ...tokens,
      user: userDto,
    };
  }
  
  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }
  
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await prisma.user.findUnique({
      where: {
        userId: userData.id,
      }
    });
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    
    return {
      ...tokens,
      user: userDto,
    };
  }
}

module.exports = new UserService();

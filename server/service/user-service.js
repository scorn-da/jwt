const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const prisma = new PrismaClient();
const UserDto = require('../dtos/user-dto');

class UserService {
  async registration(email, password) {
      const candidate = await prisma.user.findUnique({
        where: {
          email,
        }
      });
      if (candidate) {
        throw new Error(`Пользователь с почтовым адресом ${email} уже существует, ${new Date()}`);
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
}

module.exports = new UserService();

import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import type { RequestWithUserInterface } from 'src/common/interface/request-wit-user.interface';
import { Role } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(
    @Req() req: RequestWithUserInterface,
  ): Promise<UserResponseDto> {
    return await this.usersService.findOne(req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll(): Promise<UserResponseDto[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@GetUser('id') id: string): Promise<UserResponseDto> {
    return await this.usersService.findOne(id);
  }

  @Delete('me')
  async deleteAccount(
    @GetUser('id') userId: string,
  ): Promise<{ message: string }> {
    return await this.usersService.remove(userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.usersService.remove(id);
  }
}

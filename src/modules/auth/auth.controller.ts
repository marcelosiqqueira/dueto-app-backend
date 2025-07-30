import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards, // Importe
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Importe

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    console.log(user);

    if (!user) {
      // Em uma implementação mais robusta, o LocalAuthGuard faria isso.
      // Por enquanto, uma exceção explícita é clara.
      throw new Error('Invalid credentials');
    }

    return this.authService.login(user);
  }
}

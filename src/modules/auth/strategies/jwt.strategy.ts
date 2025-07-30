import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService, // Corrigido para userService
  ) {
    // Pega a variável ANTES de chamar o super()
    const secret = configService.get<string>('JWT_SECRET');

    // Lança um erro se a variável de ambiente não estiver definida
    if (!secret) {
      throw new Error('JWT_SECRET not found in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // Passa a variável que agora tem a garantia de ser uma string
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.userService.findOne(payload.sub); // Corrigido para userService

    if (!user) {
      throw new UnauthorizedException('User not found or has been deleted.');
    }

    return { id: payload.sub, email: payload.email };
  }
}

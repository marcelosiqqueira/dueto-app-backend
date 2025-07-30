import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo usuário, garantindo que o e-mail não esteja em uso
   * e criptografando a senha.
   */
  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    // Remove a propriedade 'password' do objeto antes de retorná-lo
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Retorna uma lista de todos os usuários, sem a senha.
   */
  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  /**
   * Busca um único usuário pelo seu ID.
   * Lança uma exceção se não for encontrado.
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    const { password, ...result } = user;
    return result;
  }

  /**
   * Atualiza os dados de um usuário.
   * Se uma nova senha for fornecida, ela será criptografada.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Garante que o usuário existe

    const dataToUpdate: any = { ...updateUserDto };

    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  /**
   * Remove um usuário do banco de dados.
   */
  async remove(id: string) {
    await this.findOne(id); // Garante que o usuário existe
    await this.prisma.user.delete({ where: { id } });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}

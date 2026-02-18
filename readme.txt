-> create auth resource

-> npm i class-validator class-transformer
add this line in the main.ts file before port line
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

-> add user dtos
  -> create-user.dto.ts
      import { IsEmail, IsOptional, IsString } from 'class-validator';

      export class CreateUserDto {
        @IsString()
        name: string;

        @IsString()
        password: string;

        @IsEmail()
        email: string;

        @IsOptional()
        @IsString()
        bio?: string;

        @IsOptional()
        @IsString()
        avatar?: string;
      }

-> npm i bcrypt
   npm i -D @types/bcrypt

import * as bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

 const isMatch = await bcrypt.compare(
      signInDto.password ?? '',
      user.password,
    );

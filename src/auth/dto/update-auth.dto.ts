import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './signIn-auth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}

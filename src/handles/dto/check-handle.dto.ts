import { IsNotEmpty, IsString } from 'class-validator';

export class CheckHandleDto {
  @IsString()
  @IsNotEmpty()
  readonly handle: string;
}

import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  isPrivate: boolean;
}

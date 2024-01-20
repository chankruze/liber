import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateLinkDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsBoolean()
  isPrivate: boolean;

  @IsArray()
  folderIds: string[];
}

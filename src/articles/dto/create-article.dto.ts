import { IsString, IsBoolean, IsOptional, IsArray, MinLength, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsBoolean()
  isPublic: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

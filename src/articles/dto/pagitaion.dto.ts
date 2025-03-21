import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number) // Преобразует строку в число
  @IsInt()
  @Min(1) // Минимальное значение — 1
  page?: number = 1; // Значение по умолчанию

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10; // Значение по умолчанию
}

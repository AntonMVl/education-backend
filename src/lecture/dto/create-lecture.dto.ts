import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLectureDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsOptional()
  @IsString()
  pdf_file?: string;

  @IsOptional()
  @IsBoolean()
  has_test?: boolean;

  @IsOptional()
  images?: string[];
}

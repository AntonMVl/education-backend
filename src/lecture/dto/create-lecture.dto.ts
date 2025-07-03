import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLectureDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsOptional()
  @IsString()
  pdf_file?: string;

  @IsOptional()
  images?: string[];
}

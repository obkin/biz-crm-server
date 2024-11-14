import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Baseus Desktop Lamp',
    description: 'The name of the product',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(70, { message: 'Name must not exceed 70 characters' })
  readonly name: string;

  @ApiPropertyOptional({
    example: 'A stylish desktop lamp with adjustable brightness',
    description: 'The description of the product',
  })
  @IsOptional()
  @IsString()
  @MaxLength(9000, { message: 'Description must not exceed 9000 characters' })
  readonly description?: string;

  @ApiProperty({
    example: 749.25,
    description: 'The price of the product',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @IsPositive()
  readonly price: number;

  @ApiProperty({
    example: 10,
    description: 'The quantity of the product in stock',
  })
  @IsNumber()
  @IsNotEmpty()
  readonly quantity: number;

  @ApiPropertyOptional({
    example: 'https://aws-s3/image?fh43FAgJ343gfhGHJ11344',
    description: 'The URL for the product image',
  })
  @IsOptional()
  @IsString()
  readonly imageUrl?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'The ID of the folder where the product is categorized',
  })
  @IsOptional()
  @IsNumber()
  readonly folderId?: number;

  @ApiPropertyOptional({
    example: 123,
    description: 'The ID of the user who owns this product',
  })
  @IsOptional()
  @IsNumber()
  readonly userId?: number;
}

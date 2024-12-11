import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsPositive,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from '../products.constants';

export class CreateProductDto {
  @ApiProperty({
    example: 'Baseus Desktop Lamp',
    description: 'The name of the product',
    maxLength: MAX_NAME_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH, { message: 'Name must not exceed 70 characters' })
  readonly name: string;

  @ApiPropertyOptional({
    example: 'A stylish desktop lamp with adjustable brightness',
    description: 'The description of the product',
    maxLength: MAX_DESCRIPTION_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_DESCRIPTION_LENGTH, {
    message: 'Description must not exceed 9000 characters',
  })
  readonly description?: string;

  @ApiProperty({
    example: 749.25,
    description: 'The price of the product',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with up to 2 decimal places' },
  )
  @IsPositive()
  @IsNotEmpty()
  readonly price: number;

  @ApiProperty({
    example: 10,
    description: 'The quantity of the product in stock',
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  readonly quantity: number;

  @ApiPropertyOptional({
    example: 'https://aws-s3/image?fh43FAgJ343gfhGHJ11344',
    description: 'The URL for the product image',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Image URL must be valid' })
  readonly imageUrl?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'The ID of the folder where the product is categorized',
  })
  @IsOptional()
  @IsPositive({ message: 'Folder ID must be a positive number' })
  @IsNumber()
  readonly folderId?: number;

  @ApiPropertyOptional({
    example: 123,
    description: 'The ID of the user who owns this product',
  })
  @IsOptional()
  @IsPositive({ message: 'User ID must be a positive number' })
  @IsNumber()
  readonly userId?: number;
}

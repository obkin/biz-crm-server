import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductEntity } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { idValidationPipe } from 'src/common/pipes/validate-id.pipe';
import { EmptyObjectValidationPipe } from 'src/common/pipes/validate-empty-object.pipe';
import { Request } from 'express';

@ApiTags('products')
@Controller('/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({
    status: 201,
    description: 'New product created',
    type: ProductEntity,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @Req() req: Request,
  ): Promise<ProductEntity> {
    try {
      return await this.productsService.createProduct(Number(req.user.id), dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to create new product. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all products',
    type: [ProductEntity],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get()
  async findAll(@Req() req: Request, @Query('userId') ownerId?: number) {
    try {
      const products = await this.productsService.findAllProducts(
        Number(req.user.id),
        Number(ownerId),
      );
      return { amount: products.length, products };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to find all products. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved product by id',
    type: ProductEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong id format',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the product' })
  @Get(':id')
  async findOne(
    @Param('id', idValidationPipe) productId: number,
    @Req() req: Request,
  ): Promise<ProductEntity> {
    try {
      return await this.productsService.findOneProduct(
        Number(req.user.id),
        Number(productId),
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to find the product by ID. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Update product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated',
    type: ProductEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong id format',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the product' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UsePipes(new EmptyObjectValidationPipe())
  @Patch(':id')
  async update(
    @Param('id', idValidationPipe) productId: number,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
  ): Promise<ProductEntity> {
    try {
      return await this.productsService.updateProduct(
        Number(req.user.id),
        Number(productId),
        dto,
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to update the product. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the product' })
  @HttpCode(200)
  @Delete(':id')
  async remove(
    @Param('id', idValidationPipe) productId: number,
    @Req() req: Request,
  ) {
    try {
      await this.productsService.removeProduct(
        Number(req.user.id),
        Number(productId),
      );
      return { productId, message: 'Product removed' };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to delete the product. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}

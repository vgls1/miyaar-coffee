import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const slug = slugify(createProductDto.name, { lower: true });
    
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    try {
      return await this.prisma.product.create({
        data: {
          ...createProductDto,
          slug,
          images: createProductDto.images || [],
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product with this name/slug already exists');
      }
      throw error;
    }
  }

  async findAll(query: QueryProductDto) {
    const { page = 1, limit = 10, search, categoryId, minPrice, maxPrice } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    const data: any = { ...updateProductDto };

    if (updateProductDto.name && updateProductDto.name !== product.name) {
      data.slug = slugify(updateProductDto.name, { lower: true });
    }

    if (updateProductDto.categoryId) {
        const category = await this.prisma.category.findUnique({
            where: { id: updateProductDto.categoryId },
        });
        if (!category) {
            throw new NotFoundException('Category not found');
        }
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product with this name/slug already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }
  async seed() {
    // 1. Ensure Categories Exist
    const coffeeCategory = await this.prisma.category.upsert({
      where: { slug: 'coffee' },
      update: {},
      create: { name: 'Coffee', slug: 'coffee', description: 'Premium beans' },
    });

    const accessoriesCategory = await this.prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: { name: 'Accessories', slug: 'accessories', description: 'Luxury tools' },
    });

    // 2. Create Products
    const products = [
      {
        name: 'Ethiopian Origin',
        slug: 'ethiopian-origin',
        description: 'Floral & Citrus notes. Washed process. Altitude 2000m-2200m.',
        price: 125.00,
        stock: 50,
        categoryId: coffeeCategory.id,
        images: ['/products/1.jpg']
      },
      {
          name: 'Colombian Roast',
          slug: 'colombian-roast',
          description: 'Smooth chocolate body with hints of caramel.',
          price: 95.00,
          stock: 50,
          categoryId: coffeeCategory.id,
          images: ['/products/2.jpg']
      },
      {
          name: 'Miyaar Signature Blend',
          slug: 'miyaar-signature',
          description: 'Our award-winning house blend. Perfectly balanced.',
          price: 110.00,
          stock: 100,
          categoryId: coffeeCategory.id,
          images: ['/products/3.jpg']
      },
      {
          name: 'Miyaar Travel Tumbler',
          slug: 'travel-tumbler',
          description: 'Matte black vacuum insulated tumbler. Keeps coffee hot for 6 hours.',
          price: 145.00,
          stock: 30,
          categoryId: accessoriesCategory.id,
          images: ['/products/4.jpg']
      },
     
    ];

    const results: any[] = [];
    for (const p of products) {
      const product = await this.prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          images: p.images,
          price: p.price,
          categoryId: p.categoryId
        },
        create: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          stock: p.stock,
          categoryId: p.categoryId,
          images: p.images
        },
      });
      results.push(product);
    }
    return { message: 'Seeding successful', count: results.length };
  }
}

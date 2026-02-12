import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order items are required');
    }

    // 2. Start Transaction
    return this.prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const orderItemsData: { productId: number; quantity: number; price: any }[] = [];

      // 3. Validate Products, Prices & Stock
      for (const item of createOrderDto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product: ${product.name}`);
        }
        
        calculatedTotal += Number(product.price) * item.quantity;
        
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });

        // 4. Decrement Stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 5. Create Order
      const order = await tx.order.create({
        data: {
          userId,
          total: calculatedTotal,
          status: 'PENDING',
          shippingAddress: createOrderDto.shippingAddress,
          phone: createOrderDto.phone,
          paymentMethod: createOrderDto.paymentMethod,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: { orderItems: true },
      });

      // 6. Optional: Clear the backend cart if it exists
      await tx.cartItem.deleteMany({
        where: { cart: { userId } },
      }).catch(() => {}); // Ignore if no cart exists

      return order;
    });
  }

  findAll(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
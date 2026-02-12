import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }
    return cart;
  }

  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    
    // Calculate totals dynamically
    const items = cart.items.map(item => ({
      ...item,
      total: Number(item.product.price) * item.quantity,
    }));

    const total = items.reduce((sum, item) => sum + item.total, 0);

    return { ...cart, items, total };
  }

  async addToCart(userId: number, dto: AddToCartDto) {
    const { productId, quantity } = dto;

    // Check product existence and stock
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < quantity) throw new BadRequestException('Insufficient stock');

    const cart = await this.getOrCreateCart(userId);
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity if item already in cart
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) throw new BadRequestException('Insufficient stock for update');
      
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true, product: true }
    });

    if (!item || item.cart.userId !== userId) {
        throw new NotFoundException('Cart item not found');
    }

    if (item.product.stock < dto.quantity) {
        throw new BadRequestException('Insufficient stock');
    }

    await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: dto.quantity }
    });

    return this.getCart(userId);
  }

  async removeItem(userId: number, itemId: number) {
    const item = await this.prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true }
    });

    if (!item || item.cart.userId !== userId) {
        throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async clearCart(userId: number) {
      const cart = await this.getOrCreateCart(userId);
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      return { message: 'Cart cleared' };
  }
}

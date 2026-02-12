import { Controller, Post, Body, Get, Param, UseGuards, Request } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Request() req, @Body() dto: CreateOrderDto) {
        return this.ordersService.create(req.user.sub, dto);
    }

    @Get()
    findAll(@Request() req) {
        return this.ordersService.findAll(req.user.sub);
    }

    @Get(":id")
    findOne(@Request() req, @Param("id") id: string) {
        return this.ordersService.findOne(+id, req.user.sub);
    }
}
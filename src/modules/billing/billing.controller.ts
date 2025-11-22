import {  Body,  Controller,  Headers,  HttpCode,  Param,  Post,  Get,  Req,  Logger,} from '@nestjs/common';
import { Request } from 'express';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(private readonly billingService: BillingService) {}

  @Post('checkouts')
  async createCheckout(@Body() dto: CreateCheckoutDto) {
    return this.billingService.createCheckout(dto);
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Headers() headers: Record<string, string>,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.logger.debug({ headers, query: req.query, body: req.body }, 'Webhook debug');
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
    return this.billingService.handleWebhook(headers['x-abacatepay-signature'], rawBody, req.body);
  }
  @Get('/users/:userId/subscription')
  async getSubscription(@Param('userId') userId: string) {
    return this.billingService.getLatestSubscriptionForUser(userId);
  }

  @Get('/users/:userId/payments')
  async getPayments(@Param('userId') userId: string) {
    return this.billingService.getPaymentsForUser(userId);
  }

  @Post('/subscriptions/:id/cancel')
  async cancelSubscription(@Param('id') id: string) {
    return this.billingService.cancelSubscription(id);
  }
}

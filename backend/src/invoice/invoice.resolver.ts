import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { InvoiceService } from './invoice.service';
import { Invoice, InvoiceDetail, InvoicePagination } from './entities/invoice.entity';
import { UpdateInvoiceStatusInput } from './dto/update-invoice-status.input';
import { GetInvoicesByShopInput } from './dto/get-invoices-by-shop.input';
import { GetOutOfStockProductsInput } from './dto/get-out-of-stock-products.input';

@Resolver(() => Invoice)
export class InvoiceResolver {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Mutation(() => Invoice)
  updateInvoiceStatus(@Args('updateInvoiceStatusInput') updateInvoiceStatusInput: UpdateInvoiceStatusInput) {
    return this.invoiceService.updateInvoiceStatus(updateInvoiceStatusInput);
  }

  @Query(() => InvoicePagination, { name: 'getInvoicesByShop' })
  getInvoicesByShop(@Args('getInvoicesByShopInput') getInvoicesByShopInput: GetInvoicesByShopInput) {
    return this.invoiceService.getInvoicesByShop(getInvoicesByShopInput);
  }

  @Query(() => InvoiceDetail, { name: 'getInvoiceDetail' })
  getInvoiceDetail(@Args('invoice_id') invoice_id: string) {
    return this.invoiceService.getInvoiceDetail(invoice_id);
  }

  @Query(() => InvoicePagination, { name: 'getOutOfStockProducts' })
  getOutOfStockProducts(@Args('getOutOfStockProductsInput') getOutOfStockProductsInput: GetOutOfStockProductsInput) {
    return this.invoiceService.getOutOfStockProducts(getOutOfStockProductsInput);
  }
} 
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { InvoiceService } from './invoice.service';
import { Invoice, InvoiceDetail, InvoicePagination } from './entities/invoice.entity';
import { UpdateInvoiceStatusInput } from './dto/update-invoice-status.input';
import { GetInvoicesByShopInput } from './dto/get-invoices-by-shop.input';
import { GetOutOfStockProductsInput } from './dto/get-out-of-stock-products.input';
import { GetAllInvoicesInput } from './dto/get-all-invoices.input';
import { CreateInvoiceInput } from './dto/create-invoice.input';

@Resolver(() => Invoice)
export class InvoiceResolver {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Mutation(() => Invoice)
  createInvoice(@Args('createInvoiceInput') createInvoiceInput: CreateInvoiceInput) {
    return this.invoiceService.createInvoice(createInvoiceInput);
  }

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

  @Query(() => InvoicePagination, { name: 'getAllInvoices' })
  getAllInvoices(@Args('getAllInvoicesInput') getAllInvoicesInput: GetAllInvoicesInput) {
    return this.invoiceService.getAllInvoices(getAllInvoicesInput);
  }
} 
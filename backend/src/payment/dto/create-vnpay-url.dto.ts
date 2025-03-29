import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateVNPayUrlDto {
  @IsNotEmpty()
  @IsString()
  invoiceId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  orderInfo: string;
} 
import { Injectable } from '@nestjs/common';
import { CreateShopAddressInput } from './dto/create-shop-address.input';
import { UpdateShopAddressInput } from './dto/update-shop-address.input';

@Injectable()
export class ShopAddressService {
  create(createShopAddressInput: CreateShopAddressInput) {
    return 'This action adds a new shopAddress';
  }

  findAll() {
    return `This action returns all shopAddress`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shopAddress`;
  }

  update(id: number, updateShopAddressInput: UpdateShopAddressInput) {
    return `This action updates a #${id} shopAddress`;
  }

  remove(id: number) {
    return `This action removes a #${id} shopAddress`;
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Product_status } from '@prisma/client';

describe('ProductService', () => {
  let service: ProductService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockProduct = {
    product_id: 1,
    product_name: 'Test Product',
    brand: 'Test Brand',
    status: 'active',
    category_id: 1,
    product_detail_id: 1,
    shop_id: 'shop1',
    created_at: new Date(),
    updated_at: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createInput = {
        product_name: 'Test Product',
        brand: 'Test Brand',
        status: Product_status.active,
        category_id: 1,
        product_detail_id: 1,
        shop_id: 'shop1'
      };
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createInput);
      expect(result).toEqual(mockProduct);
    });

    it('should throw ConflictException when product exists', async () => {
      const createInput = {
        product_name: 'Test Product',
        brand: 'Test Brand',
        status: Product_status.active,
        category_id: 1,
        product_detail_id: 1,
        shop_id: 'shop1'
      };
      mockPrismaService.product.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(createInput)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return array of products', async () => {
      const paginationArgs = { page: 1, limit: 10 };
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      const result = await service.findAll(paginationArgs);
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should find one product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      const result = await service.findOne(1);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateInput = {
        product_id: 1,
        product_name: 'Updated Product',
        brand: 'Updated Brand',
        status: Product_status.inactive,
        category_id: 2
      };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        ...updateInput
      });

      const result = await service.update(1, updateInput);
      expect(result.product_name).toBe('Updated Product');
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      const updateInput = {
        product_id: 999,
        product_name: 'Updated Product',
        brand: 'Updated Brand',
        status: Product_status.inactive,
        category_id: 2
      };

      await expect(service.update(999, updateInput)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove(1);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when removing non-existent product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});

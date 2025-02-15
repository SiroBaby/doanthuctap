import { Test, TestingModule } from '@nestjs/testing';
import { ProductDetailService } from './product-detail.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProductDetailService', () => {
  let service: ProductDetailService;

  const mockPrismaService = {
    product_Detail: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockProductDetail = {
    product_detail_id: 1,
    description: 'Test Description',
    specifications: 'Test Specs',
    create_at: new Date(),
    update_at: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductDetailService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductDetailService>(ProductDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product detail successfully', async () => {
      const createInput = {
        description: 'Test Description',
        specifications: 'Test Specs'
      };
      mockPrismaService.product_Detail.create.mockResolvedValue(mockProductDetail);

      const result = await service.create(createInput);
      expect(result).toEqual(mockProductDetail);
    });

    it('should throw ConflictException when product detail exists', async () => {
      const createInput = {
        description: 'Test Description',
        specifications: 'Test Specs'
      };
      mockPrismaService.product_Detail.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(createInput)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return array of product details', async () => {
      mockPrismaService.product_Detail.findMany.mockResolvedValue([mockProductDetail]);
      const result = await service.findAll();
      expect(result).toEqual([mockProductDetail]);
    });
  });

  describe('findOne', () => {
    it('should find one product detail', async () => {
      mockPrismaService.product_Detail.findUnique.mockResolvedValue(mockProductDetail);
      const result = await service.findOne(1);
      expect(result).toEqual(mockProductDetail);
    });

    it('should throw NotFoundException when product detail not found', async () => {
      mockPrismaService.product_Detail.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product detail', async () => {
      const updateInput = {
        product_detail_id: 1,
        description: 'Updated Description'
      };
      mockPrismaService.product_Detail.findUnique.mockResolvedValue(mockProductDetail);
      mockPrismaService.product_Detail.update.mockResolvedValue({
        ...mockProductDetail,
        ...updateInput
      });

      const result = await service.update(1, updateInput);
      expect(result.description).toBe('Updated Description');
    });
  });

  describe('remove', () => {
    it('should remove a product detail', async () => {
      mockPrismaService.product_Detail.findUnique.mockResolvedValue(mockProductDetail);
      mockPrismaService.product_Detail.delete.mockResolvedValue(mockProductDetail);

      const result = await service.remove(1);
      expect(result).toEqual(mockProductDetail);
    });
  });
});

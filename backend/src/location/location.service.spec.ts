import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { PrismaService } from '../prisma.service';
import { ConflictException } from '@nestjs/common';

describe('LocationService', () => {
  let service: LocationService;

  const mockPrismaService = {
    location: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockLocation = {
    location_id: 'loc1',
    location_name: 'Test Location'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a location successfully', async () => {
      const createInput = {
        location_id: 'loc1',
        location_name: 'Test Location'
      };
      mockPrismaService.location.create.mockResolvedValue(mockLocation);

      const result = await service.create(createInput);
      expect(result).toEqual(mockLocation);
      expect(mockPrismaService.location.create).toHaveBeenCalledWith({
        data: createInput,
      });
    });

    it('should throw ConflictException when location exists', async () => {
      const createInput = {
        location_id: 'loc1',
        location_name: 'Test Location'
      };
      mockPrismaService.location.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(createInput)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return array of locations', async () => {
      const locations = [mockLocation];
      mockPrismaService.location.findMany.mockResolvedValue(locations);

      const result = await service.findAll();
      expect(result).toEqual(locations);
    });
  });

  describe('findOne', () => {
    it('should find one location by id', async () => {
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);

      const result = await service.findOne('loc1');
      expect(result).toEqual(mockLocation);
      expect(mockPrismaService.location.findUnique).toHaveBeenCalledWith({
        where: { location_id: 'loc1' },
      });
    });
  });

  describe('update', () => {
    it('should update a location', async () => {
      const updateInput = {
        location_id: 'loc1',
        location_name: 'Updated Location'
      };
      const updatedLocation = { ...mockLocation, location_name: 'Updated Location' };
      mockPrismaService.location.update.mockResolvedValue(updatedLocation);

      const result = await service.update('loc1', updateInput);
      expect(result).toEqual(updatedLocation);  // Kiểm tra kết quả trả về
      expect(mockPrismaService.location.update).toHaveBeenCalledWith({
        where: { location_id: 'loc1' },
        data: updateInput,
      });
    });

    it('should throw ConflictException when updating to existing location', async () => {
      const updateInput = {
        location_id: 'loc1',
        location_name: 'Updated Location'
      };
      mockPrismaService.location.update.mockRejectedValue({ code: 'P2002' });

      await expect(service.update('loc1', updateInput)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a location', async () => {
      mockPrismaService.location.delete.mockResolvedValue(mockLocation);

      const result = await service.remove('loc1');
      expect(result).toEqual(mockLocation);
      expect(mockPrismaService.location.delete).toHaveBeenCalledWith({
        where: { location_id: 'loc1' },
      });
    });
  });
});

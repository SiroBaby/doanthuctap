import { Test, TestingModule } from '@nestjs/testing';
import { LocationResolver } from './location.resolver';
import { LocationService } from './location.service';
import { CreateLocationInput } from './dto/create-location.input';
import { UpdateLocationInput } from './dto/update-location.input';

describe('LocationResolver', () => {
  let resolver: LocationResolver;

  const mockLocationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockLocation = {
    location_id: 'loc1',
    location_name: 'Test Location'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationResolver,
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
      ],
    }).compile();

    resolver = module.get<LocationResolver>(LocationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createLocation', () => {
    it('should create a location successfully', async () => {
      const createInput: CreateLocationInput = {
        location_id: 'loc1',
        location_name: 'Test Location'
      };
      mockLocationService.create.mockResolvedValue(mockLocation);

      const result = await resolver.createLocation(createInput);
      expect(result).toEqual(mockLocation);
      expect(mockLocationService.create).toHaveBeenCalledWith(createInput);
    });
  });

  describe('findAll', () => {
    it('should return array of locations', async () => {
      const locations = [mockLocation];
      mockLocationService.findAll.mockResolvedValue(locations);

      const result = await resolver.findAll();
      expect(result).toEqual(locations);
      expect(mockLocationService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find one location by id', async () => {
      mockLocationService.findOne.mockResolvedValue(mockLocation);

      const result = await resolver.findOne('loc1');
      expect(result).toEqual(mockLocation);
      expect(mockLocationService.findOne).toHaveBeenCalledWith('loc1');
    });
  });

  describe('updateLocation', () => {
    it('should update a location', async () => {
      const updateInput: UpdateLocationInput = {
        location_id: 'loc1',
        location_name: 'Updated Location'
      };
      const updatedLocation = { ...mockLocation, location_name: 'Updated Location' };
      mockLocationService.update.mockResolvedValue(updatedLocation);

      const result = await resolver.updateLocation(updateInput);
      expect(result).toEqual(updatedLocation);
      expect(mockLocationService.update).toHaveBeenCalledWith('loc1', updateInput);
    });
  });

  describe('removeLocation', () => {
    it('should remove a location', async () => {
      mockLocationService.remove.mockResolvedValue(mockLocation);

      const result = await resolver.removeLocation('loc1');
      expect(result).toEqual(mockLocation);
      expect(mockLocationService.remove).toHaveBeenCalledWith('loc1');
    });
  });
});

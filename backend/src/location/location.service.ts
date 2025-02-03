import { Injectable, ConflictException } from '@nestjs/common';
import { CreateLocationInput } from './dto/create-location.input';
import { UpdateLocationInput } from './dto/update-location.input';
import { PrismaService } from '../prisma.service';  // Sửa đường dẫn này
import { Location } from './entities/location.entity';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) { }

  async create(createLocationInput: CreateLocationInput) {
    try {
      return await this.prisma.location.create({
        data: createLocationInput,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Location already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Location[]> {
    return this.prisma.location.findMany();
  }

  findOne(id: string) {
    return this.prisma.location.findUnique({
      where: {
        location_id: id,
      },
    });
  }

  async update(location_id: string, updateLocationInput: UpdateLocationInput) {
    try {
      return await this.prisma.location.update({
        where: {
          location_id: location_id,
        },
        data: updateLocationInput,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Location already exists');
      }
      throw error;
    }
  }

  remove(id: string) {
    return this.prisma.location.delete({
      where: {
        location_id: id,
      },
    });
  }
}

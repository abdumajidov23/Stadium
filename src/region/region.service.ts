import { Injectable } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Region } from './model/region.model';
import { Country } from '../country/model/country.model';

@Injectable()
export class RegionService {
  constructor(@InjectModel(Region) private regionModel: typeof Region) {}

  async create(createRegionDto: CreateRegionDto) {
    const new_region = await this.regionModel.create(createRegionDto);
    return new_region;
  }

  findAll() {
    return this.regionModel.findAll({
      include: [{ model: Country, attributes: ['name'] }],
    });
  }

  findOne(id: number) {
    return this.regionModel.findByPk(id, {
      include: [{ model: Country, attributes: ['name'] }],
    });
  }

  async update(id: number, updateRegionDto: UpdateRegionDto) {
    const is_available = await this.regionModel.findByPk(id);
    if (!is_available) {
      return { message: 'Update object is not found' };
    }
    const updated_region = await this.regionModel.update(updateRegionDto, {
      where: { id },
      returning: true,
    });
    return updated_region[1][0];
  }

  remove(id: number) {
    return this.regionModel.destroy({ where: { id } });
  }
}

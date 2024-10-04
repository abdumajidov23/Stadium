import { Injectable } from '@nestjs/common';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { InjectModel } from '@nestjs/sequelize';
import { District } from './model/district.model';
import { Region } from '../region/model/region.model';

@Injectable()
export class DistrictService {
  constructor(@InjectModel(District) private districtModel: typeof District) {}

  async create(createDistrictDto: CreateDistrictDto) {
    const new_district = await this.districtModel.create(createDistrictDto);
    return new_district;
  }

  findAll() {
    return this.districtModel.findAll({
      include: [{ model: Region, attributes: ['name'] }],
    });
  }

  findOne(id: number) {
    return this.districtModel.findByPk(id, {
      include: [{ model: Region, attributes: ['name'] }],
    });
  }

  async update(id: number, updateDistrictDto: UpdateDistrictDto) {
    const is_available = await this.districtModel.findByPk(id);
    if (!is_available) {
      return { message: 'Update object is not found' };
    }
    const updated_district = await this.districtModel.update(
      updateDistrictDto,
      {
        where: { id },
        returning: true,
      },
    );
    return updated_district[1][0];
  }

  remove(id: number) {
    return this.districtModel.destroy({ where: { id } });
  }
}

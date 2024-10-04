import { Injectable } from '@nestjs/common';
import { CreateComfortDto } from './dto/create-comfort.dto';
import { UpdateComfortDto } from './dto/update-comfort.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Comfort } from './model/comfort.model';

@Injectable()
export class ComfortService {
  constructor(@InjectModel(Comfort) private comfortModel: typeof Comfort) {}

  async create(createComfortDto: CreateComfortDto) {
    const new_comfort = await this.comfortModel.create(createComfortDto);
    return new_comfort;
  }

  findAll() {
    return this.comfortModel.findAll();
  }

  findOne(id: number) {
    return this.comfortModel.findByPk(id);
  }

  async update(id: number, updateComfortDto: UpdateComfortDto) {
    const is_available = await this.comfortModel.findByPk(id);
    if (!is_available) {
      return { message: 'Update object not found' };
    }
    const updated_comfort = await this.comfortModel.update(updateComfortDto, {
      where: { id },
      returning: true,
    });
    return updated_comfort;
  }

  remove(id: number) {
    return this.comfortModel.destroy({ where: { id } });
  }
}

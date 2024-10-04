import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Country } from './model/country.model';
import { Region } from '../region/model/region.model';

@Injectable()
export class CountryService {
  constructor(@InjectModel(Country) private countryModel: typeof Country) {}

  async create(createCountryDto: CreateCountryDto) {
    const new_country = await this.countryModel.create(createCountryDto);
    return new_country;
  }

  findAll() {
    return this.countryModel.findAll({
      include: [{ model: Region, attributes: ['name'] }],
    });
  }

  findOne(id: number) {
    return this.countryModel.findByPk(id, {
      include: [{ model: Region, attributes: ['name'] }],
    });
  }

  async update(id: number, updateCountryDto: UpdateCountryDto) {
    const is_available = await this.countryModel.findByPk(id);
    if (!is_available) {
      return { message: 'Update object not found' };
    }
    const updated_country = await this.countryModel.update(updateCountryDto, {
      where: { id },
      returning: true,
    });
    return updated_country[1][0];
  }

  remove(id: number) {
    return this.countryModel.destroy({ where: { id } });
  }
}

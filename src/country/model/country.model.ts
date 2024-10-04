import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Region } from '../../region/model/region.model';

interface ICountryCreationAttr {
  name: string;
}

@Table({ tableName: 'country', timestamps: false, underscored: true })
export class Country extends Model<Country, ICountryCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @HasMany(() => Region)
  regions: Region[];
}

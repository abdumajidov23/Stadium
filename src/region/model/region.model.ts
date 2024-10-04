import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Country } from '../../country/model/country.model';
import { District } from '../../district/model/district.model';

interface IRegionCreationAttr {
  name: string;
  country_id: number;
}

@Table({ tableName: 'region', timestamps: false })
export class Region extends Model<Region, IRegionCreationAttr> {
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

  @ForeignKey(() => Country)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  country_id: number;

  @BelongsTo(() => Country)
  country: Country;

  @HasMany(() => District)
  districts: District[];
}

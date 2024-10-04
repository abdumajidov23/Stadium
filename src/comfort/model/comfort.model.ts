import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IComfortCreationAttr {
  name: string;
}

@Table({ tableName: 'comfort', timestamps: false })
export class Comfort extends Model<Comfort, IComfortCreationAttr> {
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
}

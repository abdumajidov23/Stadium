import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Bot } from "./bot.model";

interface ICarCreationAttr {
  user_id: number;
  brand: string;
  model: string;
  color: string;
  year: number;
  licence_plate: string;
  current_status: string;
}

@Table({ tableName: "cars", updatedAt: false })
export class Car extends Model<Car, ICarCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Bot)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  user_id: number;

  @Column({ type: DataType.STRING })
  brand: string;

  @Column({ type: DataType.STRING })
  model: string;

  @Column({ type: DataType.STRING })
  color: string;

  @Column({ type: DataType.INTEGER })
  year: number;

  @Column({ type: DataType.STRING })
  licence_plate: string;

  @Column({ type: DataType.STRING })
  current_status: string;
}

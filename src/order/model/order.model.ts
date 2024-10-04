import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "../../users/model/user.model";

interface IOrderAttr {
  description: string;
  status: string;
  date: string;
}

@Table({ tableName: "order" })
export class Order extends Model<Order, IOrderAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  description: string;

  @Column({ type: DataType.ENUM("paid", "unpaid"), defaultValue: "unpaid" })
  status: string;

  @Column({
    type: DataType.DATE,
  })
  date: Date;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  user_id: number;

  @BelongsTo(() => User)
  user: User;
}

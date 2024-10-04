import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "../../users/model/user.model";

interface IUserCardCreationAttr {
  user_id: number;
  card_name: string;
  number: string;
  year: number;
  month: number;
  is_active: boolean;
  is_main: boolean;
}

@Table({ tableName: "user_card", timestamps: false })
export class UserCard extends Model<UserCard, IUserCardCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  card_name: string;

  // can one several users register one card.
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  number: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  year: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  month: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_active: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_main: boolean;

  @BelongsTo(() => User)
  user: User;
}

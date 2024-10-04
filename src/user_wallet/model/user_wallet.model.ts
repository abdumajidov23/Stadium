import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "../../users/model/user.model";

interface IUserWalletCreationAttr {
  user_id: number;
  wallet: string;
}

@Table({ tableName: "user_wallet", timestamps: false })
export class UserWallet extends Model<UserWallet, IUserWalletCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  waller: string;

  @BelongsTo(() => User)
  user: User;
}

import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IAdminCreationAttr {
  username: string;
  hashed_password: string;
  telegram_link: string;
  photo: string;
}

@Table({ tableName: "admin" })
export class Admin extends Model<Admin, IAdminCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  username: string;

  @Column({ type: DataType.STRING, allowNull: false })
  hashed_password: string;

  @Column({ type: DataType.STRING, allowNull: false })
  telegram_link: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: "photo.jpeg",
  })
  photo: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_active: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_creator: boolean;

  @Column({ type: DataType.STRING })
  hashed_refresh_token: string;
}

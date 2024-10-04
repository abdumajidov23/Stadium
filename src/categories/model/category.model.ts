import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

interface ICategoryCreationAttr {
  name: string;
  parent_id: number;
}

@Table({ tableName: 'category', timestamps: false })
export class Category extends Model<Category, ICategoryCreationAttr> {
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

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  parent_id: number;

  @BelongsTo(() => Category, { as: 'parent' })
  category: Category;

  @HasMany(() => Category, { as: 'child' })
  categories: Category[];
}

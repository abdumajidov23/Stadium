import { Injectable } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Category } from "./model/category.model";

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category) private categoryModel: typeof Category) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const new_category = await this.categoryModel.create(createCategoryDto);
    return new_category;
  }

  findAll() {
    return this.categoryModel.findAll({
      include: [
        // { model: Category, as: "children", attributes: ["name"] },
        { model: Category, as: "parent", attributes: ["name"] },
      ],
    });
  }

  findOne(id: number) {
    return this.categoryModel.findByPk(id, {
      include: [
        // { model: Category, as: "children", attributes: ["name"] },
        { model: Category, as: "parent", attributes: ["name"] },
      ],
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const is_available = await this.categoryModel.findByPk(id);
    if (!is_available) {
      return { message: "Update object is not found" };
    }
    const updated_category = await this.categoryModel.update(
      updateCategoryDto,
      { where: { id }, returning: true },
    );
    return updated_category[1][0];
  }

  remove(id: number) {
    return this.categoryModel.destroy({ where: { id } });
  }
}

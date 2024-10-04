import { Injectable } from "@nestjs/common";
import { CreateUserCardDto } from "./dto/create-user_card.dto";
import { UpdateUserCardDto } from "./dto/update-user_card.dto";
import { InjectModel } from "@nestjs/sequelize";
import { UserCard } from "./model/user_card.model";
import { User } from "../users/model/user.model";

@Injectable()
export class UserCardService {
  constructor(@InjectModel(UserCard) private usercardModel: typeof UserCard) {}

  async create(createUserCardDto: CreateUserCardDto) {
    const new_user_card = await this.usercardModel.create(createUserCardDto);
    return new_user_card;
  }

  findAll() {
    return this.usercardModel.findAll({
      include: [{ model: User, attributes: ["full_name", "phone"] }],
    });
  }

  findOne(id: number) {
    return this.usercardModel.findByPk(id, {
      include: [{ model: User, attributes: ["full_name", "phone"] }],
    });
  }

  async update(id: number, updateUserCardDto: UpdateUserCardDto) {
    const is_available = await this.usercardModel.findByPk(id);
    if (!is_available) {
      return { message: "Update object not found" };
    }
    const updated_usercard = await this.usercardModel.update(
      updateUserCardDto,
      { where: { id }, returning: true },
    );
    return updated_usercard[1][0];
  }

  remove(id: number) {
    return this.usercardModel.destroy({ where: { id } });
  }
}

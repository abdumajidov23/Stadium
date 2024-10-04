import { Injectable } from "@nestjs/common";
import { CreateUserWalletDto } from "./dto/create-user_wallet.dto";
import { UpdateUserWalletDto } from "./dto/update-user_wallet.dto";
import { InjectModel } from "@nestjs/sequelize";
import { UserWallet } from "./model/user_wallet.model";
import { User } from "../users/model/user.model";

@Injectable()
export class UserWalletService {
  constructor(
    @InjectModel(UserWallet) private userwalletModel: typeof UserWallet,
  ) {}

  async create(createUserWalletDto: CreateUserWalletDto) {
    const new_wallet = await this.userwalletModel.create(createUserWalletDto);
    return new_wallet;
  }

  findAll() {
    return this.userwalletModel.findAll({
      include: [{ model: User, attributes: ["full_name", "phone"] }],
    });
  }

  findOne(id: number) {
    return this.userwalletModel.findByPk(id, {
      include: [{ model: User, attributes: ["full_name", "phone"] }],
    });
  }

  async update(id: number, updateUserWalletDto: UpdateUserWalletDto) {
    const is_available = await this.userwalletModel.findByPk(id);
    if (!is_available) {
      return { message: "User object not found" };
    }
    const updated_wallet = await this.userwalletModel.update(
      updateUserWalletDto,
      { where: { id }, returning: true },
    );
    return updated_wallet[1][0];
  }

  remove(id: number) {
    return this.userwalletModel.destroy({ where: { id } });
  }
}

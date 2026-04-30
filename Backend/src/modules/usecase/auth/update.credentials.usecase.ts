import { UserRepository } from "../../repository/auth/user.repository";
// import { UpdateCredentialsUsecase } from "../../usecase/user/updateCredentials.usecase";

interface UpdateCredentialsDTO {
  name?: string;
  phone?: string;
  designation?: string;
}

export class UpdateCredentialsUsecase {
  constructor(private repo: UserRepository) {}

  async execute(userId: number, data: UpdateCredentialsDTO) {
    if (!userId) {
      throw new Error("Unauthorized have not id");
    }

    const user = await this.repo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this.repo.updateUser(userId, data);
  }
}

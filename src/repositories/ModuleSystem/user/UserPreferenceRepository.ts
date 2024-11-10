import { UserPreferenceModel } from "@entities/ModuleSystem/UserPreferenceModel";
import { BaseRepository, IBaseRepository } from "@providers/database/repository/BaseRepository";
import { RepositoryFactory } from "@providers/database/repository/RepositoryFactory";
import { IUserPreferences, userPreferencesSchema } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(UserPreferenceRepository)
export class UserPreferenceRepository
  extends BaseRepository<IUserPreferences>
  implements IBaseRepository<IUserPreferences>
{
  constructor(
    private repositoryFactory: RepositoryFactory,
    private userPreferenceModel: UserPreferenceModel
  ) {
    super(
      repositoryFactory.createRepository<IUserPreferences>(
        userPreferenceModel.initializeData(userPreferencesSchema),
        userPreferencesSchema
      )
    );
  }

  public async getUserPreferences(userId: string): Promise<IUserPreferences | null> {
    return await this.findBy({ userId });
  }

  public async updateUserPreferences(
    userId: string,
    preferences: Partial<IUserPreferences>
  ): Promise<IUserPreferences | null> {
    return await this.updateBy({ userId }, preferences);
  }

  public async createUserPreferences(
    userId: string,
    preferences: Partial<IUserPreferences>
  ): Promise<IUserPreferences> {
    return await this.create(
      { ...preferences, userId },
      {
        uniqueByKeys: ["userId"],
      }
    );
  }

  public async deleteUserPreferences(userId: string): Promise<boolean> {
    const userPreference = await this.getUserPreferences(userId);

    if (!userPreference) {
      throw new Error("User preferences not found");
    }

    return await this.delete(userPreference.id);
  }
}

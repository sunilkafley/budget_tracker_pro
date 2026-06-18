import { Income } from "../../domain/models/Income";
import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";

export class UpdateIncomeUseCase {
  constructor(private readonly incomeRepository: IIncomeRepository) {}

  async execute(income: Income): Promise<void> {
    await this.incomeRepository.update(income);
  }
}

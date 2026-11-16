import { Income } from "../../domain/models/Income";
import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";

export class GetAllIncomesUseCase {
  constructor(private readonly incomeRepository: IIncomeRepository) {}

  async execute(): Promise<Income[]> {
    return this.incomeRepository.getAll();
  }
}

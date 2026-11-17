import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";

export class DeleteIncomeUseCase {
  constructor(private readonly incomeRepository: IIncomeRepository) {}

  async execute(id: string): Promise<void> {
    await this.incomeRepository.delete(id);
  }
}

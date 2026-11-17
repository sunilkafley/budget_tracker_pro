import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";

export class GetIncomeByIdUseCase {
  constructor(private readonly repository: IIncomeRepository) {}

  async execute(id: string) {
    const income = await this.repository.getById(id);
    if (!income) throw new Error("Income not found");
    return income;
  }
}

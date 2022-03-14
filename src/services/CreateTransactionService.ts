import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && value > total) {
      throw new AppError(
        'Should not be able to create outcome transaction without a valid balance',
      );
    }

    let category1 = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!category1) {
      category1 = categoryRepository.create({ title: category });

      await categoryRepository.save(category1);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: category1,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

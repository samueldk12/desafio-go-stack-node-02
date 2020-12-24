// import AppError from '../errors/AppError';
import {getCustomRepository, getRepository} from 'typeorm';

import Transaction from '../models/Transaction';
import transactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request{
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category
  } : Request): Promise<Transaction> {
    const transactionsRepositories = getCustomRepository(transactionsRepository);

    const categoriesRepository = getRepository(Category);


    const { total } = await transactionsRepositories.getBalance();

    if(type == 'outcome' && total < value){
      throw new AppError('You do not have enough balance');
    }


    let transactionCategory = await categoriesRepository.findOne({
      where:{
        title: category,
      }
    });
    
    if(!transactionCategory){
      transactionCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(transactionCategory);
    }

    const transaction = transactionsRepositories.create({
      title,
      type,
      value,
      category: transactionCategory
    });

    await transactionsRepositories.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

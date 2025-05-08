import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    return await this.prisma.book.create({
      data: createBookDto,
    });
  }

  async findAll(query: {
    search?: string;
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const { search = '', sort = 'asc', page = 1, limit = 10 } = query;

    const skip = (page - 1) * limit;

    const books = await this.prisma.book.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        name: sort,
      },
      skip,
      take: limit,
      include: {
        author: true,
      },
    });

    const total = await this.prisma.book.count({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    return {
      data: books,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findFirst({
      where: { id },
      include: {
        author: true,
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    await this.findOne(id);

    return await this.prisma.book.update({
      where: { id },
      data: updateBookDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.prisma.book.delete({
      where: { id },
    });
  }
}

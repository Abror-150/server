import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuthorDto: CreateAuthorDto) {
    return await this.prisma.author.create({
      data: createAuthorDto,
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

    const authors = await this.prisma.author.findMany({
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
    });

    const total = await this.prisma.author.count({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    return {
      data: authors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const one = await this.prisma.author.findFirst({
      where: { id },
      include: { book: true },
    });

    if (!one) {
      throw new NotFoundException(`author with id ${id} not found`);
    }

    return one;
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    await this.findOne(id);

    return await this.prisma.author.update({
      where: { id },
      data: updateAuthorDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.prisma.author.delete({
      where: { id },
    });
  }
}

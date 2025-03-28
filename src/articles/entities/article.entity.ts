import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Tag } from './tag.entity';
import { User } from '@/user/entiries/user.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: true })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.articles, { onDelete: 'CASCADE' })
  author: User;

  @ManyToMany(() => Tag, (tag) => tag.articles, { cascade: true })
  @JoinTable({ name: 'article_tags' })
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

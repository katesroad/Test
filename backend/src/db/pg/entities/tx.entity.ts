import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TxEntity {
  @PrimaryGeneratedColumn()
  id: number;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'countries' })
export class CountryEntity {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name!: string;
}

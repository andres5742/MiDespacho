import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CargaLote } from './carga-lote.entity';

export enum ExpedienteEstado {
  ABIERTO = 'ABIERTO',
  EN_PROCESO = 'EN_PROCESO',
  CERRADO = 'CERRADO',
}

@Entity({ name: 'expedientes' })
export class Expediente {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 80 })
  numero!: string;

  @Column({ type: 'varchar', length: 140 })
  clienteNombre!: string;

  @Column({ type: 'enum', enum: ExpedienteEstado, default: ExpedienteEstado.ABIERTO })
  estado!: ExpedienteEstado;

  @Column({ type: 'date', nullable: true })
  fechaApertura!: string | null;

  @Column({ type: 'date', nullable: true })
  fechaCierre!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => CargaLote, (l) => l.expediente)
  lotes!: CargaLote[];
}


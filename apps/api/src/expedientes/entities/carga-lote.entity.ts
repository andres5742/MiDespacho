import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Expediente } from './expediente.entity';
import { ArchivoExpediente } from './archivo-expediente.entity';

@Entity({ name: 'expediente_cargas' })
export class CargaLote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Expediente, (e) => e.lotes, { onDelete: 'CASCADE' })
  expediente!: Expediente;

  @Column({ type: 'varchar', length: 120 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => ArchivoExpediente, (a) => a.lote)
  archivos!: ArchivoExpediente[];
}


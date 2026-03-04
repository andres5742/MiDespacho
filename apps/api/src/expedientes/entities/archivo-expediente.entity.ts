import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CargaLote } from './carga-lote.entity';

@Entity({ name: 'expediente_archivos' })
export class ArchivoExpediente {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CargaLote, (l) => l.archivos, { onDelete: 'CASCADE' })
  lote!: CargaLote;

  @Column({ type: 'varchar', length: 255 })
  originalName!: string;

  @Column({ type: 'varchar', length: 255 })
  storedName!: string;

  @Column({ type: 'varchar', length: 255 })
  mimeType!: string;

  @Column({ type: 'bigint' })
  sizeBytes!: string;

  @Column({ type: 'text' })
  storagePath!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}


import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OtpCode {

    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column()
    phone: string;

    @Column()
    code: string;

    @Column({ type: "timestamp" })
    expiresAt: Date;

    @Column({ default: false })
    used: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at?: Date;
}

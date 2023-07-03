import { CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Individual } from "./individual";

@Entity('client_session')
export class ClientSession {
    
    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at?: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at?: Date;

    @OneToOne(() => Individual)
    @JoinColumn()
    public individual: Individual
}
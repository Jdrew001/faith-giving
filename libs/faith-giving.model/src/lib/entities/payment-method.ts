import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Individual } from "./individual";

@Entity()
export class PaymentMethod {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    paymentMethodId: string;

    @Column({ nullable: true })
    brand: string;

    @Column({ nullable: true })
    last4: string;

    @Column({ nullable: true })
    expMonth: number;

    @Column({ nullable: true })
    expYear: number;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at?: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at?: Date;


    @ManyToOne(() => Individual, (individual) => individual.paymentMethods, {nullable: true})
    individual: Individual;
}
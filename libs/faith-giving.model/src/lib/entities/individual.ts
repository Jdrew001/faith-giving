import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Giving } from "./giving";
import { PaymentMethod } from "./payment-method";

@Entity()
export class Individual {

    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @OneToMany(() => Giving, (giving) => giving.individual)
    givings?: Array<Giving>;

    @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.individual)
    paymentMethods?: Array<PaymentMethod>;
}
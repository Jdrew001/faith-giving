import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Individual } from "./individual";

@Entity()
export class PaymentMethod {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    paymentId: string;

    @ManyToOne(() => Individual, (individual) => individual.paymentMethods, {nullable: true})
    individual: Individual;
}
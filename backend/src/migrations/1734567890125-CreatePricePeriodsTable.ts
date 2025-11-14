import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePricePeriodsTable1734567890125 implements MigrationInterface {
    name = 'CreatePricePeriodsTable1734567890125'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "price_period" (
                "id" SERIAL NOT NULL,
                "productId" integer NOT NULL,
                "startDate" TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP NOT NULL,
                "price" numeric NOT NULL,
                "name" character varying,
                CONSTRAINT "PK_price_period" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "price_period"
            ADD CONSTRAINT "FK_price_period_product"
            FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_period" DROP CONSTRAINT "FK_price_period_product"`);
        await queryRunner.query(`DROP TABLE "price_period"`);
    }
}

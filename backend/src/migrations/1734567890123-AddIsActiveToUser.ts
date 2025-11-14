import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToUser1734567890123 implements MigrationInterface {
    name = 'AddIsActiveToUser1734567890123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isActive"`);
    }
}

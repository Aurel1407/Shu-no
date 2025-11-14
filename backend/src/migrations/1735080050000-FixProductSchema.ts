import { MigrationInterface, QueryRunner } from "typeorm";

export class FixProductSchema1735080050000 implements MigrationInterface {
    name = 'FixProductSchema1735080050000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Modifier la colonne price pour éviter les conflits de type
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "price" TYPE double precision USING price::double precision`);
        
        // Modifier les colonnes latitude et longitude pour éviter les conflits de type
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "latitude" TYPE double precision USING latitude::double precision`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "longitude" TYPE double precision USING longitude::double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revenir aux types précédents
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "longitude" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "latitude" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "price" TYPE numeric`);
    }
}

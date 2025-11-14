import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateRefreshTokensTable1735080100000 implements MigrationInterface {
    name = 'CreateRefreshTokensTable1735080100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer la table refresh_token
        await queryRunner.createTable(new Table({
            name: "refresh_token",
            columns: [
                {
                    name: "id",
                    type: "serial",
                    isPrimary: true,
                },
                {
                    name: "token",
                    type: "varchar",
                    length: "255",
                    isUnique: true,
                },
                {
                    name: "userId",
                    type: "int",
                },
                {
                    name: "expiresAt",
                    type: "timestamp",
                },
                {
                    name: "ipAddress",
                    type: "varchar",
                    length: "45",
                    isNullable: true,
                },
                {
                    name: "userAgent",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "isRevoked",
                    type: "boolean",
                    default: false,
                },
                {
                    name: "revokedAt",
                    type: "timestamp",
                    isNullable: true,
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()",
                },
            ],
        }), true);

        // Créer les indexes
        await queryRunner.createIndex("refresh_token", new TableIndex({
            name: "IDX_refresh_token_token",
            columnNames: ["token"]
        }));

        await queryRunner.createIndex("refresh_token", new TableIndex({
            name: "IDX_refresh_token_userId",
            columnNames: ["userId"]
        }));

        // Créer la clé étrangère vers la table user
        await queryRunner.createForeignKey("refresh_token", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer la table refresh_token (les indexes et clés étrangères seront supprimés automatiquement)
        await queryRunner.dropTable("refresh_token");
    }
}

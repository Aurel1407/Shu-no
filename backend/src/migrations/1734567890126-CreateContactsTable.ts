import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateContactsTable1734567890126 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "contact",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "firstName",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
                    },
                    {
                        name: "lastName",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
                    },
                    {
                        name: "email",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                    },
                    {
                        name: "subject",
                        type: "varchar",
                        length: "100",
                        isNullable: false,
                    },
                    {
                        name: "message",
                        type: "text",
                        isNullable: false,
                    },
                    {
                        name: "isRead",
                        type: "boolean",
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("contact");
    }
}

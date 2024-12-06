import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdIndexToProducts1733435273949
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_products_userId" ON "products" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_products_userId"`);
  }
}

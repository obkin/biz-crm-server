import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsArchivedToOrder1234567890123 implements MigrationInterface {
  name = 'AddIsArchivedToOrder1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ADD "isArchived" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "isArchived"`);
  }
}

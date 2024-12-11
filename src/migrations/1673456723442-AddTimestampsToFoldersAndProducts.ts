import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToFoldersAndProducts1673456723442
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
      ADD "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE "folders" 
      ADD "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
      ADD "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "products" DROP COLUMN "createdAt"');
    await queryRunner.query('ALTER TABLE "products" DROP COLUMN "updatedAt"');

    await queryRunner.query('ALTER TABLE "folders" DROP COLUMN "createdAt"');
    await queryRunner.query('ALTER TABLE "folders" DROP COLUMN "updatedAt"');
  }
}

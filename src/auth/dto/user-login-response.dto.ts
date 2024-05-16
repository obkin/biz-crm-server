import { ApiProperty } from '@nestjs/swagger';

export class UserLoginResponseDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'john_dope@gmail.com' })
  email: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MjYzM2I5OTJiOWMxY2QwOWY5NjQ2ZCIsImVtYWlsIjoiam9obl9kb3BlQGdtYWlsLmNvbSIsImlhdCI6MTcxMzc4MDM1OSwiZXhwIjoxNzEzODY2NzU5fQ.vVkFYnTmr_GfWmSOFXzX0Nqd2-qpclMMHHsAdaGMyFk',
  })
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjI2MzNiOTkyYjljMWNkMDlmOTY0NmQiLCJpYXQiOjE3MTM3ODAzNTksImV4cCI6MTcxMzg2Njc1OX0.XseRf9qbFpOVjBRN8P8L7UgBFoKnCilNnbqUbVr6GEw',
  })
  refreshToken: string;
}

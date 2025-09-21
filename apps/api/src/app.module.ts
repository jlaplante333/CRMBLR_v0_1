import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { ContactsModule } from './contacts/contacts.module';
import { DonationsModule } from './donations/donations.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TenantsModule,
    ContactsModule,
    DonationsModule,
    ReportsModule,
  ],
})
export class AppModule {}

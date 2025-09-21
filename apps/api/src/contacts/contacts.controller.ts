import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@ApiTags('contacts')
@Controller('contacts')
@UseGuards(TenantGuard)
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant ID' })
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  async create(@Body() createContactDto: CreateContactDto, @Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.contactsService.create(createContactDto, tenantId, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiResponse({ status: 200, description: 'Contacts retrieved successfully' })
  async findAll(@Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.contactsService.findAll(tenantId, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiResponse({ status: 200, description: 'Contact retrieved successfully' })
  async findOne(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.contactsService.findOne(id, tenantId, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contact' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  async update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto, @Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.contactsService.update(id, updateContactDto, tenantId, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  async remove(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.contactsService.remove(id, tenantId, req.user.sub);
  }
}

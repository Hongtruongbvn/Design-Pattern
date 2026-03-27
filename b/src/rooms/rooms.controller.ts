import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';

import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRole } from 'src/user/schema/user.schema';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo phòng mới (Chỉ Admin)' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả phòng' })
  findAll() {
    return this.roomsService.findAll();
  }

  @Get('theater/:theater')
  @ApiOperation({ summary: 'Lấy phòng theo rạp' })
  findByTheater(@Param('theater') theater: string) {
    return this.roomsService.findByTheater(theater);
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Lấy sơ đồ ghế của phòng' })
  getSeatLayout(@Param('id') id: string) {
    return this.roomsService.getSeatLayout(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết phòng' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật phòng (Chỉ Admin)' })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa phòng (Chỉ Admin)' })
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
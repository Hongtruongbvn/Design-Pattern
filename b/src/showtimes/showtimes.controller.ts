import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShowtimeService } from './showtimes.service';
import { UserRole } from 'src/user/schema/user.schema';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('showtimes')
@Controller('showtimes')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo suất chiếu mới (Chỉ Admin)' })
  create(@Body() createShowtimeDto: CreateShowtimeDto) {
    return this.showtimeService.create(createShowtimeDto);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bắt đầu suất chiếu (Chỉ Admin)' })
  startShowtime(@Param('id') id: string) {
    return this.showtimeService.startShowtime(id);
  }

  @Post(':id/end')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kết thúc suất chiếu (Chỉ Admin)' })
  endShowtime(@Param('id') id: string) {
    return this.showtimeService.endShowtime(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả suất chiếu' })
  findAll() {
    return this.showtimeService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách suất chiếu đang hoạt động' })
  findActive() {
    return this.showtimeService.findActive();
  }

  @Get('movie/:movieId')
  @ApiOperation({ summary: 'Lấy suất chiếu theo phim' })
  findByMovie(@Param('movieId') movieId: string) {
    return this.showtimeService.findByMovie(movieId);
  }

  @Get('theater/:theater')
  @ApiOperation({ summary: 'Lấy suất chiếu theo rạp' })
  findByTheater(@Param('theater') theater: string) {
    return this.showtimeService.findByTheater(theater);
  }

  @Get('date')
  @ApiOperation({ summary: 'Lấy suất chiếu theo ngày' })
  findByDate(@Query('date') date: string) {
    return this.showtimeService.findByDate(new Date(date));
  }

  @Get(':id/available-seats')
  @ApiOperation({ summary: 'Lấy danh sách ghế trống' })
  getAvailableSeats(@Param('id') id: string) {
    return this.showtimeService.getAvailableSeats(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết suất chiếu' })
  findOne(@Param('id') id: string) {
    return this.showtimeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật suất chiếu (Chỉ Admin)' })
  update(@Param('id') id: string, @Body() updateShowtimeDto: UpdateShowtimeDto) {
    return this.showtimeService.update(id, updateShowtimeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa suất chiếu (Chỉ Admin)' })
  remove(@Param('id') id: string) {
    return this.showtimeService.remove(id);
  }
}